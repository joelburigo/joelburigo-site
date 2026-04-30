import 'server-only';
import Image from 'next/image';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/seo/breadcrumbs';
import { CheckoutButton } from '@/components/features/payments/checkout-button';
import { TestimonialCarousel } from '@/components/features/testimonials/testimonial-carousel';
import { DoubtsPopup } from '@/components/features/doubts/doubts-popup';
import { ButtonLink } from '@/components/ui';
import { getConfig } from '@/server/services/config';
import { listPublishedTestimonials } from '@/server/services/testimonials';

interface AdvisoryPageProps {
  breadcrumbItems?: BreadcrumbItem[];
}

function formatBRL(cents: number): string {
  const reais = Math.round(cents / 100);
  return `R$ ${reais.toLocaleString('pt-BR')}`;
}

const dores = [
  {
    n: '01',
    titulo: 'Refém da operação',
    body: 'Você assina cada decisão estratégica. Sai 3 dias e volta com fogo pra apagar. Férias = empresa parada. O negócio é teu, mas o tempo é dele.',
  },
  {
    n: '02',
    titulo: 'Vendas que não escalam',
    body: 'Bate teto e não passa. Time não bate meta sem você fechar. Cresceu desordenado, agora não sabe se é Posicionamento, Processo ou Pessoa que tá travando.',
  },
  {
    n: '03',
    titulo: 'Tech virou gambiarra',
    body: 'Stack improvisada. IA aplicada de qualquer jeito. Dados espalhados em 7 planilhas + 3 CRMs + 2 ERPs. Agentes virais no LinkedIn que você ainda não sabe se faz sentido aplicar.',
  },
];

const comoTrabalho = [
  {
    titulo: 'Eu penso junto. Você decide. Você executa.',
    body: 'Não DFY. Não monto operação por você. Sentamos no campo, eu trago framework + cicatriz, você sai com clareza pra implementar.',
  },
  {
    titulo: 'Acesso direto via WhatsApp',
    body: 'No Sprint e no Conselho você tem meu número. Sem fila, sem intermediário. Resposta direta do Joel.',
  },
  {
    titulo: 'Sem entregáveis bonitos. Sou pé-no-chão.',
    body: 'Não vendo PowerPoint de 200 slides. Vendo cabeça aplicada nos 6Ps das Vendas Escaláveis — método condensado em 17+ anos e 140+ empresas.',
  },
  {
    titulo: 'Tudo é confidencial',
    body: 'NDA padrão se precisar. O que entra na sala não sai. Cliente em setor sensível, exit, M&A, crise — tratamento sério.',
  },
];

const objecoes = [
  {
    q: 'R$ 7.500 por 30 dias é caro?',
    a: 'Um hire errado pra liderança custa 10× isso. Decisão estratégica equivocada (abrir filial errada, contratar 5 vendedores antes de processo, queimar R$ 50k em tráfego sem oferta validada) custa mais. Você paga uma vez e leva o framework pra vida.',
  },
  {
    q: 'Por que não consultoria tradicional?',
    a: 'Consultor tradicional entrega slide bonito e some. Eu fico no campo com você. Estratégia sem implementação é teoria — e teoria não paga boleto. O método dos 6Ps existe pra rodar, não pra ficar no PDF.',
  },
  {
    q: 'Já tentei mentor antes e não rolou.',
    a: 'Diferença é cicatriz operacional real (~R$ 1 bilhão em vendas estruturadas em 17+ anos, quebrei 2× e reconstruí), acesso direto sem fila, e foco obsessivo em fazer rodar. Não é palco motivacional — é sparring estratégico.',
  },
  {
    q: 'E se eu não for aprovado?',
    a: 'Triagem é mútua, não é rejeição pessoal. Se o momento não bater (faturamento, urgência, fit de método), indico VSS ou recurso gratuito. Não empurro venda forçada — não tenho tempo nem você.',
  },
  {
    q: 'Quanto tempo investe da minha agenda?',
    a: 'Sprint: 4 sessões de 90 min em 30 dias + WhatsApp. Conselho: 1–2 reuniões/semana de 60 min + WhatsApp prioritário + revisão de materiais. Sessão Avulsa: 90 min e segue a vida.',
  },
];

