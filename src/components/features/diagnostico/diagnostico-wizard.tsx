'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Turnstile } from '@/components/features/turnstile';
import { captureAttribution, readAttribution } from '@/lib/attribution';

// ---------- Tipos & dados ----------

type PKey =
  | 'posicionamento'
  | 'publico'
  | 'produto'
  | 'programas'
  | 'processos'
  | 'pessoas';

interface PStep {
  key: PKey;
  index: number; // 1..6 (P1..P6)
  nome: string;
  pergunta: string;
  /**
   * 5 níveis (0-4). Texto baseado em docs/conteudo/partes/03-programa-vss.md §03.2.2
   * (matriz original tinha 0-5; aqui condensada pra 0-4 alinhado ao schema do backend).
   */
  niveis: string[];
}

const STEPS: PStep[] = [
  {
    key: 'posicionamento',
    index: 1,
    nome: 'Posicionamento',
    pergunta:
      'Como sua empresa se diferencia no mercado? Cliente entende, em uma frase, por que comprar de você?',
    niveis: [
      'Caótico — compito 100% por preço, sem diferencial claro',
      'Iniciante — tento me diferenciar, mas a mensagem não fica clara',
      'Básico — tenho diferencial, mas não defendo bem na hora da venda',
      'Avançado — diferencial claro internamente, comunicação consistente',
      'Otimizado — mercado reconhece meu posicionamento, consigo cobrar premium',
    ],
  },
  {
    key: 'publico',
    index: 2,
    nome: 'Público',
    pergunta:
      'Você sabe exatamente quem é seu cliente ideal — setor, porte, dor, momento — ou tenta vender pra todo mundo?',
    niveis: [
      'Caótico — vendo pra qualquer um, sem critério',
      'Iniciante — sei o setor mas é amplo demais, perco tempo com não-cliente',
      'Básico — segmento por porte/setor, mas não aprofundo na dor',
      'Avançado — ICP definido, persona com jornada e objeções mapeadas',
      'Otimizado — múltiplos segmentos com previsibilidade comportamental',
    ],
  },
  {
    key: 'produto',
    index: 3,
    nome: 'Produto',
    pergunta:
      'Sua oferta tem proposta de valor clara, prova social e pacote definido — ou cliente fica em dúvida do que tá comprando?',
    niveis: [
      'Caótico — proposta de valor confusa, muita objeção, descontos pra fechar',
      'Iniciante — produto resolve, mas a apresentação é ruim',
      'Básico — valor definido, mas comunicação ainda mal estruturada',
      'Avançado — produto bem posicionado, prova social forte, garantia clara',
      'Otimizado — produto premium, lista de espera, cliente vende por mim',
    ],
  },
  {
    key: 'programas',
    index: 4,
    nome: 'Programas',
    pergunta:
      'Como você atrai e converte leads? Tem funil documentado e previsível, ou depende de indicação e improviso?',
    niveis: [
      'Caótico — vendas aleatórias, sem funil, sem previsibilidade',
      'Iniciante — tentativas descoordenadas, depende de indicação',
      'Básico — funil estruturado, CRM básico rodando',
      'Avançado — múltiplos funis, automação ativa, previsibilidade ±20%',
      'Otimizado — máquina de vendas multi-canal, crescimento previsível',
    ],
  },
  {
    key: 'processos',
    index: 5,
    nome: 'Processos',
    pergunta:
      'Sua operação está documentada (SOPs, checklists, métricas) ou tudo depende de você lembrar e executar?',
    niveis: [
      'Caótico — nada documentado, tudo na cabeça, cada venda é única',
      'Iniciante — alguns processos informais, sem padrão',
      'Básico — processos principais documentados, time começa a seguir',
      'Avançado — operação padronizada, métricas por processo, melhoria contínua',
      'Otimizado — processos auditados, benchmarking, cultura de processos',
    ],
  },
  {
    key: 'pessoas',
    index: 6,
    nome: 'Pessoas',
    pergunta:
      'Teu time consegue vender e operar sem você presente, ou a empresa para se você sai uma semana?',
    niveis: [
      'Caótico — tudo depende do fundador, sem time, impossível escalar',
      'Iniciante — tem pessoas, mas papéis confusos e retrabalho',
      'Básico — papéis definidos, treinamento básico rodando',
      'Avançado — time produtivo sem supervisão, baixa rotatividade',
      'Otimizado — cultura forte, time se desenvolve sozinho, atrai talentos',
    ],
  },
];

