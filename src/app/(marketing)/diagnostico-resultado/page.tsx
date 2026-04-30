import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@/components/ui';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ShareButton } from '@/components/features/diagnostico/share-button';
import { getDiagnosticoById } from '@/server/services/diagnostico';
import { SITE } from '@/lib/constants';
import type { DiagnosticoSubmission } from '@/server/db/schema';

type SearchParams = { id?: string | string[] };

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const P_LABELS: Array<{ key: keyof DiagnosticoSubmission; nome: string; index: number }> = [
  { key: 'score_posicionamento', nome: 'Posicionamento', index: 1 },
  { key: 'score_publico', nome: 'Público', index: 2 },
  { key: 'score_produto', nome: 'Produto', index: 3 },
  { key: 'score_programas', nome: 'Programas', index: 4 },
  { key: 'score_processos', nome: 'Processos', index: 5 },
  { key: 'score_pessoas', nome: 'Pessoas', index: 6 },
];

const STRATEGIC_KEYS = new Set(['score_posicionamento', 'score_publico', 'score_produto']);

const NIVEL_INTERPRETACAO: Record<number, string> = {
  0: 'Não estruturado · ponto cego',
  1: 'Existe, mas é informal e inconsistente',
  2: 'Funciona na prática, mas não documenta',
  3: 'Documentado, testado e replicável',
  4: 'Otimizado com dados, referência no nicho',
};

interface NivelInfo {
  badgeColor: string; // tailwind utility for bg
  badgeText: string;
  textColor: string;
  diagnostico: { onde: string; falta: string; proximo: string };
}

