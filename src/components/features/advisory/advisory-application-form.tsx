'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui';
import { MaskedPhoneInput } from '@/components/ui/masked-input';
import { Turnstile } from '@/components/features/turnstile';
import { captureAttribution, readAttribution } from '@/lib/attribution';
import { emailSchema, phoneBrSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';

export type AdvisoryFormato = 'sprint' | 'conselho' | 'ambos';

interface Props {
  formato: AdvisoryFormato;
}

const REVENUE_OPTIONS = [
  { value: '<100k', label: '< R$ 100k/mês' },
  { value: '100-200k', label: 'R$ 100k – 200k/mês' },
  { value: '200-500k', label: 'R$ 200k – 500k/mês' },
  { value: '500k-1M', label: 'R$ 500k – 1M/mês' },
  { value: '1M-5M', label: 'R$ 1M – 5M/mês' },
  { value: '>5M', label: '> R$ 5M/mês' },
] as const;

const URGENCIA_LABELS: Record<number, string> = {
  1: 'Explorando',
  2: 'Planejando',
  3: 'Decidindo',
  4: 'Urgente',
  5: 'Apagando incêndio',
};

const TIMELINE_OPTIONS = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '12m+', label: '12 meses ou mais' },
] as const;

const FORMATO_OPTIONS = [
  { value: 'sprint', label: 'Sprint 30 dias' },
  { value: 'conselho', label: 'Conselho Executivo' },
  { value: 'ambos', label: 'Ainda não decidi' },
] as const;

const FORM_SCHEMA = z.object({
  nome: z.string().trim().min(2, 'Informe o nome (mín 2 caracteres).').max(200),
  email: emailSchema.max(320),
  whatsapp: phoneBrSchema,
  cargo: z.string().trim().max(120).optional(),
  empresa: z.string().trim().min(2, 'Informe a empresa.').max(200),
  site_empresa: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(
      (v) => !v || /^https?:\/\/.+/.test(v) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(v),
      'URL inválida'
    ),
  faturamento_mensal_range: z.enum(['<100k', '100-200k', '200-500k', '500k-1M', '1M-5M', '>5M']),
  setor: z.string().trim().min(2, 'Informe o setor.').max(120),
  tamanho_time: z.number().int().min(0).max(100000).optional(),
  anos_no_mercado: z.number().int().min(0).max(200).optional(),
  dor_principal_md: z
    .string()
    .trim()
    .min(50, 'Conta o contexto — pelo menos 50 caracteres.')
    .max(4000),
  urgencia: z.number().int().min(1).max(5),
  timeline_esperada: z.enum(['3m', '6m', '12m+']),
  tentou_consultoria_antes: z.enum(['sim', 'nao']),
  qual_consultoria: z.string().trim().max(400).optional(),
  disponibilidade_semanal_horas: z.number().int().min(0).max(168).optional(),
  formato_interesse: z.enum(['sprint', 'conselho', 'ambos']),
});

type FormData = z.infer<typeof FORM_SCHEMA>;

const inputCx =
  'bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans text-base transition-colors focus:outline-none aria-[invalid=true]:border-[var(--jb-fire)]';
const labelCx = 'text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase';
const helpCx = 'text-fg-muted mt-1 font-mono text-[10px] tracking-[0.18em] uppercase';

