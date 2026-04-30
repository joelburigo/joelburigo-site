import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { advisory_applications } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import {
  getDefaultTeam,
  upsertContact,
  createOpportunity,
  logActivity,
} from '@/server/services/crm';
import { sendEmail } from '@/server/services/email';
import {
  advisoryApplicationAdminNotification,
  advisoryApplicationConfirmation,
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
  nome: z.string().trim().min(2).max(200),
  email: emailSchema.max(320),
  whatsapp: phoneBrSchema,
  cargo: z.string().trim().max(120).optional().nullable(),
  empresa: z.string().trim().min(2).max(200),
  site_empresa: z.string().trim().max(500).optional().nullable(),
  faturamento_mensal_range: z.enum([
    '<100k',
    '100-200k',
    '200-500k',
    '500k-1M',
    '1M-5M',
    '>5M',
  ]),
  setor: z.string().trim().min(2).max(120),
  tamanho_time: z.number().int().min(0).max(100000).optional().nullable(),
  anos_no_mercado: z.number().int().min(0).max(200).optional().nullable(),
  dor_principal_md: z.string().trim().min(50).max(4000),
  urgencia: z.number().int().min(1).max(5),
  timeline_esperada: z.enum(['3m', '6m', '12m+']),
  tentou_consultoria_antes: z.enum(['sim', 'nao']),
  qual_consultoria: z.string().trim().max(400).optional().nullable(),
  disponibilidade_semanal_horas: z.number().int().min(0).max(168).optional().nullable(),
  formato_interesse: z.enum(['sprint', 'conselho', 'ambos']),
  cf_turnstile_token: z.string().optional().nullable(),
  attribution: attributionInputSchema.optional(),
});

type Body = z.infer<typeof bodySchema>;

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip');
}

const FORMATO_LABEL: Record<Body['formato_interesse'], string> = {
  sprint: 'Sprint 30 Dias',
  conselho: 'Conselho Executivo',
  ambos: 'Sprint + Conselho',
};

const FORMATO_VALUE_CENTS: Record<Body['formato_interesse'], number> = {
  sprint: 750000,
  conselho: 1250000,
  ambos: 750000,
};

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

  // Turnstile (dev: bypass)
  const ts = await verifyTurnstile(data.cf_turnstile_token, ip);
  if (!ts.valid) {
    return NextResponse.json({ error: 'turnstile_invalid' }, { status: 403 });
  }

  // Rate limit: 3/dia por IP+email (mais restritivo que diagnóstico)
  const emailNorm = data.email.trim().toLowerCase();
  const rl = await rateLimit({
    key: `rl:advisory_aplicacao:${ip}:${emailNorm}`,
    max: 3,
    windowSeconds: 24 * 60 * 60,
  });
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'rate_limited', retry_after: retryAfter },
      { status: 429, headers: { 'retry-after': String(retryAfter) } }
    );
  }

  try {
    // 1. Persist attribution before contact (pra linkar)
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
      source: 'form_advisory_aplicacao',
      produto_interesse: 'advisory',
    });

    await linkAttributionToContact(attributionId, contact.id);

    // 3. Insert advisory_application
    const applicationId = ulid();
    await db.insert(advisory_applications).values({
      id: applicationId,
      nome: data.nome,
      email: emailNorm,
      whatsapp: data.whatsapp,
      cargo: data.cargo ?? null,
      empresa: data.empresa,
      site_empresa: data.site_empresa ?? null,
      faturamento_mensal_range: data.faturamento_mensal_range,
      setor: data.setor,
      tamanho_time: data.tamanho_time ?? null,
      anos_no_mercado: data.anos_no_mercado ?? null,
      dor_principal_md: data.dor_principal_md,
      urgencia: data.urgencia,
      timeline_esperada: data.timeline_esperada,
      tentou_consultoria_antes: data.tentou_consultoria_antes,
      qual_consultoria: data.qual_consultoria ?? null,
      disponibilidade_semanal_horas: data.disponibilidade_semanal_horas ?? null,
      formato_interesse: data.formato_interesse,
      contact_id: contact.id,
      attribution_id: attributionId,
      status: 'aguardando',
      ip: clientIp(req),
      user_agent: req.headers.get('user-agent'),
    });

    // 4. Create opportunity (pipeline=advisory · stage=aplicacao-recebida)
    const opp = await createOpportunity({
      teamId: team.id,
      contactId: contact.id,
      pipelineSlug: 'advisory',
      stageSlug: 'aplicacao-recebida',
      title: `Aplicação Advisory (${FORMATO_LABEL[data.formato_interesse]}): ${data.nome}`,
      value_cents: FORMATO_VALUE_CENTS[data.formato_interesse],
      metadata: {
        advisory_application_id: applicationId,
        formato_interesse: data.formato_interesse,
        faturamento_mensal_range: data.faturamento_mensal_range,
        urgencia: data.urgencia,
        timeline_esperada: data.timeline_esperada,
        empresa: data.empresa,
      },
    });

    // 5. Activity log
    await logActivity({
      teamId: team.id,
      contactId: contact.id,
      opportunityId: opp.id,
      type: 'form',
      direction: 'inbound',
      subject: `Aplicação Advisory (${FORMATO_LABEL[data.formato_interesse]}): ${data.nome}`,
      body_md: data.dor_principal_md,
      metadata: {
        advisory_application_id: applicationId,
        formato_interesse: data.formato_interesse,
      },
    });

    // 6. Notify admin (fire-and-forget)
    void (async () => {
      const tpl = advisoryApplicationAdminNotification({
        applicationId,
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp,
        cargo: data.cargo ?? null,
        empresa: data.empresa,
        site_empresa: data.site_empresa ?? null,
        faturamento_mensal_range: data.faturamento_mensal_range,
        setor: data.setor,
        tamanho_time: data.tamanho_time ?? null,
        anos_no_mercado: data.anos_no_mercado ?? null,
        dor_principal_md: data.dor_principal_md,
        urgencia: data.urgencia,
        timeline_esperada: data.timeline_esperada,
        tentou_consultoria_antes: data.tentou_consultoria_antes,
        qual_consultoria: data.qual_consultoria ?? null,
        disponibilidade_semanal_horas: data.disponibilidade_semanal_horas ?? null,
        formato_interesse: data.formato_interesse,
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
      const tpl = advisoryApplicationConfirmation({
        name: data.nome,
        formato: data.formato_interesse,
      });
      await sendEmail({
        to: data.email,
        toName: data.nome,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
    })();

    return NextResponse.json({ ok: true, id: applicationId });
  } catch (err) {
    console.error('[forms/advisory-aplicacao]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
