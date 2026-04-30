import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { lead_doubts } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import {
  getDefaultTeam,
  upsertContact,
  createOpportunity,
  logActivity,
} from '@/server/services/crm';
import { sendEmail } from '@/server/services/email';
import {
  doubtsAdminNotification,
  doubtsConfirmation,
} from '@/server/services/email-templates';
import { rateLimit, pickIp } from '@/server/lib/rate-limit';
import { verifyTurnstile } from '@/server/services/turnstile';
import {
  attributionInputSchema,
  extractAttributionFromRequest,
  persistAttribution,
  linkAttributionToContact,
} from '@/server/services/marketing-attribution';
import { emailSchema, phoneBrSchema } from '@/lib/validators';

const ADMIN_EMAIL = 'joel@growthmaster.com.br';

const bodySchema = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome (mínimo 2 caracteres).').max(200),
  email: emailSchema.max(320),
  whatsapp: phoneBrSchema,
  duvida: z
    .string()
    .trim()
    .min(10, 'Conta um pouco mais — pelo menos 10 caracteres.')
    .max(1000),
  produto_interesse: z.enum(['vss', 'advisory', 'ambos']),
  landing_page: z.string().max(2000),
  cf_turnstile_token: z.string().optional().nullable(),
  attribution: attributionInputSchema.optional(),
});

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip');
}

/**
 * Resolve pipeline + stage para "lead frio" baseado no produto_interesse.
 * Stage `lead-frio` não existe no seed — usa o primeiro stage open de cada
 * pipeline (`novo` em vss, `aplicacao-recebida` em advisory). Para `ambos`,
 * cria a opp na pipeline VSS (default) já que esse é o produto principal.
 */
function resolvePipelineForDoubts(
  produto: 'vss' | 'advisory' | 'ambos'
): { pipelineSlug: string; stageSlug: string } {
  if (produto === 'advisory') {
    return { pipelineSlug: 'advisory', stageSlug: 'aplicacao-recebida' };
  }
  // 'vss' e 'ambos' — pipeline default
  return { pipelineSlug: 'vss', stageSlug: 'novo' };
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const ip = pickIp(req.headers);

  // Turnstile (dev: bypass automático)
  const ts = await verifyTurnstile(data.cf_turnstile_token, ip);
  if (!ts.valid) {
    return NextResponse.json({ error: 'turnstile_invalid' }, { status: 403 });
  }

  // Rate limit: 5/h por IP+email
  const emailNorm = data.email.trim().toLowerCase();
  const rl = await rateLimit({
    key: `rl:duvidas:${ip}:${emailNorm}`,
    max: 5,
    windowSeconds: 60 * 60,
  });
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'rate_limited', retry_after: retryAfter },
      { status: 429, headers: { 'retry-after': String(retryAfter) } }
    );
  }

  try {
    // 1. Persiste attribution antes de criar contact (pra linkar)
    const attrCtx = await extractAttributionFromRequest(req, {
      ...(data.attribution ?? {}),
    });
    const attributionId = await persistAttribution({
      attribution: attrCtx.attribution,
      geo: attrCtx.geo,
      device: attrCtx.device,
    });

    const team = await getDefaultTeam();

    // 2. Upsert contact
    const contact = await upsertContact({
      teamId: team.id,
      name: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      source: 'form_duvidas',
      produto_interesse: data.produto_interesse,
    });

    await linkAttributionToContact(attributionId, contact.id);

    // 3. Insert lead_doubts
    const doubtId = ulid();
    await db.insert(lead_doubts).values({
      id: doubtId,
      nome: data.nome,
      email: emailNorm,
      whatsapp: data.whatsapp,
      duvida: data.duvida,
      produto_interesse: data.produto_interesse,
      landing_page: data.landing_page,
      contact_id: contact.id,
      attribution_id: attributionId,
      ip: clientIp(req),
      user_agent: req.headers.get('user-agent'),
    });

    // 4. Create opportunity (lead frio — primeiro stage open da pipeline)
    const { pipelineSlug, stageSlug } = resolvePipelineForDoubts(data.produto_interesse);
    const truncatedDuvida =
      data.duvida.length > 80 ? `${data.duvida.slice(0, 77)}…` : data.duvida;

    const opp = await createOpportunity({
      teamId: team.id,
      contactId: contact.id,
      pipelineSlug,
      stageSlug,
      title: `Dúvida (${data.produto_interesse}) – ${data.nome}`,
      metadata: {
        lead_doubt_id: doubtId,
        landing_page: data.landing_page,
        produto_interesse: data.produto_interesse,
        kind: 'lead_frio',
      },
    });

    // 5. Activity log
    await logActivity({
      teamId: team.id,
      contactId: contact.id,
      opportunityId: opp.id,
      type: 'form',
      direction: 'inbound',
      subject: `Dúvida: ${truncatedDuvida}`,
      body_md: data.duvida,
      metadata: {
        lead_doubt_id: doubtId,
        landing_page: data.landing_page,
        produto_interesse: data.produto_interesse,
      },
    });

    // 6. Notify admin (fire-and-forget)
    void (async () => {
      const tpl = doubtsAdminNotification({
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp,
        duvida: data.duvida,
        produto_interesse: data.produto_interesse,
        landing_page: data.landing_page,
      });
      await sendEmail({
        to: ADMIN_EMAIL,
        toName: 'Joel Burigo',
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        replyTo: data.email,
      });
    })();

    // 7. Confirmation pro lead (fire-and-forget)
    void (async () => {
      const tpl = doubtsConfirmation({ name: data.nome });
      await sendEmail({
        to: data.email,
        toName: data.nome,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
    })();

    return NextResponse.json({ ok: true, id: doubtId });
  } catch (err) {
    console.error('[forms/duvidas]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