function getNivelInfo(nivel: string, total: number): NivelInfo {
  const base = nivel.toLowerCase();
  // fire para Caótico / Iniciante
  if (base.includes('caót') || base.includes('inicia')) {
    return {
      badgeColor: 'bg-fire',
      badgeText: 'text-ink',
      textColor: 'text-fire',
      diagnostico: {
        onde: `Score ${total}/24. Vendas dependem de improviso e do fundador. Cada mês é um susto novo: às vezes vende, às vezes não, e ninguém sabe explicar por quê. Tá no modo sobrevivência — o que é normal pra quem ainda não estruturou a base.`,
        falta:
          'Faltam os fundamentos: posicionamento claro, ICP definido e oferta com proposta de valor empilhada. Sem isso, qualquer investimento em tráfego ou time vira ralo de dinheiro.',
        proximo:
          'Construa a base na ordem certa: P1 → P2 → P3 antes de qualquer coisa tática. É exatamente o que o VSS faz nos primeiros 30 dias.',
      },
    };
  }
  // white para Estruturado
  if (base.includes('estrutur')) {
    return {
      badgeColor: 'bg-cream',
      badgeText: 'text-ink',
      textColor: 'text-cream',
      diagnostico: {
        onde: `Score ${total}/24. Você já saiu do caos. Tem método rodando, alguma previsibilidade, primeiros processos documentados. A operação não para se você sai uma semana — mas ainda derrapa.`,
        falta:
          'Falta otimização. Você tem os 6Ps em algum nível, mas alguns ainda travam o crescimento. O ganho agora vem de aprofundar os Ps mais fracos, não de adicionar coisa nova.',
        proximo:
          'Ataque o P mais fraco com obsessão por 30–60 dias. Um P bem resolvido tem mais impacto que seis Ps mal executados.',
      },
    };
  }
  // acid para Avançado / Otimizado
  return {
    badgeColor: 'bg-acid',
    badgeText: 'text-ink',
    textColor: 'text-acid',
    diagnostico: {
      onde: `Score ${total}/24. Tua operação é Máquina. Funis previsíveis, time autônomo, processos auditáveis. Você está no top do mercado em maturidade comercial.`,
      falta:
        'O que falta é menos sobre estruturação e mais sobre escala, novos canais e desenvolvimento de lideranças. O risco é a inércia — Máquinas que param de inovar começam a perder mercado.',
      proximo:
        'Foco em expansão (novos segmentos, sub-marcas) e desenvolvimento de cultura. Conversa Advisory faz mais sentido aqui que curso DIY.',
    },
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!rawId) {
    return {
      title: 'Resultado do Diagnóstico 6Ps',
      robots: { index: false, follow: false },
    };
  }
  const sub = await getDiagnosticoById(rawId);
  if (!sub) {
    return {
      title: 'Resultado do Diagnóstico 6Ps',
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `Diagnóstico 6Ps · ${sub.nivel_maturidade ?? 'Resultado'} (${sub.score_total}/24)`,
    description: `Resultado do diagnóstico 6Ps de ${sub.nome}: nível ${sub.nivel_maturidade} com score ${sub.score_total}/24.`,
    robots: { index: false, follow: false },
  };
}

export const dynamic = 'force-dynamic';

export default async function DiagnosticoResultadoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!rawId) notFound();

  const sub = await getDiagnosticoById(rawId);
  if (!sub) notFound();

  const nivel = sub.nivel_maturidade ?? 'Resultado';
  const total = sub.score_total;
  const info = getNivelInfo(nivel, total);
  const shareUrl = `${SITE.url}/diagnostico-resultado?id=${encodeURIComponent(sub.id)}`;
  const firstName = sub.nome.split(' ')[0];

  return (
    <main className="bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        {/* Hero */}
        <section className="pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="mx-auto max-w-5xl">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Diagnóstico', href: '/diagnostico' },
                { label: 'Resultado', href: '/diagnostico-resultado' },
              ]}
              className="mb-5"
            />
            <div className="kicker mb-6">// DIAGNÓSTICO · RESULTADO · {firstName.toUpperCase()}</div>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1
                  className="font-display text-cream"
                  style={{
                    fontSize: 'clamp(2.25rem, 7vw, 4.5rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.045em',
                    lineHeight: '0.92',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  Nível: <span className={info.textColor}>{nivel}</span>
                </h1>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className={`font-display text-7xl ${info.textColor}`}>{total}</span>
                  <span className="font-display text-fg-3 text-3xl">/24</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-2 font-mono text-[11px] tracking-[0.22em] uppercase ${info.badgeColor} ${info.badgeText}`}
                >
                  ★ {nivel}
                </span>
                <ShareButton url={shareUrl} />
              </div>
            </div>
          </div>
        </section>

        {/* Grid 6 cards */}
        <section className="pb-12">
          <div className="mx-auto max-w-5xl">
            <div className="kicker mb-6">// SCORE · DETALHADO_POR_P</div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {P_LABELS.map((p) => {
                const score = sub[p.key] as number;
                const isStrategic = STRATEGIC_KEYS.has(p.key as string);
                const interp = NIVEL_INTERPRETACAO[score] ?? '';
                const scoreColor =
                  score <= 1 ? 'text-fire' : score === 2 ? 'text-cream' : 'text-acid';
                return (
                  <div
                    key={p.key as string}
                    className={
                      'bg-ink-2 border p-5 ' +
                      (isStrategic
                        ? 'border-[var(--jb-acid-border)]'
                        : 'border-[var(--jb-hair)]')
                    }
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-fg-muted font-mono text-[10px] tracking-[0.22em] uppercase">
                          P{p.index} · {isStrategic ? 'ESTRATÉGICO' : 'TÁTICO'}
                        </div>
                        <h3 className="font-display text-cream mt-1 text-xl uppercase">
                          {p.nome}
                        </h3>
                      </div>
                      <span
                        className={
                          'inline-flex items-center px-2 py-1 font-mono text-[11px] tracking-[0.18em] uppercase ' +
                          (isStrategic
                            ? 'bg-[var(--jb-acid-soft-2)] ' + scoreColor
                            : 'bg-[var(--jb-hair)] ' + scoreColor)
                        }
                      >
                        {score}/4
                      </span>
                    </div>
                    <p className="text-fg-2 font-sans text-sm">{interp}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Diagnóstico textual */}
        <section className="pb-12">
          <div className="mx-auto max-w-3xl">
            <div className="bg-ink-2 border border-[var(--jb-hair)] p-6 md:p-10">
              <div className="kicker mb-4">// LEITURA · DO_JOEL</div>
              <h2 className="heading-2 text-cream mb-6">
                {firstName}, eis o que teu raio-X mostra.
              </h2>
              <div className="space-y-5 font-sans text-fg-2 text-base md:text-lg">
                <div>
                  <p className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
                    // ONDE_VOCÊ_ESTÁ
                  </p>
                  <p>{info.diagnostico.onde}</p>
                </div>
                <div>
                  <p className="kicker mb-2" style={{ color: 'var(--jb-fire)' }}>
                    // O_QUE_FALTA
                  </p>
                  <p>{info.diagnostico.falta}</p>
                </div>
                <div>
                  <p className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
                    // PRÓXIMO_PASSO
                  </p>
                  <p>{info.diagnostico.proximo}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 lg:grid-cols-3">
              <div
                className="bg-ink-2 border border-[var(--jb-acid-border)] p-8 lg:col-span-2"
                style={{
                  background: 'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
                }}
              >
                <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                  // RECOMENDADO · VSS
                </div>
                <h3 className="heading-2 text-cream mb-4">
                  Destrava com o método. Sem improviso.
                </h3>
                <p className="text-fg-2 mb-6 font-sans">
                  O VSS é o framework 6Ps inteiro destrinchado em 90 dias. Mesmo método aplicado em{' '}
                  <strong className="text-cream">140+ MPEs</strong> — agora pra você implementar
                  com autonomia.
                </p>
                <ButtonLink
                  href={`/vendas-sem-segredos?from=diagnostico&id=${encodeURIComponent(sub.id)}`}
                  variant="primary"
                  size="lg"
                  prefetch
                >
                  <span>DESTRAVAR COM O VSS · R$ 1.997</span>
                  <span aria-hidden="true">→</span>
                </ButtonLink>
              </div>

              <div className="bg-ink-2 border border-[var(--jb-fire-border)] p-8">
                <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                  // ALTERNATIVA · ADVISORY
                </div>
                <h3 className="heading-3 text-cream mb-3">Quer 1:1 com o Joel?</h3>
                <p className="text-fg-2 mb-6 font-sans">
                  Momento crítico que pede conselheiro presente? Advisory é o caminho.
                </p>
                <ButtonLink href="/advisory" variant="fire">
                  <span>Ver Advisory</span>
                  <span aria-hidden="true">→</span>
                </ButtonLink>
              </div>
            </div>

            <p className="text-fg-muted mt-12 border-t border-[var(--jb-hair)] pt-6 font-mono text-[11px] tracking-[0.22em] uppercase">
              <span className="text-acid">★</span>&nbsp; SISTEMA{' '}
              <span className="text-fire">&gt;</span> IMPROVISO · 6PS_DIAGNOSTIC_ENGINE
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}
