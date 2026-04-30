'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { MaskedPhoneInput } from '@/components/ui/masked-input';
import { Turnstile } from '@/components/features/turnstile';
import { captureAttribution, readAttribution } from '@/lib/attribution';
import { emailSchema, phoneBrSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';

interface DataLayerWindow extends Window {
  dataLayer?: Array<Record<string, unknown>>;
}

export type DoubtsProductSlug = 'vss' | 'advisory';

export interface DoubtsPopupProps {
  /** Determina pipeline + label do produto. */
  productSlug: DoubtsProductSlug;
  /** Path da landing (ex: `/vendas-sem-segredos`). Vai pro lead_doubts.landing_page. */
  landingPage: string;
  /** Texto do botão CTA. Default "Ainda tem dúvidas? Falar com a gente." */
  triggerLabel?: string;
  /** Threshold (0..1) de scroll pra abrir auto. Default 0.85. Use 0 pra desativar. */
  scrollThreshold?: number;
  /** Classe extra no botão trigger. */
  className?: string;
}

const FORM_SCHEMA = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome (mín 2 caracteres).').max(200),
  email: emailSchema.max(320),
  whatsapp: phoneBrSchema,
  duvida: z
    .string()
    .trim()
    .min(10, 'Conta um pouco mais — pelo menos 10 caracteres.')
    .max(1000),
});

type FormData = z.infer<typeof FORM_SCHEMA>;

const INITIAL: FormData = { nome: '', email: '', whatsapp: '', duvida: '' };

const MAX_DUVIDA = 1000;

const PRODUCT_LABEL: Record<DoubtsProductSlug, string> = {
  vss: 'VSS',
  advisory: 'Advisory',
};

const inputCx =
  'bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans text-base transition-colors focus:outline-none aria-[invalid=true]:border-[var(--jb-fire)]';
const labelCx = 'text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase';

