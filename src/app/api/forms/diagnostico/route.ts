import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { diagnostico_submissions } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import {
  getDefaultTeam,
  upsertContact,
  createOpportunity,
  logActivity,
} from '@/server/services/crm';
import { sendEmail } from '@/server/services/email';
import { formDiagnosticoConfirmation } from '@/server/services/email-templates';
import { rateLimit, pickIp } from '@/server/lib/rate-limit';
import { verifyTurnstile } from '@/server/services/turnstile';
import {
  attributionInputSchema,
  extractAttributionFromRequest,
  persistAttribution,
  linkAttributionToContact,
} from '@/server/services/marketing-attribution';
import { env } from '@/env';

const score04 = z.number().int().min(0).max(4);

const bodySchema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email().max(320),
  whatsapp: z.string().max(50).optional().nullable(),
  empresa: z.string().max(200).optional().nullable(),
  segmento: z.string().max(120).optional().nullable(),
  faturamento_aprox: z.string().max(60).optional().nullable(),
  scores: z.object({
    posicionamento: score04,
    publico: score04,
    produto: score04,
    programas: score04,
    processos: score04,
    pessoas: score04,
  }),
  raw_answers: z.record(z.unknown()).default({}),
  cf_turnstile_token: z.string().optional().nullable(),
  attribution: attributionInputSchema.optional(),
});

type DiagnosticoBody = z.infer<typeof bodySchema>;

function nivelMaturidade(total: number): string {
  if (total <= 6) return 'Caótico';
  if (total <= 12) return 'Iniciante';
  if (total <= 18) return 'Estruturado';
  if (total <= 22) return 'Avançado';
  return 'Otimizado';
}

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip');
}

async function forwardToN8n(submissionId: string, payload: unknown): Promise<void> {
  if (!env.N8N_WEBHOOK_URL) return;
  try {
    const res = await fetch(env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'diagnostico', submission_id: submissionId, data: payload }),
    });
    if (!res.ok) {
      console.error('[forms/diagnostico] n8n status', res.status);
      return;
    }
    await db
      .update(diagnostico_submissions)
      .set({ forwarded_to_n8n_at: new Date() })
      .where(eq(diagnostico_submissions.id, submissionId));
  } catch (err) {
    console.error('[forms/diagnostico] n8n forward failed', err);
  }
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
  const data: DiagnosticoBody = parsed.data;
  const ip = pickIp(req.headers);

  // Turnstile (dev: bypass)
  const ts = await verifyTurnstile(data.cf_turnstile_token, ip);
  if (!ts.valid) {
    return NextResponse.json({ error: 'turnstile_invalid' }, { status: 403 });
  }

  // Rate limit: 5/24h por IP+email
  const emailNorm = data.email.trim().toLowerCase();
  const rl = await rateLimit({
    key: `rl:diagnostico:${ip}:${emailNorm}`,
    max: 5,
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
    const s = data.scores;
    const total =
      s.posicionamento + s.publico + s.produto + s.programas + s.processos + s.pessoas;
    const nivel = nivelMaturidade(total);

    // Persiste attribution ANTES de criar contact (pra linkar)
    const attrCtx = await extractAttributionFromRequest(req, {
      ...(data.attribution ?? {}),
    });
    const attributionId = await persistAttribution({
      attribution: attrCtx.attribution,
      geo: attrCtx.geo,
      device: attrCtx.device,
    });

    const submissionId = ulid();
    const team = await getDefaultTeam();
    const contact = await upsertContact({
      teamId: team.id,
      name: data.nome,
      email: data.email,
      whatsapp: data.whatsapp ?? null,
      source: 'form_diagnostico',
      produto_interesse: 'vss',
    });

    await linkAttributionToContact(attributionId, contact.id);

    await db.insert(diagnostico_submissions).values({
      id: submissionId,
      nome: data.nome,
      email: data.email.trim().toLowerCase(),
      whatsapp: data.whatsapp ?? null,
      empresa: data.empresa ?? null,
      segmento: data.segmento ?? null,
      faturamento_aprox: data.faturamento_aprox ?? null,
      score_posicionamento: s.posicionamento,
      score_publico: s.publico,
      score_produto: s.produto,
      score_programas: s.programas,
      score_processos: s.processos,
      score_pessoas: s.pessoas,
      score_total: total,
      nivel_maturidade: nivel,
      raw_answers: data.raw_answers,
      contact_id: contact.id,
      attribution_id: attributionId,
      ip: clientIp(req),
      user_agent: req.headers.get('user-agent'),
    });

    const opp = await createOpportunity({
      teamId: team.id,
      contactId: contact.id,
      pipelineSlug: 'vss',
      stageSlug: 'qualificado',
      title: `Diagnóstico 6Ps – ${data.nome}`,
      value_cents: 199700,
      metadata: {
        diagnostico_id: submissionId,
        score_total: total,
        nivel,
      },
    });

    await logActivity({
      teamId: team.id,
      contactId: contact.id,
      opportunityId: opp.id,
      type: 'form',
      direction: 'inbound',
      subject: `Diagnóstico 6Ps · ${nivel} (${total}/24)`,
      metadata: {
        diagnostico_id: submissionId,
        scores: s,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cf_turnstile_token: _t, ...forwardData } = data;
    void forwardToN8n(submissionId, { ...forwardData, score_total: total, nivel_maturidade: nivel });

    const resultadoUrl = `${env.PUBLIC_SITE_URL}/diagnostico-resultado?id=${encodeURIComponent(submissionId)}`;
    void (async () => {
      const tpl = formDiagnosticoConfirmation({
        name: data.nome,
        nivel,
        total,
        resultadoUrl,
      });
      const result = await sendEmail({
        to: data.email,
        toName: data.nome,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
      if (result.ok && !result.skipped) {
        await db
          .update(diagnostico_submissions)
          .set({ email_sent_at: new Date() })
          .where(eq(diagnostico_submissions.id, submissionId));
      }
    })();

    return NextResponse.json({ ok: true, id: submissionId });
  } catch (err) {
    console.error('[forms/diagnostico]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