export async function AdvisoryPage({ breadcrumbItems }: AdvisoryPageProps) {
  const [sessionPrice, sprintPrice, councilMin, councilMax, testimonialsAdvisory] =
    await Promise.all([
      getConfig<number>('pricing', 'advisory.session_price_cents', 99700),
      getConfig<number>('pricing', 'advisory.sprint_price_cents', 750000),
      getConfig<number>('pricing', 'advisory.council_price_min_cents', 1250000),
      getConfig<number>('pricing', 'advisory.council_price_max_cents', 1500000),
      listPublishedTestimonials({ product: 'advisory', featured: true, limit: 6 }),
    ]);

  // Fallback pra 'all' featured se não houver advisory featured ainda
  const showAllFallback = testimonialsAdvisory.length === 0;

  const sessionPriceLabel = formatBRL(sessionPrice);
  const sprintPriceLabel = formatBRL(sprintPrice);
  const councilMinLabel = formatBRL(councilMin);
  const councilMaxLabel = formatBRL(councilMax);

  return (
    <>
      {/* 1. HERO */}
      <section
        id="hero"
        className="bg-ink relative scroll-mt-24 overflow-hidden pt-12 pb-24 md:pt-16"
      >
        <div className="grid-overlay" />
        <div
          className="pointer-events-none absolute top-20 -right-40 h-[600px] w-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(198,255,0,0.08), transparent 70%)',
          }}
        />

        <Container>
          {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-5" />}
          <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.3fr_1fr] lg:gap-x-[clamp(3rem,6vw,5rem)]">
            <div className="flex flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
              <div className="kicker" style={{ color: 'var(--jb-fg-muted)' }}>
                // ADVISORY · 1:1 COM JOEL · ENTERPRISE
              </div>
              <h1
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(2.25rem, 6.5vw, 5rem)',
                  lineHeight: '0.9',
                  letterSpacing: '-0.045em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Empresa que depende de você{' '}
                <span className="stroke-text">não é empresa.</span> É{' '}
                <span className="text-fire">emprego</span>.
              </h1>
              <p
                className="font-sans"
                style={{
                  fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                  lineHeight: '1.5',
                  maxWidth: '40ch',
                  margin: 0,
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                Acesso direto à minha cabeça aplicando os{' '}
                <strong className="text-cream">6Ps das Vendas Escaláveis</strong> — método
                condensado em <strong className="text-cream">17+ anos</strong> e{' '}
                <strong className="text-cream">140+ empresas</strong>. Pra quem fatura{' '}
                <strong className="text-cream">R$ 200k+</strong> e precisa destravar vendas, escala
                digital e IA{' '}
                <span className="text-acid">com framework, não com PowerPoint de 200 slides</span>.
              </p>

              <div className="mono text-fg-muted flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> 17+ ANOS DE PRÁTICA
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> 140+ EMPRESAS ESTRUTURADAS
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> ~R$ 1 BI EM VENDAS
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="#formatos" variant="primary" size="lg">
                  Ver formatos <span className="font-mono" aria-hidden="true">↓</span>
                </ButtonLink>
                <span className="mono text-fg-muted">★ resposta direta do Joel</span>
              </div>
            </div>

            <aside
              className="bg-ink-2 border border-white/10"
              style={{ boxShadow: 'var(--shadow-terminal)' }}
            >
              <div
                className="flex items-center gap-2 border-b border-white/10"
                style={{ padding: '10px 14px' }}
              >
                <span
                  className="bg-fire inline-block rounded-full"
                  style={{ width: '11px', height: '11px' }}
                />
                <span
                  className="inline-block rounded-full"
                  style={{ width: '11px', height: '11px', background: '#FFB020' }}
                />
                <span
                  className="bg-acid inline-block rounded-full"
                  style={{ width: '11px', height: '11px' }}
                />
                <span
                  className="mono text-fg-muted ml-auto"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'lowercase',
                  }}
                >
                  advisory_filter — qualify
                </span>
              </div>
              <div
                className="p-5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.7' }}
              >
                <div className="text-fg-muted">[00:00]</div>
                <div className="text-cream">
                  <span className="text-acid">$</span> ./advisory_filter --check
                </div>
                <div className="text-fg-muted">&gt; qualificando candidato…</div>
                <div className="text-cream mt-2">
                  <span className="text-acid">[✓]</span> momento crítico real ...........{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="text-cream">
                  <span className="text-acid">[✓]</span> faturamento R$ 200k+/mês .......{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="text-cream">
                  <span className="text-acid">[✓]</span> comprometido com execução .....{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="text-cream">
                  <span className="text-acid">[✓]</span> fit + agenda disponível ........{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="text-cream mt-2">
                  &gt; status:{' '}
                  <span
                    style={{
                      background: 'var(--jb-acid)',
                      color: 'var(--jb-ink)',
                      padding: '0 6px',
                    }}
                  >
                    QUALIFIED
                  </span>
                </div>
                <div className="text-fg-muted mt-3">[00:02]</div>
                <div className="text-fg-muted">&gt; checking slot availability…</div>
                <div className="text-cream">
                  &gt; slots: <span className="text-acid">limitados</span> · conforme capacidade
                </div>
                <div className="text-cream">&gt; access: convite · indicação · aplicação</div>
                <div className="text-cream">
                  <span className="text-acid">$</span> aplicar
                  <span className="text-fg-muted" style={{ animation: 'blink 1s infinite' }}>
                    _
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* 2. PROBLEMA — 3 dores enterprise */}
      <section id="problema" className="bg-ink-2 relative scroll-mt-24 py-20">
        <Container>
          <div className="mx-auto mb-12 max-w-5xl">
            <div className="kicker mb-4">// PROBLEMA · 3 DORES ENTERPRISE</div>
            <h2
              className="font-display text-cream"
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
              }}
            >
              Você fatura <span className="text-acid">R$ 200k+</span>. E mesmo assim:
            </h2>
          </div>

          <div className="mx-auto grid max-w-6xl gap-0 border border-white/10 md:grid-cols-3">
            {dores.map((d, i) => (
              <article
                key={d.n}
                className={`flex flex-col p-8 md:p-10 ${
                  i < dores.length - 1 ? 'border-b border-white/10 md:border-r md:border-b-0' : ''
                }`}
                style={{ background: '#0B0B0B' }}
              >
                <div
                  className="font-display text-fire mb-4"
                  style={{
                    fontSize: '2.25rem',
                    letterSpacing: '-0.04em',
                    lineHeight: '1',
                  }}
                >
                  {d.n}
                </div>
                <h3
                  className="font-display text-cream mb-3"
                  style={{
                    fontSize: '1.25rem',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    lineHeight: '1.1',
                  }}
                >
                  {d.titulo}
                </h3>
                <p
                  className="font-sans"
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.55',
                    color: 'rgba(245, 241, 232, 0.78)',
                  }}
                >
                  {d.body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. QUEM É JOEL — versão enterprise */}
      <section id="quem-e-joel" className="bg-ink relative scroll-mt-24 overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.5fr] md:items-center md:gap-14">
            <div className="border border-white/10 bg-ink-2 p-3">
              <Image
                src="/images/joel-burigo-vendas-sem-segredos-2-800w.webp"
                alt="Joel Burigo"
                width={800}
                height={800}
                className="w-full"
                priority={false}
              />
            </div>
            <div>
              <div className="kicker mb-4">// QUEM_VAI_PENSAR_JUNTO_COM_VOCÊ</div>
              <h2
                className="font-display text-cream mb-6"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                Joel Burigo. <span className="text-acid">17+ anos.</span> 140+ empresas. ~R$ 1 bilhão em vendas estruturadas.
              </h2>
              <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-5 mb-6">
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1.85rem', lineHeight: '1', letterSpacing: '-0.035em' }}
                  >
                    17+
                  </div>
                  <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.65rem' }}>
                    anos de prática
                  </div>
                </div>
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1.85rem', lineHeight: '1', letterSpacing: '-0.035em' }}
                  >
                    140+
                  </div>
                  <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.65rem' }}>
                    empresas
                  </div>
                </div>
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1.5rem', lineHeight: '1', letterSpacing: '-0.035em' }}
                  >
                    ~R$ 1BI
                  </div>
                  <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.65rem' }}>
                    em vendas
                  </div>
                </div>
              </div>
              <p
                className="font-sans"
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                Comecei do barraco em 2012, em <strong className="text-cream">17+ anos</strong>{' '}
                estruturei vendas pra <strong className="text-cream">140+ empresas</strong>{' '}
                movimentando <strong className="text-cream">~R$ 1 bilhão</strong> em vendas
                agregadas.{' '}
                <span className="text-acid">
                  Não vendo execução. Vendo cabeça.
                </span>{' '}
                Quebrei 2× e reconstruí — por isso o método é cicatriz, não teoria.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. FORMATOS — 3 cards com fluxos diferenciados */}
      <section
        id="formatos"
        className="bg-ink-2 relative scroll-mt-24 overflow-hidden py-24"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl">
            <div className="kicker mb-4">// FORMATOS · 3 NÍVEIS DE PROFUNDIDADE</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              Escolhe o <span className="text-acid">formato</span> que cabe no momento.
            </h2>
            <p
              className="font-sans"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.55',
                color: 'rgba(245, 241, 232, 0.7)',
              }}
            >
              Sessão Avulsa pra dúvida pontual (compra direta). Sprint e Conselho passam por
              triagem — vagas limitadas conforme capacidade. Garantia incondicional na primeira
              sessão em todos os formatos.
            </p>
          </div>

          <div className="grid gap-0 border border-white/10 lg:grid-cols-3 lg:items-stretch">
            {/* Card 1 — Sessão Avulsa */}
            <article
              className="relative flex flex-col border-b border-white/10 p-8 md:p-10 lg:border-r lg:border-b-0"
              style={{ background: '#0B0B0B' }}
            >
              <h3
                className="font-display text-cream mb-3"
                style={{
                  fontSize: '1.35rem',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  lineHeight: '1.1',
                  minHeight: '2.6em',
                }}
              >
                Sessão Estratégica Avulsa
              </h3>
              <div className="mb-6">
                <div
                  className="font-display text-acid"
                  style={{
                    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                    letterSpacing: '-0.035em',
                    lineHeight: '1',
                  }}
                >
                  {sessionPriceLabel}
                </div>
                <div className="mono text-fg-muted" style={{ marginTop: '4px' }}>
                  /sessão · 90 min · pagamento único
                </div>
              </div>
              <div className="mb-6 space-y-1">
                <div className="mono text-fg-muted">// duração · 90 minutos</div>
                <div className="mono text-fg-muted">// entrega · relatório executivo 2–3 pgs</div>
              </div>
              <p
                className="mb-6 font-sans"
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  minHeight: '3em',
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                <strong className="text-cream">Para você que:</strong> tem desafio específico e
                precisa de direcionamento agora.
              </p>
              <div className="mb-6 border-t border-white/10 pt-5">
                <div className="mono text-acid mb-3">// inclui</div>
                <ul className="space-y-2">
                  {[
                    '90 min de consultoria direta (remoto)',
                    'Diagnóstico rápido dos 6Ps',
                    'Plano de ação (3–5 ações prioritárias)',
                    'Gravação da sessão',
                    'Relatório executivo pós-sessão',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 font-sans"
                      style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        color: 'rgba(245, 241, 232, 0.85)',
                      }}
                    >
                      <span className="text-acid">▶</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto" style={{ width: '100%' }}>
                <CheckoutButton
                  productSlug="advisory-sessao"
                  label={`Comprar sessão · ${sessionPriceLabel}`}
                  variant="primary"
                  size="default"
                  className="block w-full [&>button]:w-full"
                />
                <p className="mono text-fg-muted mt-3" style={{ fontSize: '0.7rem' }}>
                  ★ checkout direto · sem triagem
                </p>
              </div>
            </article>

            {/* Card 2 — Sprint (destaque) */}
            <article
              className="relative flex flex-col border-b border-white/10 p-8 md:p-10 lg:border-r lg:border-b-0"
              style={{
                background: 'linear-gradient(180deg, rgba(198,255,0,0.06), #0B0B0B)',
                borderLeft: '1px solid var(--jb-acid-border)',
                borderRight: '1px solid var(--jb-acid-border)',
              }}
            >
              <div
                className="bg-acid absolute inline-flex items-center gap-2 px-2 py-1"
                style={{
                  color: 'var(--jb-ink)',
                  top: '-12px',
                  right: '16px',
                  zIndex: 1,
                }}
              >
                <span
                  className="font-display"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}
                >
                  ★ MAIS PEDIDO
                </span>
              </div>
              <h3
                className="font-display text-cream mb-3"
                style={{
                  fontSize: '1.35rem',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  lineHeight: '1.1',
                  minHeight: '2.6em',
                }}
              >
                Sprint Estratégico 30 Dias
              </h3>
              <div className="mb-6">
                <div
                  className="font-display text-acid"
                  style={{
                    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                    letterSpacing: '-0.035em',
                    lineHeight: '1',
                  }}
                >
                  {sprintPriceLabel}
                </div>
                <div className="mono text-fg-muted" style={{ marginTop: '4px' }}>
                  pagamento único · 30 dias
                </div>
              </div>
              <div className="mb-6 space-y-1">
                <div className="mono text-fg-muted">// duração · 4 sessões em 30 dias</div>
                <div className="mono text-fg-muted">// entrega · documento estratégico 20–40 pgs</div>
              </div>
              <p
                className="mb-6 font-sans"
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  minHeight: '3em',
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                <strong className="text-cream">Para você que:</strong> tá em momento crítico e
                precisa de plano estruturado pra 12 meses.
              </p>
              <div className="mb-6 border-t border-white/10 pt-5">
                <div className="mono text-acid mb-3">// inclui</div>
                <ul className="space-y-2">
                  {[
                    '4 sessões de 90 min (1 por semana)',
                    'Diagnóstico profundo dos 6Ps',
                    'Plano estratégico 12 meses detalhado',
                    'WhatsApp direto com o Joel',
                    'Documento estratégico final 20–40 pgs',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 font-sans"
                      style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        color: 'rgba(245, 241, 232, 0.85)',
                      }}
                    >
                      <span className="text-acid">▶</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto" style={{ width: '100%' }}>
                <ButtonLink
                  href="/advisory-aplicacao?formato=sprint"
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Aplicar pra Sprint <span className="font-mono" aria-hidden="true">→</span>
                </ButtonLink>
                <p className="mono text-fg-muted mt-3" style={{ fontSize: '0.7rem' }}>
                  ★ triagem mútua · vagas limitadas
                </p>
              </div>
            </article>

            {/* Card 3 — Conselho */}
            <article
              className="relative flex flex-col p-8 md:p-10"
              style={{ background: '#0B0B0B' }}
            >
              <h3
                className="font-display text-cream mb-3"
                style={{
                  fontSize: '1.35rem',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  lineHeight: '1.1',
                  minHeight: '2.6em',
                }}
              >
                Conselho Executivo
              </h3>
              <div className="mb-6">
                <div className="mono text-fg-muted" style={{ marginBottom: '2px' }}>
                  a partir de
                </div>
                <div
                  className="font-display text-acid"
                  style={{
                    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                    letterSpacing: '-0.035em',
                    lineHeight: '1',
                  }}
                >
                  {councilMinLabel}
                </div>
                <div className="mono text-fg-muted" style={{ marginTop: '4px' }}>
                  /mês · até {councilMaxLabel} · mín. 3 meses
                </div>
              </div>
              <div className="mb-6 space-y-1">
                <div className="mono text-fg-muted">// duração · 3–6 meses</div>
                <div className="mono text-fg-muted">// entrega · diagnóstico trimestral 6Ps</div>
              </div>
              <p
                className="mb-6 font-sans"
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  minHeight: '3em',
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                <strong className="text-cream">Para você que:</strong> precisa de conselheiro
                presente — crescimento acelerado, reestruturação ou preparação pra exit.
              </p>
              <div className="mb-6 border-t border-white/10 pt-5">
                <div className="mono text-acid mb-3">// inclui</div>
                <ul className="space-y-2">
                  {[
                    '8 sessões/mês (2 por semana · 60 min)',
                    'WhatsApp prioritário com o Joel',
                    'Participação em até 2 reuniões críticas/mês',
                    'Revisão ilimitada de materiais estratégicos',
                    'Diagnóstico trimestral dos 6Ps',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 font-sans"
                      style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        color: 'rgba(245, 241, 232, 0.85)',
                      }}
                    >
                      <span className="text-acid">▶</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto" style={{ width: '100%' }}>
                <ButtonLink
                  href="/advisory-aplicacao?formato=conselho"
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Aplicar pro Conselho <span className="font-mono" aria-hidden="true">→</span>
                </ButtonLink>
                <p className="mono text-fg-muted mt-3" style={{ fontSize: '0.7rem' }}>
                  ★ triagem mútua · vagas limitadas
                </p>
              </div>
            </article>
          </div>
        </Container>
      </section>

      {/* 5. PROVA SOCIAL */}
      <section id="prova-social" className="bg-ink relative scroll-mt-24 py-12">
        <Container>
          <TestimonialCarousel
            productSlug={showAllFallback ? 'all' : 'advisory'}
            featured
            limit={6}
          />
        </Container>
      </section>

      {/* 6. COMO TRABALHO */}
      <section id="como-trabalho" className="bg-ink-2 relative scroll-mt-24 py-20">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <div className="kicker mb-4">// COMO_TRABALHO</div>
              <h2
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                Não DFY. <span className="text-acid">É cabeça.</span> Sem PowerPoint.
              </h2>
            </div>

            <div className="grid gap-0 border border-white/10 md:grid-cols-2">
              {comoTrabalho.map((item, i) => (
                <div
                  key={item.titulo}
                  className={`p-8 ${
                    i % 2 === 0 ? 'md:border-r border-white/10' : ''
                  } ${i < 2 ? 'border-b border-white/10' : ''}`}
                  style={{ background: '#0B0B0B' }}
                >
                  <div className="mono text-acid mb-3">
                    ▶ {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3
                    className="font-display text-cream mb-3"
                    style={{
                      fontSize: '1.1rem',
                      letterSpacing: '-0.02em',
                      textTransform: 'uppercase',
                      lineHeight: '1.15',
                    }}
                  >
                    {item.titulo}
                  </h3>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.55',
                      color: 'rgba(245, 241, 232, 0.78)',
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 7. OBJEÇÕES */}
      <section id="objecoes" className="bg-ink relative scroll-mt-24 overflow-hidden py-20">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <div className="kicker mb-4">// OBJEÇÕES · FAQ</div>
              <h2
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                As 5 dúvidas <span className="text-acid">que sempre rolam.</span>
              </h2>
            </div>
            <div className="space-y-0 border border-white/10">
              {objecoes.map((o, i) => (
                <details
                  key={o.q}
                  className={`group ${i < objecoes.length - 1 ? 'border-b border-white/10' : ''}`}
                  style={{ background: '#0B0B0B' }}
                >
                  <summary
                    className="flex cursor-pointer items-start justify-between gap-4 p-6 font-display text-cream"
                    style={{
                      fontSize: '1.05rem',
                      letterSpacing: '-0.015em',
                      lineHeight: '1.3',
                      listStyle: 'none',
                    }}
                  >
                    <span>{o.q}</span>
                    <span
                      className="text-acid font-mono shrink-0 transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <div
                    className="border-t border-white/10 px-6 py-5 font-sans"
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: 'rgba(245, 241, 232, 0.82)',
                    }}
                  >
                    {o.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 8. DÚVIDAS */}
      <section id="duvidas" className="bg-ink-2 relative scroll-mt-24 py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
              // CONTATO_DIRETO
            </div>
            <h2
              className="font-display text-cream mb-5"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
              }}
            >
              Ainda tem dúvidas? <span className="text-acid">Talk direto.</span>
            </h2>
            <p
              className="mb-8 font-sans"
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.6',
                color: 'rgba(245, 241, 232, 0.8)',
              }}
            >
              Manda a dúvida específica do teu momento. Joel responde pessoalmente — sem
              intermediário, sem call obrigatória, sem script.
            </p>
            <div className="flex justify-center">
              <DoubtsPopup productSlug="advisory" landingPage="/advisory" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