export function AdvisoryApplicationForm({ formato }: Props) {
  const router = useRouter();
  const [data, setData] = useState<FormData>({
    nome: '',
    email: '',
    whatsapp: '',
    cargo: '',
    empresa: '',
    site_empresa: '',
    faturamento_mensal_range: '200-500k',
    setor: '',
    tamanho_time: undefined,
    anos_no_mercado: undefined,
    dor_principal_md: '',
    urgencia: 3,
    timeline_esperada: '6m',
    tentou_consultoria_antes: 'nao',
    qual_consultoria: '',
    disponibilidade_semanal_horas: undefined,
    formato_interesse: formato,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;

    const parsed = FORM_SCHEMA.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormData;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error('Confere os campos marcados.');
      return;
    }

    if (!turnstileToken) {
      toast.error('Aguarde a verificação anti-spam carregar.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/forms/advisory-aplicacao', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          cf_turnstile_token: turnstileToken,
          attribution: readAttribution(),
        }),
      });

      if (res.status === 429) {
        toast.error('Muitas tentativas. Aguarde alguns minutos.');
        setStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(`status_${res.status}`);

      const json = (await res.json()) as { ok?: boolean; id?: string };
      if (!json.id) throw new Error('missing_id');

      router.push(`/advisory-obrigado?id=${encodeURIComponent(json.id)}`);
    } catch (err) {
      console.error('[advisory-application]', err);
      toast.error('Não rolou. Tenta de novo.');
      setStatus('idle');
    }
  }

  const submitting = status === 'submitting';
  const showQualConsultoria = data.tentou_consultoria_antes === 'sim';

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {/* Bloco 1 — Identificação */}
      <fieldset className="border border-[var(--jb-hair)] bg-ink-2 p-5 sm:p-6">
        <legend className="kicker mb-4 px-2" style={{ color: 'var(--jb-acid)' }}>
          // 01 · IDENTIFICAÇÃO
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="adv-nome" className={labelCx}>
              Nome *
            </label>
            <input
              id="adv-nome"
              type="text"
              required
              autoComplete="name"
              value={data.nome}
              onChange={(ev) => update('nome', ev.target.value)}
              className={inputCx}
              placeholder="Seu nome completo"
              aria-invalid={!!errors.nome}
              disabled={submitting}
            />
            {errors.nome && <p className="text-fire mt-2 font-mono text-[11px]">{errors.nome}</p>}
          </div>
          <div>
            <label htmlFor="adv-cargo" className={labelCx}>
              Sua função na empresa
            </label>
            <input
              id="adv-cargo"
              type="text"
              autoComplete="organization-title"
              value={data.cargo ?? ''}
              onChange={(ev) => update('cargo', ev.target.value)}
              className={inputCx}
              placeholder="Ex.: dono · sócio · founder"
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="adv-email" className={labelCx}>
              Email *
            </label>
            <input
              id="adv-email"
              type="email"
              required
              autoComplete="email"
              value={data.email}
              onChange={(ev) => update('email', ev.target.value)}
              className={inputCx}
              placeholder="seu@email.com"
              aria-invalid={!!errors.email}
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-fire mt-2 font-mono text-[11px]">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="adv-whatsapp" className={labelCx}>
              WhatsApp *
            </label>
            <MaskedPhoneInput
              id="adv-whatsapp"
              required
              autoComplete="tel-national"
              value={data.whatsapp}
              onChange={(v) => update('whatsapp', v)}
              error={!!errors.whatsapp}
              disabled={submitting}
            />
            {errors.whatsapp && (
              <p className="text-fire mt-2 font-mono text-[11px]">{errors.whatsapp}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Bloco 2 — Empresa */}
      <fieldset className="border border-[var(--jb-hair)] bg-ink-2 p-5 sm:p-6">
        <legend className="kicker mb-4 px-2" style={{ color: 'var(--jb-acid)' }}>
          // 02 · EMPRESA
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="adv-empresa" className={labelCx}>
              Nome da empresa *
            </label>
            <input
              id="adv-empresa"
              type="text"
              required
              autoComplete="organization"
              value={data.empresa}
              onChange={(ev) => update('empresa', ev.target.value)}
              className={inputCx}
              aria-invalid={!!errors.empresa}
              disabled={submitting}
            />
            {errors.empresa && (
              <p className="text-fire mt-2 font-mono text-[11px]">{errors.empresa}</p>
            )}
          </div>
          <div>
            <label htmlFor="adv-site" className={labelCx}>
              Site da empresa
            </label>
            <input
              id="adv-site"
              type="url"
              autoComplete="url"
              value={data.site_empresa ?? ''}
              onChange={(ev) => update('site_empresa', ev.target.value)}
              className={inputCx}
              placeholder="https://"
              aria-invalid={!!errors.site_empresa}
              disabled={submitting}
            />
            {errors.site_empresa && (
              <p className="text-fire mt-2 font-mono text-[11px]">{errors.site_empresa}</p>
            )}
          </div>
          <div>
            <label htmlFor="adv-setor" className={labelCx}>
              Setor *
            </label>
            <input
              id="adv-setor"
              type="text"
              required
              value={data.setor}
              onChange={(ev) => update('setor', ev.target.value)}
              className={inputCx}
              placeholder="Ex.: SaaS B2B, advocacia, ecommerce"
              aria-invalid={!!errors.setor}
              disabled={submitting}
            />
            {errors.setor && (
              <p className="text-fire mt-2 font-mono text-[11px]">{errors.setor}</p>
            )}
          </div>
          <div>
            <label htmlFor="adv-anos" className={labelCx}>
              Anos de mercado
            </label>
            <input
              id="adv-anos"
              type="number"
              min={0}
              max={200}
              value={data.anos_no_mercado ?? ''}
              onChange={(ev) =>
                update(
                  'anos_no_mercado',
                  ev.target.value === '' ? undefined : Number(ev.target.value)
                )
              }
              className={inputCx}
              placeholder="Ex.: 5"
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="adv-time" className={labelCx}>
              Tamanho do time (pessoas)
            </label>
            <input
              id="adv-time"
              type="number"
              min={0}
              max={100000}
              value={data.tamanho_time ?? ''}
              onChange={(ev) =>
                update(
                  'tamanho_time',
                  ev.target.value === '' ? undefined : Number(ev.target.value)
                )
              }
              className={inputCx}
              placeholder="Ex.: 12"
              disabled={submitting}
            />
          </div>
          <div>
            <label className={labelCx}>Faturamento mensal *</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REVENUE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 border px-3 py-2 font-mono text-[12px] transition-colors',
                    data.faturamento_mensal_range === opt.value
                      ? 'border-acid bg-acid/10 text-cream'
                      : 'border-[var(--jb-hair)] text-fg-2 hover:border-[var(--jb-acid-border)]'
                  )}
                >
                  <input
                    type="radio"
                    name="faturamento_mensal_range"
                    value={opt.value}
                    checked={data.faturamento_mensal_range === opt.value}
                    onChange={() => update('faturamento_mensal_range', opt.value)}
                    className="accent-[var(--jb-acid)]"
                    disabled={submitting}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.faturamento_mensal_range && (
              <p className="text-fire mt-2 font-mono text-[11px]">
                {errors.faturamento_mensal_range}
              </p>
            )}
            <p className={helpCx}>
              ★ Advisory é pra quem fatura R$ 200k+/mês. Abaixo disso, indico VSS.
            </p>
          </div>
        </div>
      </fieldset>

      {/* Bloco 3 — Dor + intent */}
      <fieldset className="border border-[var(--jb-hair)] bg-ink-2 p-5 sm:p-6">
        <legend className="kicker mb-4 px-2" style={{ color: 'var(--jb-acid)' }}>
          // 03 · MOMENTO_E_DOR
        </legend>
        <div className="grid gap-5">
          <div>
            <label htmlFor="adv-dor" className={labelCx}>
              Qual o problema central agora? * (mín 50 caracteres)
            </label>
            <textarea
              id="adv-dor"
              required
              rows={5}
              maxLength={4000}
              value={data.dor_principal_md}
              onChange={(ev) => update('dor_principal_md', ev.target.value)}
              className={cn(inputCx, 'resize-none')}
              placeholder="Conta sem rodeios: o que tá travando? Bate teto? Time não bate meta? Crescimento desordenado? IA virou gambiarra?"
              aria-invalid={!!errors.dor_principal_md}
              disabled={submitting}
            />
            {errors.dor_principal_md && (
              <p className="text-fire mt-2 font-mono text-[11px]">{errors.dor_principal_md}</p>
            )}
            <p className={helpCx}>
              {data.dor_principal_md.length} caracteres · sem script, fala como falaria pra
              sócio
            </p>
          </div>

          <div>
            <label className={labelCx}>Urgência (1 = explorando · 5 = apagando incêndio) *</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1 border px-4 py-2 font-mono text-[11px] transition-colors',
                    data.urgencia === n
                      ? 'border-fire bg-fire/10 text-cream'
                      : 'border-[var(--jb-hair)] text-fg-2 hover:border-[var(--jb-fire-border)]'
                  )}
                >
                  <input
                    type="radio"
                    name="urgencia"
                    value={n}
                    checked={data.urgencia === n}
                    onChange={() => update('urgencia', n)}
                    className="accent-[var(--jb-fire)]"
                    disabled={submitting}
                  />
                  <span className="font-display text-base">{n}</span>
                  <span className="text-[9px] tracking-[0.15em] uppercase">
                    {URGENCIA_LABELS[n]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCx}>Timeline esperada *</label>
            <div className="grid grid-cols-3 gap-2">
              {TIMELINE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 border px-3 py-2 font-mono text-[12px] transition-colors',
                    data.timeline_esperada === opt.value
                      ? 'border-acid bg-acid/10 text-cream'
                      : 'border-[var(--jb-hair)] text-fg-2 hover:border-[var(--jb-acid-border)]'
                  )}
                >
                  <input
                    type="radio"
                    name="timeline_esperada"
                    value={opt.value}
                    checked={data.timeline_esperada === opt.value}
                    onChange={() => update('timeline_esperada', opt.value)}
                    className="accent-[var(--jb-acid)]"
                    disabled={submitting}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCx}>Já tentou consultoria/mentor antes? *</label>
            <div className="flex gap-3">
              {(['nao', 'sim'] as const).map((v) => (
                <label
                  key={v}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 border px-4 py-2 font-mono text-[12px] uppercase transition-colors',
                    data.tentou_consultoria_antes === v
                      ? 'border-acid bg-acid/10 text-cream'
                      : 'border-[var(--jb-hair)] text-fg-2 hover:border-[var(--jb-acid-border)]'
                  )}
                >
                  <input
                    type="radio"
                    name="tentou_consultoria_antes"
                    value={v}
                    checked={data.tentou_consultoria_antes === v}
                    onChange={() => update('tentou_consultoria_antes', v)}
                    className="accent-[var(--jb-acid)]"
                    disabled={submitting}
                  />
                  {v === 'sim' ? 'Sim' : 'Não'}
                </label>
              ))}
            </div>
          </div>

          {showQualConsultoria && (
            <div>
              <label htmlFor="adv-qual" className={labelCx}>
                Qual? O que funcionou e o que não?
              </label>
              <textarea
                id="adv-qual"
                rows={3}
                maxLength={400}
                value={data.qual_consultoria ?? ''}
                onChange={(ev) => update('qual_consultoria', ev.target.value)}
                className={cn(inputCx, 'resize-none')}
                placeholder="Ex.: trabalhei com X em 2023, ajudou em vendas mas faltou implementação em..."
                disabled={submitting}
              />
            </div>
          )}

          <div>
            <label htmlFor="adv-disponibilidade" className={labelCx}>
              Quantas horas/semana tem disponível pra estratégia?
            </label>
            <input
              id="adv-disponibilidade"
              type="number"
              min={0}
              max={168}
              value={data.disponibilidade_semanal_horas ?? ''}
              onChange={(ev) =>
                update(
                  'disponibilidade_semanal_horas',
                  ev.target.value === '' ? undefined : Number(ev.target.value)
                )
              }
              className={inputCx}
              placeholder="Ex.: 4"
              disabled={submitting}
            />
            <p className={helpCx}>★ Sprint pede ~3h/semana · Conselho ~5h/semana</p>
          </div>

          <div>
            <label className={labelCx}>Formato de interesse *</label>
            <div className="grid gap-2 md:grid-cols-3">
              {FORMATO_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 border px-3 py-3 font-mono text-[12px] transition-colors',
                    data.formato_interesse === opt.value
                      ? 'border-acid bg-acid/10 text-cream'
                      : 'border-[var(--jb-hair)] text-fg-2 hover:border-[var(--jb-acid-border)]'
                  )}
                >
                  <input
                    type="radio"
                    name="formato_interesse"
                    value={opt.value}
                    checked={data.formato_interesse === opt.value}
                    onChange={() => update('formato_interesse', opt.value)}
                    className="accent-[var(--jb-acid)]"
                    disabled={submitting}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <Turnstile
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
      />

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitting}
          aria-busy={submitting}
        >
          <span>{submitting ? 'Enviando aplicação…' : 'Enviar aplicação'}</span>
          <span aria-hidden="true">→</span>
        </Button>
        <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
          ★ Análise direta do Joel · sem fila · sem intermediário
        </p>
      </div>
    </form>
  );
}