export function DoubtsPopup(props: DoubtsPopupProps) {
  const {
    productSlug,
    landingPage,
    triggerLabel = 'Ainda tem dúvidas? Falar com a gente.',
    scrollThreshold = 0.85,
    className,
  } = props;

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const scrollFiredRef = useRef(false);

  // Captura attribution no mount (idempotente, first-touch wins)
  useEffect(() => {
    captureAttribution();
  }, []);

  // Auto-open scroll trigger (1x por sessão por produto)
  useEffect(() => {
    if (scrollThreshold <= 0) return;
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = `__jb_doubts_opened_${productSlug}`;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) {
        scrollFiredRef.current = true;
        return;
      }
    } catch {
      // sessionStorage indisponível — segue sem persistir
    }

    function onScroll() {
      if (scrollFiredRef.current) return;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const viewport = window.innerHeight || doc.clientHeight;
      const total = doc.scrollHeight - viewport;
      if (total <= 0) return;
      const ratio = scrollTop / total;
      if (ratio >= scrollThreshold) {
        scrollFiredRef.current = true;
        try {
          window.sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
          /* noop */
        }
        setOpen(true);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Checa no mount caso a página seja curta e o threshold já tenha sido alcançado.
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [productSlug, scrollThreshold]);

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      // Reset ao fechar — se foi success, limpa pra próxima
      setStatus((prev) => (prev === 'success' ? 'idle' : prev));
    }
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
      const res = await fetch('/api/forms/duvidas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          produto_interesse: productSlug,
          landing_page: landingPage,
          cf_turnstile_token: turnstileToken,
          attribution: readAttribution(),
        }),
      });

      if (res.status === 429) {
        toast.error('Muitas tentativas. Aguarde alguns minutos.');
        setStatus('idle');
        return;
      }
      if (!res.ok) {
        throw new Error(`status_${res.status}`);
      }

      // GTM event
      const w = window as DataLayerWindow;
      if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push({ event: 'doubts_form_submit', product: productSlug });
      } else {
        w.dataLayer = [{ event: 'doubts_form_submit', product: productSlug }];
      }

      setStatus('success');
      setData(INITIAL);
      setErrors({});
    } catch (err) {
      console.error('[doubts-popup]', err);
      toast.error('Não rolou. Tenta de novo.');
      setStatus('idle');
    }
  }

  const remaining = MAX_DUVIDA - data.duvida.length;
  const submitting = status === 'submitting';

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="primary"
        size="xl"
        className={className}
        aria-haspopup="dialog"
      >
        <span>{triggerLabel}</span>
        <span aria-hidden="true">→</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[90vh] w-[95vw] max-w-xl overflow-y-auto border-2 border-[var(--jb-acid)] shadow-[8px_8px_0_var(--jb-fire)]"
          onOpenAutoFocus={(e) => {
            // Evita auto-focus no botão de close — deixa Radix focar o primeiro input
            // (ou no card de success, no botão Fechar). Default do Radix já é razoável.
            e.preventDefault();
          }}
        >
          {status === 'success' ? (
            <div className="flex flex-col gap-4">
              <p className="text-acid font-mono text-[11px] tracking-[0.22em] uppercase">
                // MENSAGEM RECEBIDA
              </p>
              <DialogTitle className="text-cream font-display text-2xl leading-tight uppercase">
                Tô no teu radar.
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-fg-2 space-y-3 text-base">
                  <p>
                    Joel responde em até <strong className="text-acid">24h</strong> direto no
                    teu email ou WhatsApp.
                  </p>
                  <p className="text-fg-3 text-sm">
                    Não precisa fazer nada — só ficar de olho.
                  </p>
                </div>
              </DialogDescription>
              <Button
                type="button"
                onClick={() => handleOpenChange(false)}
                variant="primary"
                className="mt-2 self-start"
              >
                <span>Fechar</span>
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-acid font-mono text-[11px] tracking-[0.22em] uppercase">
                  // AINDA TEM DÚVIDAS?
                </p>
                <DialogTitle className="text-cream font-display text-2xl leading-tight uppercase">
                  Manda a dúvida. Joel responde em 24h.
                </DialogTitle>
                <DialogDescription className="text-fg-3 text-sm">
                  Sobre {PRODUCT_LABEL[productSlug]}. Sem script, sem call obrigatória.
                </DialogDescription>
              </div>

              <div>
                <label htmlFor="duvidas-nome" className={labelCx}>
                  Nome *
                </label>
                <input
                  id="duvidas-nome"
                  name="nome"
                  type="text"
                  required
                  autoComplete="name"
                  value={data.nome}
                  onChange={(ev) => update('nome', ev.target.value)}
                  className={inputCx}
                  placeholder="Seu nome"
                  aria-invalid={!!errors.nome}
                  aria-describedby={errors.nome ? 'duvidas-nome-err' : undefined}
                  disabled={submitting}
                />
                {errors.nome ? (
                  <p id="duvidas-nome-err" className="text-fire mt-2 font-mono text-[11px]">
                    {errors.nome}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="duvidas-email" className={labelCx}>
                  Email *
                </label>
                <input
                  id="duvidas-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={data.email}
                  onChange={(ev) => update('email', ev.target.value)}
                  className={inputCx}
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'duvidas-email-err' : undefined}
                  disabled={submitting}
                />
                {errors.email ? (
                  <p id="duvidas-email-err" className="text-fire mt-2 font-mono text-[11px]">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="duvidas-whatsapp" className={labelCx}>
                  WhatsApp *
                </label>
                <MaskedPhoneInput
                  id="duvidas-whatsapp"
                  name="whatsapp"
                  required
                  autoComplete="tel-national"
                  value={data.whatsapp}
                  onChange={(v) => update('whatsapp', v)}
                  error={!!errors.whatsapp}
                  aria-describedby={errors.whatsapp ? 'duvidas-whatsapp-err' : undefined}
                  disabled={submitting}
                />
                {errors.whatsapp ? (
                  <p id="duvidas-whatsapp-err" className="text-fire mt-2 font-mono text-[11px]">
                    {errors.whatsapp}
                  </p>
                ) : null}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="duvidas-duvida" className={labelCx + ' mb-0'}>
                    Sua dúvida *
                  </label>
                  <span
                    className={cn(
                      'font-mono text-[11px] tracking-[0.18em] uppercase',
                      remaining < 50 ? 'text-fire' : 'text-fg-muted'
                    )}
                  >
                    {remaining} / {MAX_DUVIDA}
                  </span>
                </div>
                <textarea
                  id="duvidas-duvida"
                  name="duvida"
                  required
                  rows={4}
                  maxLength={MAX_DUVIDA}
                  value={data.duvida}
                  onChange={(ev) => update('duvida', ev.target.value)}
                  className={cn(inputCx, 'resize-none')}
                  placeholder="O que tá te travando? Manda direto, sem rodeios."
                  aria-invalid={!!errors.duvida}
                  aria-describedby={errors.duvida ? 'duvidas-duvida-err' : undefined}
                  disabled={submitting}
                />
                {errors.duvida ? (
                  <p id="duvidas-duvida-err" className="text-fire mt-2 font-mono text-[11px]">
                    {errors.duvida}
                  </p>
                ) : null}
              </div>

              <Turnstile
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
              />

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  <span>{submitting ? 'Enviando...' : 'Mandar dúvida'}</span>
                  <span aria-hidden="true">→</span>
                </Button>
                <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
                  * Joel responde pessoalmente em até 24h
                </p>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