const STRATEGIC: PKey[] = ['posicionamento', 'publico', 'produto'];

const SEGMENTOS = [
  'SaaS',
  'Serviço',
  'Infoproduto',
  'E-commerce',
  'Indústria',
  'Outro',
] as const;
const FATURAMENTOS = [
  'Até R$ 10k/mês',
  'R$ 10k–30k/mês',
  'R$ 30k–100k/mês',
  'R$ 100k–300k/mês',
  'R$ 300k–1M/mês',
  '+R$ 1M/mês',
] as const;

// ---------- Validação ----------

const identSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome').max(200),
  email: z.string().email('Email inválido').max(320),
  whatsapp: z.string().max(50).optional(),
  empresa: z.string().max(200).optional(),
  segmento: z.string().max(120).optional(),
  faturamento_aprox: z.string().max(60).optional(),
});
type Ident = z.infer<typeof identSchema>;

type Scores = Record<PKey, number | null>;

// ---------- Helpers ----------

const DRAFT_KEY = 'jb_diagnostico_draft';
const TOTAL_STEPS = 7; // 0 = identificação · 1..6 = Ps

function maskWhatsapp(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// ---------- UI tokens ----------

const inputCx =
  'bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans transition-colors focus:outline-none';
const labelCx = 'text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase';

// ---------- Componente ----------

const initialIdent: Ident = {
  nome: '',
  email: '',
  whatsapp: '',
  empresa: '',
  segmento: '',
  faturamento_aprox: '',
};

const initialScores: Scores = {
  posicionamento: null,
  publico: null,
  produto: null,
  programas: null,
  processos: null,
  pessoas: null,
};

export function DiagnosticoWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [ident, setIdent] = useState<Ident>(initialIdent);
  const [scores, setScores] = useState<Scores>(initialScores);
  const [errors, setErrors] = useState<Partial<Record<keyof Ident, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Captura attribution (UTM/click IDs/Meta cookies) no mount — first-touch wins.
  useEffect(() => {
    captureAttribution();
  }, []);

  // Restaura rascunho do localStorage (sistema externo: SSR-safe hydration)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          ident?: Partial<Ident>;
          scores?: Partial<Scores>;
          step?: number;
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.ident) setIdent({ ...initialIdent, ...parsed.ident });
        if (parsed.scores) setScores({ ...initialScores, ...parsed.scores });
        if (typeof parsed.step === 'number' && parsed.step >= 0 && parsed.step < TOTAL_STEPS) {
          setStep(parsed.step);
        }
      }
    } catch {
      /* draft corrompido: ignora */
    }
    setHydrated(true);
  }, []);

  // Persiste rascunho
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ident, scores, step }));
    } catch {
      /* noop */
    }
  }, [ident, scores, step, hydrated]);

  // Foco no heading ao trocar step (acessibilidade)
  useEffect(() => {
    if (!hydrated) return;
    headingRef.current?.focus();
  }, [step, hydrated]);

  function updateIdent<K extends keyof Ident>(key: K, value: Ident[K]) {
    setIdent((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function setScore(key: PKey, value: number) {
    setScores((s) => ({ ...s, [key]: value }));
  }

  function validateIdent(): boolean {
    const parsed = identSchema.safeParse(ident);
    if (parsed.success) return true;
    const fe: Partial<Record<keyof Ident, string>> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof Ident;
      if (!fe[k]) fe[k] = issue.message;
    }
    setErrors(fe);
    toast.error('Confere os campos marcados.');
    return false;
  }

  function next() {
    if (step === 0 && !validateIdent()) return;
    if (step >= 1 && step <= 6) {
      const pkey = STEPS[step - 1]!.key;
      if (scores[pkey] === null) {
        toast.error('Escolhe uma opção pra avançar.');
        return;
      }
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    // Última pergunta
    const lastP = STEPS[5]!;
    if (scores[lastP.key] === null) {
      toast.error('Escolhe uma opção pra ver o resultado.');
      return;
    }

    // Garante que todos foram respondidos
    for (const s of STEPS) {
      if (scores[s.key] === null) {
        toast.error(`Falta responder: ${s.nome}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const resolvedScores = {
        posicionamento: scores.posicionamento as number,
        publico: scores.publico as number,
        produto: scores.produto as number,
        programas: scores.programas as number,
        processos: scores.processos as number,
        pessoas: scores.pessoas as number,
      };
      const raw_answers: Record<string, { pergunta: string; resposta: string; score: number }> =
        {};
      for (const s of STEPS) {
        const v = resolvedScores[s.key];
        raw_answers[s.key] = {
          pergunta: s.pergunta,
          resposta: s.niveis[v]!,
          score: v,
        };
      }

      if (!turnstileToken) {
        toast.error('Confirme o anti-spam acima.');
        setSubmitting(false);
        return;
      }

      const body = {
        nome: ident.nome,
        email: ident.email,
        whatsapp: ident.whatsapp || undefined,
        empresa: ident.empresa || undefined,
        segmento: ident.segmento || undefined,
        faturamento_aprox: ident.faturamento_aprox || undefined,
        scores: resolvedScores,
        raw_answers,
        cf_turnstile_token: turnstileToken,
        attribution: readAttribution(),
      };

      const res = await fetch('/api/forms/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        toast.error('Muitas tentativas. Espera alguns minutos e tenta de novo.');
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error('Falha no envio');
      const data = (await res.json()) as { ok: boolean; id: string };

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* noop */
      }

      toast.success('Diagnóstico pronto. Tá redirecionando...');
      router.push(`/diagnostico-resultado?id=${encodeURIComponent(data.id)}`);
    } catch (err) {
      console.error('[diagnostico-wizard]', err);
      toast.error('Erro ao processar. Tenta de novo.');
      setSubmitting(false);
    }
  }

  const progress = useMemo(() => Math.round(((step + 1) / TOTAL_STEPS) * 100), [step]);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8" aria-live="polite">
      {/* Progresso */}
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] tracking-[0.22em] uppercase">
          <span className="text-acid">
            // ETAPA {step + 1} DE {TOTAL_STEPS}
          </span>
          <span className="text-fg-muted">{progress}%</span>
        </div>
        <div className="bg-ink h-1 w-full border border-[var(--jb-hair)]">
          <div
            className="bg-acid h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <IdentStep
          ident={ident}
          errors={errors}
          onUpdate={updateIdent}
          headingRef={headingRef}
        />
      )}

      {step >= 1 && step <= 6 && (
        <PStepView
          step={STEPS[step - 1]!}
          value={scores[STEPS[step - 1]!.key]}
          onChange={(v) => setScore(STEPS[step - 1]!.key, v)}
          headingRef={headingRef}
        />
      )}

      {/* Anti-spam só no último step */}
      {step === TOTAL_STEPS - 1 && (
        <div>
          <Turnstile onVerify={setTurnstileToken} />
        </div>
      )}

      {/* Navegação */}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={step === 0 || submitting}
          className="border border-[var(--jb-hair-strong)] bg-transparent px-6 py-3 font-mono text-[11px] tracking-[0.22em] text-cream uppercase transition-colors hover:border-[var(--jb-acid)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← ANTERIOR
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="btn-primary min-h-[48px]"
          >
            <span>PRÓXIMO</span>
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting || !turnstileToken}
            aria-busy={submitting}
            className="btn-primary min-h-[48px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{submitting ? 'PROCESSANDO...' : 'VER MEU RESULTADO'}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </form>
  );
}

// ---------- Sub-componentes ----------

function IdentStep({
  ident,
  errors,
  onUpdate,
  headingRef,
}: {
  ident: Ident;
  errors: Partial<Record<keyof Ident, string>>;
  onUpdate: <K extends keyof Ident>(k: K, v: Ident[K]) => void;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
}) {
  function onWa(e: ChangeEvent<HTMLInputElement>) {
    onUpdate('whatsapp', maskWhatsapp(e.target.value));
  }
  return (
    <div className="space-y-6">
      <div>
        <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
          // IDENTIFICAÇÃO · QUEM_É_VOCÊ
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-cream text-3xl uppercase tracking-tight outline-none md:text-4xl"
        >
          Antes de começar.
        </h2>
        <p className="text-fg-2 mt-3 font-sans">
          Quem responde, e com que contexto. Joel olha cada diagnóstico pessoalmente.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="d-nome" className={labelCx}>
            Nome *
          </label>
          <input
            id="d-nome"
            type="text"
            required
            autoComplete="name"
            value={ident.nome}
            onChange={(e) => onUpdate('nome', e.target.value)}
            className={inputCx}
            placeholder="Seu nome"
            aria-invalid={!!errors.nome}
          />
          {errors.nome && <p className="text-fire mt-2 font-mono text-[11px]">{errors.nome}</p>}
        </div>
        <div>
          <label htmlFor="d-email" className={labelCx}>
            Email *
          </label>
          <input
            id="d-email"
            type="email"
            required
            autoComplete="email"
            value={ident.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            className={inputCx}
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-fire mt-2 font-mono text-[11px]">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="d-wa" className={labelCx}>
            WhatsApp
          </label>
          <input
            id="d-wa"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={ident.whatsapp ?? ''}
            onChange={onWa}
            className={inputCx}
            placeholder="(48) 99999-9999"
          />
        </div>
        <div>
          <label htmlFor="d-empresa" className={labelCx}>
            Empresa
          </label>
          <input
            id="d-empresa"
            type="text"
            autoComplete="organization"
            value={ident.empresa ?? ''}
            onChange={(e) => onUpdate('empresa', e.target.value)}
            className={inputCx}
            placeholder="Nome da empresa"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="d-seg" className={labelCx}>
            Segmento
          </label>
          <select
            id="d-seg"
            value={ident.segmento ?? ''}
            onChange={(e) => onUpdate('segmento', e.target.value)}
            className={inputCx}
          >
            <option value="">Selecione...</option>
            {SEGMENTOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="d-fat" className={labelCx}>
            Faturamento aproximado
          </label>
          <select
            id="d-fat"
            value={ident.faturamento_aprox ?? ''}
            onChange={(e) => onUpdate('faturamento_aprox', e.target.value)}
            className={inputCx}
          >
            <option value="">Selecione...</option>
            {FATURAMENTOS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
        * Campos obrigatórios · 5 minutos no total
      </p>
    </div>
  );
}

function PStepView({
  step,
  value,
  onChange,
  headingRef,
}: {
  step: PStep;
  value: number | null;
  onChange: (v: number) => void;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
}) {
  const isStrategic = STRATEGIC.includes(step.key);
  return (
    <div className="space-y-6">
      <div>
        <div
          className="kicker mb-3"
          style={{ color: isStrategic ? 'var(--jb-fire)' : 'var(--jb-acid)' }}
        >
          // P{step.index} · {isStrategic ? 'ESTRATÉGICO' : 'TÁTICO'}
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-cream text-3xl uppercase tracking-tight outline-none md:text-4xl"
        >
          {step.nome}
        </h2>
        <p className="text-fg-2 mt-3 font-sans text-lg">{step.pergunta}</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Selecione o nível atual de {step.nome}</legend>
        {step.niveis.map((label, idx) => {
          const checked = value === idx;
          return (
            <label
              key={idx}
              className={
                'flex cursor-pointer items-start gap-4 border p-4 transition-all ' +
                (checked
                  ? 'border-acid bg-[var(--jb-acid-soft)]'
                  : 'border-[var(--jb-hair-strong)] hover:border-[var(--jb-acid)]')
              }
            >
              <input
                type="radio"
                name={`p-${step.key}`}
                value={idx}
                checked={checked}
                onChange={() => onChange(idx)}
                className="bg-ink text-acid focus:ring-acid mt-1 size-5 shrink-0 border-[var(--jb-hair)] focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-display text-cream text-sm uppercase">
                  Nível {idx} · {label.split(' — ')[0]}
                </div>
                <div className="text-fg-2 mt-1 font-sans text-sm">
                  {label.split(' — ').slice(1).join(' — ')}
                </div>
              </div>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
