import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/seo/breadcrumbs';
import { CheckoutButton } from '@/components/features/payments/checkout-button';
import { TestimonialCarousel } from '@/components/features/testimonials/testimonial-carousel';
import { DoubtsPopup } from '@/components/features/doubts/doubts-popup';
import { getConfig } from '@/server/services/config';

interface VssPageProps {
  breadcrumbItems?: BreadcrumbItem[];
}

function brl(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function brlDecimal(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

const dores = [
  {
    n: '01',
    titulo: 'Vendas instáveis',
    sintoma:
      'Mês bom · mês ruim. Você não sabe quanto vai faturar nos próximos 30 dias. Cada novo cliente é uma luta diferente, sem padrão replicável.',
  },
  {
    n: '02',
    titulo: 'Refém da operação',
    sintoma:
      'Você é vendedor, gerente, suporte e dono. Se parar uma semana, o caixa sente. Marketing sem vendas é hobby caro. Sistema sem você é o que falta.',
  },
  {
    n: '03',
    titulo: 'Marketing sem ROI',
    sintoma:
      'Gasta em ads, indicação e post bonito, mas não sabe medir o que volta. Lead se perde em planilha. Funil é planilha. Crescer virou apostar mais.',
  },
];

const formatoCards = [
  {
    n: '①',
    titulo: 'Sistema implementável',
    desc: 'Portal logado com playbook + 15 vídeos-âncora + 66 destravamentos de 15–20 min cada. Roadmap 90 dias guiado. Não é curso pra maratonar e esquecer.',
  },
  {
    n: '②',
    titulo: 'Mentorias ao vivo com Joel',
    desc: '48 mentorias em grupo ao longo dos 12 meses (rolling). Direto comigo. Você implementa, eu reviso, ajustamos juntos. Sem intermediário.',
  },
  {
    n: '③',
    titulo: 'Comunidade + Growth CRM',
    desc: 'Growth CRM já configurado (12 meses incluídos). Comunidade ativa de quem está implementando agora. Suporte peer-to-peer + suporte técnico.',
  },
];

const pPilares = [
  {
    p: 'P1',
    nome: 'Posicionamento',
    resumo: 'Diferenciação + PUV + Big Idea. Cliente entende em 10s o que você oferece de único.',
  },
  {
    p: 'P2',
    nome: 'Público',
    resumo: 'ICP cirúrgico + persona + mapa de dores. Para de vender pra todo mundo. Conversão sobe.',
  },
  {
    p: 'P3',
    nome: 'Produto',
    resumo: 'Oferta irresistível + precificação por valor + stack empilhado. Ticket sobe sem desconto.',
  },
  {
    p: 'P4',
    nome: 'Programas',
    resumo: 'Growth CRM + funis + automação + tráfego ou prospecção. Máquina rodando 24/7.',
  },
  {
    p: 'P5',
    nome: 'Processos',
    resumo: '5 playbooks essenciais + SOPs + dashboard. O que estava na sua cabeça vira documento.',
  },
  {
    p: 'P6',
    nome: 'Pessoas',
    resumo: 'Estrutura de time por estágio + onboarding 30d + rituais. Empresa para de depender de você.',
  },
];

const fases = [
  { n: '01', nome: 'Fundamentos', janela: 'SEM 1–4', desc: 'Canvas 6Ps · P1 + P2 + P3 estruturados · 15 destravamentos' },
  { n: '02', nome: 'Infraestrutura', janela: 'SEM 5–6', desc: 'Growth CRM configurado · landing page no ar · 9 destravamentos' },
  { n: '03', nome: 'Atração', janela: 'SEM 7–10', desc: 'Orgânico + pago + prospecção ativa · 13 destravamentos' },
  { n: '04', nome: 'Conversão', janela: 'SEM 11–12', desc: 'Funis + scripts + matriz de objeções · 9 destravamentos' },
  { n: '05', nome: 'Sistema', janela: 'SEM 13 · MARCO', desc: 'Integração + processos · primeiras vendas validadas · 4 destravamentos' },
  { n: '06', nome: 'Automação', janela: 'PÓS-90D', desc: 'Workflows + IA conversacional · escala sem trabalhar 3× · 8 destravamentos' },
  { n: '07', nome: 'Crescimento', janela: 'PÓS-90D', desc: 'Analytics + P6 (time) + plano 180–365d · 8 destravamentos' },
];

const paraQuem = [
  'MPE faturando R$ 10–100k/mês',
  'Hands-on — não delega tudo',
  'Tem 6–9h/semana nas primeiras fases',
  'Aceita feedback duro e revisão',
];

const naoEPara = [
  'Quem busca DFY (alguém faz por você)',
  'Quem espera milagre em 7 dias',
  'Quem não tem nem 6h/semana',
  'Quem não aceita revisão direta',
];

const objecoes = [
  {
    q: 'R$ 1.997 está caro pra mim agora.',
    a: 'Você não paga R$ 1.997 — você recupera em 1 venda adicional de R$ 500. Stack empilhada: R$ 17.287. E tem 12× no cartão. A pergunta real é: quanto custa continuar improvisando mais 12 meses?',
  },
  {
    q: 'Não tenho tempo. Agenda caótica.',
    a: 'Você já gasta mais tempo improvisando. 6–9h/semana nas primeiras fases. Depois dos 90 dias, o sistema passa a rodar por você. É investimento de tempo, não gasto.',
  },
  {
    q: 'Meu nicho é diferente. Não vai funcionar.',
    a: 'Base aplicada em 20+ nichos — consultoria, advocacia, clínicas, academias, e-commerce, B2B, cursos, SaaS, estética, restaurantes. Os 6Ps são universais. A implementação é customizada.',
  },
  {
    q: 'Já tentei curso/agência e não deu.',
    a: 'A diferença é implementação guiada — 48 mentorias ao vivo com o Joel (rolling 12 meses) + comunidade. Não é curso pra maratonar e esquecer. É sistema pra implementar junto.',
  },
  {
    q: 'Não tenho budget pra tráfego pago.',
    a: 'VSS funciona com OU sem tráfego pago. Tem rota inteira de prospecção ativa gratuita (LinkedIn, Instagram, cold email ético). Validado em clientes com R$ 0 de budget.',
  },
  {
    q: 'E se não for pra mim?',
    a: '15 dias de garantia incondicional. Testa, não se adaptou — reembolso 100%. Sem perguntas, sem fricção. Risco zero.',
  },
  {
    q: 'O acesso é vitalício mesmo? Sem mensalidade?',
    a: 'Pagamento único de R$ 1.997 (à vista ou 12×). Acesso vitalício ao playbook + Growth CRM (12 meses incluído) + 48 mentorias ao vivo (rolling 12 meses). Sem mensalidade, sem renovação, sem upsell escondido.',
  },
  {
    q: 'Quando começam as mentorias? Sou obrigado a ir em todas?',
    a: 'Mentorias rodam ao vivo toda semana — você entra na próxima após a compra. Não é obrigado a ir em todas; ficam gravadas, acessa quando quiser. As 48 sessões são pra cobrir os 6Ps em profundidade ao longo de 12 meses.',
  },
  {
    q: 'O Growth CRM já vem configurado?',
    a: 'Vem com setup-base (pipelines VSS + estágios + automações iniciais). Na Fase 2 (Infraestrutura) você customiza pro seu nicho com mentor ao vivo guiando. 12 meses de uso incluso, depois você decide se renova.',
  },
  {
    q: 'Preciso ter equipe? Funciona sozinho?',
    a: 'Funciona sozinho — o sistema VSS foi desenhado pra dono operar nas Fases 1–4. P6 (Pessoas) entra quando você está pronto pra contratar (geralmente Fase 7+, pós-90d). Não obriga você a ter time.',
  },
  {
    q: 'Quanto tempo até ver resultado?',
    a: 'Primeiras vendas estruturadas: SEM 13 (marco do Sistema). Resultado consolidado de previsibilidade: 90 dias. Crescimento composto: 6–12 meses. Não vendo milagre — vendo sistema. Quem chega no marco SEM 13, não sai mais.',
  },
  {
    q: 'Posso pagar PIX/boleto ou só cartão?',
    a: 'Cartão (até 12×) ou PIX à vista — checkout Mercado Pago. Boleto não está habilitado pra ticket alto. PIX libera acesso instantâneo; cartão libera após confirmação (geralmente em segundos).',
  },
  {
    q: 'O que acontece se eu cancelar dentro dos 15 dias?',
    a: 'Reembolso integral, sem perguntas. Você manda email pra suporte, devolvemos em até 5 dias úteis. Acesso é revogado depois da confirmação. Sem fricção, sem retenção forçada.',
  },
];

export const revalidate = 300;

export async function VssPage({ breadcrumbItems }: VssPageProps) {
  const [vssPriceCents, stackTotalCents, guaranteeDays, installmentCents, installmentsCount, testimonials] =
    await Promise.all([
      getConfig<number>('pricing', 'vss.price_cents', 199700),
      getConfig<number>('offer', 'vss.stack_total_cents', 1728700),
      getConfig<number>('offer', 'vss.guarantee_days', 15),
      getConfig<number>('pricing', 'vss.installment_cents', 16642),
      getConfig<number>('pricing', 'vss.installments_count', 12),
      // Resolvemos via service direto pra ter contagem antes de renderizar (decisão de mostrar a seção).
      import('@/server/services/testimonials').then((m) =>
        m.listPublishedTestimonials({ product: 'vss', featured: true, limit: 6 })
      ),
    ]);

  const priceLabel = brl(vssPriceCents);
  const stackLabel = brl(stackTotalCents);
  const installmentLabel = brlDecimal(installmentCents);

  const stack = [
    {
      item: `Sistema VSS Implementável (playbook + 15 vídeos-âncora · acesso vitalício)`,
      valor: brl(199700),
    },
    { item: 'Growth CRM completo (12 meses)', valor: brl(699600) },
    { item: '48 mentorias ao vivo com Joel (rolling 12 meses)', valor: brl(720000) },
    { item: 'Templates, scripts e recursos', valor: brl(49700) },
    { item: 'Comunidade exclusiva (90 dias)', valor: brl(59700) },
  ];

  return (
    <>
      {/* 01 — HERO */}
      <section
        id="hero"
        className="bg-ink relative scroll-mt-24 overflow-hidden pt-12 pb-24 md:pt-16"
      >
        <div className="grid-overlay" />

        <Container>
          {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-5" />}
          <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.3fr_1fr] lg:gap-x-[clamp(3rem,6vw,5rem)]">
            <div className="flex flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
              <div className="kicker" style={{ color: 'var(--jb-fg-muted)' }}>
                // VSS · DIY · ACESSO VITALÍCIO
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
                De vendas <span className="text-fire">aleatórias</span> para vendas{' '}
                <span className="stroke-text">previsíveis</span>.
                <br />
                Em 90 dias.
              </h1>
              <p
                className="font-sans"
                style={{
                  fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                  lineHeight: '1.5',
                  maxWidth: '46ch',
                  margin: 0,
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                VSS é o sistema implementável que estrutura os{' '}
                <span className="text-acid">6Ps das Vendas Escaláveis</span> no seu negócio —
                portal logado + roadmap 90 dias + 48 mentorias ao vivo com o Joel + Growth CRM
                já incluído. Não é app. Não é curso solto.
              </p>

              <div className="mono text-fg-muted flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> 90 DIAS GUIADOS
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> ACESSO VITALÍCIO
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> MENTORIAS COM JOEL
                </span>
              </div>

              <Link
                href="#problema"
                className="btn-primary self-start"
                style={{ minHeight: '48px' }}
              >
                Como funciona <span className="font-mono">↓</span>
              </Link>
            </div>

            {/* Terminal window — mantém o diagnóstico 6Ps */}
            <div
              className="bg-ink-2 border border-white/10"
              style={{ boxShadow: 'var(--shadow-terminal)' }}
            >
              <div
                className="flex items-center gap-2 border-b border-white/10"
                style={{ padding: '10px 14px' }}
              >
                <span className="bg-fire inline-block rounded-full" style={{ width: '11px', height: '11px' }} />
                <span className="inline-block rounded-full" style={{ width: '11px', height: '11px', background: '#FFB020' }} />
                <span className="bg-acid inline-block rounded-full" style={{ width: '11px', height: '11px' }} />
                <span
                  className="mono text-fg-muted ml-auto"
                  style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'lowercase' }}
                >
                  vss_diag.run — system=6ps
                </span>
              </div>
              <div
                className="p-5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.7' }}
              >
                <div className="text-fg-muted">[00:00]</div>
                <div className="text-cream">&gt; scanning máquina de vendas…</div>
                <div className="text-fire">▼ P1 posicionamento .......... 01/05 fraco</div>
                <div className="text-fire">▼ P2 público ................. 02/05 fraco</div>
                <div className="text-fire">▼ P3 produto ................. 02/05 fraco</div>
                <div className="text-fire">▼ P4 programas ............... 00/05 caótico</div>
                <div className="text-fire">▼ P5 processos ............... 00/05 caótico</div>
                <div className="text-fire">▼ P6 pessoas ................. 01/05 fraco</div>
                <div className="text-cream mt-2">
                  &gt; score total: <span className="text-fire">06/30</span> · status:{' '}
                  <span className="text-fire">caótico</span>
                </div>
                <div className="text-fg-muted mt-2">[00:04]</div>
                <div className="text-cream">&gt; aplicando método VSS (90d)…</div>
                <div className="text-acid mt-2">▲ P1 ............. 04/05 forte</div>
                <div className="text-acid">▲ P2 ............. 04/05 forte</div>
                <div className="text-acid">▲ P3 ............. 04/05 forte</div>
                <div className="text-acid">▲ P4 ............. 04/05 forte</div>
                <div className="text-acid">▲ P5 ............. 03/05 estruturado</div>
                <div className="text-acid">▲ P6 ............. 03/05 estruturado</div>
                <div className="text-cream mt-2">
                  &gt; score total: <span className="text-acid">22/30</span> · status:{' '}
                  <span className="text-acid">estruturado</span>
                </div>
                <div className="text-acid mt-3">
                  ★ máquina de crescimento:{' '}
                  <span style={{ background: 'var(--jb-acid)', color: 'var(--jb-ink)', padding: '0 6px' }}>
                    ONLINE
                  </span>
                </div>
                <div className="text-fg-muted" style={{ animation: 'blink 1s infinite' }}>
                  _
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 02 — PROBLEMA */}
      <section id="problema" className="bg-ink-2 relative scroll-mt-24 py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// 02_PROBLEMA</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              Vendendo R$ 10–100k/mês mas <span className="text-fire">refém do improviso</span>?
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: '1.125rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.7)' }}
            >
              MPE que fatura mas não tem método replicável vive os mesmos 3 sintomas. Reconhece
              algum?
            </p>
          </div>

          <div className="grid gap-0 border border-white/10 md:grid-cols-3">
            {dores.map((d, i) => (
              <article
                key={d.n}
                className="p-8"
                style={{
                  borderRight: i < dores.length - 1 ? '1px solid var(--jb-hair)' : '0',
                }}
              >
                <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                  // {d.n}
                </div>
                <h3
                  className="font-display text-cream mb-3"
                  style={{ fontSize: '1.35rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}
                >
                  {d.titulo}
                </h3>
                <p
                  className="font-sans"
                  style={{ fontSize: '0.95rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.78)' }}
                >
                  {d.sintoma}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 03 — QUEM É JOEL */}
      <section id="quem-e-joel" className="bg-ink relative scroll-mt-24 overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="kicker mb-4">// 03_AUTORIDADE</div>
            <div className="grid gap-10 md:grid-cols-[1fr_1.5fr] md:items-center">
              <div className="border-acid bg-ink-2 border-l-4 p-8">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-display text-acid" style={{ fontSize: '2rem', lineHeight: '1' }}>
                      17+
                    </div>
                    <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.65rem' }}>
                      anos
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-acid" style={{ fontSize: '2rem', lineHeight: '1' }}>
                      140+
                    </div>
                    <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.65rem' }}>
                      empresas
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-acid" style={{ fontSize: '1.4rem', lineHeight: '1' }}>
                      ~R$ 1BI
                    </div>
                    <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.65rem' }}>
                      estruturado
                    </div>
                  </div>
                </div>
                <p
                  className="text-fg-muted mt-6 font-sans"
                  style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                >
                  Estimativa agregada de vendas estruturadas ao longo de 17+ anos em 140+
                  operações atendidas. Não é receita própria nem promessa de resultado.
                </p>
              </div>
              <div>
                <h2
                  className="font-display text-cream mb-6"
                  style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                    lineHeight: '0.95',
                    letterSpacing: '-0.035em',
                    textTransform: 'uppercase',
                  }}
                >
                  Da quebrada <span className="text-acid">ao bilhão</span>.
                </h2>
                <p
                  className="font-sans"
                  style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'rgba(245, 241, 232, 0.85)' }}
                >
                  Quebrei aos 25, com calote de sócio. Seis meses em barraco, R$ 300/mês, R$ 1.400
                  nos Correios pra recomeçar. Em 17+ anos estruturei vendas em 140+ empresas —
                  consultoria, varejo, B2B, holding com 1.800+ franqueados. Em 2025 dei nome ao
                  método: <span className="text-acid">6Ps das Vendas Escaláveis</span>. Não sou
                  consultor de PowerPoint. Não há fórmula mágica. Há método.
                </p>
                <p className="mono text-fg-muted mt-6">
                  ★ Joel Burigo · est. 2008 · Florianópolis/SC
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 04 — O QUE É VSS (anti-objeção) */}
      <section id="o-que-e-vss" className="bg-ink-2 relative scroll-mt-24 py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// 04_FORMATO</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              VSS <span className="text-fire">não é app</span>. <span className="text-fire">Não é curso solto</span>.
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: '1.125rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.75)' }}
            >
              É um sistema vivo de implementação. Três peças trabalhando juntas — sem precisar
              maratonar conteúdo gravado.
            </p>
          </div>

          <div className="grid gap-0 border border-white/10 md:grid-cols-3">
            {formatoCards.map((c, i) => (
              <article
                key={c.n}
                className="p-8"
                style={{
                  borderRight: i < formatoCards.length - 1 ? '1px solid var(--jb-hair)' : '0',
                  background: i === 1 ? 'rgba(198,255,0,0.04)' : 'transparent',
                }}
              >
                <div
                  className="font-display text-acid mb-4"
                  style={{ fontSize: '2.5rem', lineHeight: '1' }}
                >
                  {c.n}
                </div>
                <h3
                  className="font-display text-cream mb-3"
                  style={{ fontSize: '1.2rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}
                >
                  {c.titulo}
                </h3>
                <p
                  className="font-sans"
                  style={{ fontSize: '0.95rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.8)' }}
                >
                  {c.desc}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 05 — OS 6Ps */}
      <section id="os-6ps" className="bg-ink relative scroll-mt-24 overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// 05_FRAMEWORK</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              Os <span className="text-acid">6Ps</span> das Vendas Escaláveis
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: '1.125rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.7)' }}
            >
              Posicionamento → Público → Produto → Programas → Processos → Pessoas. Sequência
              importa — fraqueza em um compromete todos os seguintes. 17+ anos de prática
              condensados.
            </p>
          </div>

          <div className="grid gap-0 border border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {pPilares.map((p, i) => (
              <article
                key={p.p}
                className="p-8"
                style={{
                  borderRight: (i + 1) % 3 === 0 ? '0' : '1px solid var(--jb-hair)',
                  borderBottom: i < pPilares.length - 3 ? '1px solid var(--jb-hair)' : '0',
                }}
              >
                <div
                  className="font-display text-acid"
                  style={{ fontSize: '2.5rem', lineHeight: '1', letterSpacing: '-0.045em' }}
                >
                  {p.p}
                </div>
                <h3
                  className="font-display text-cream mt-2 mb-3"
                  style={{ fontSize: '1.1rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}
                >
                  {p.nome}
                </h3>
                <p
                  className="font-sans"
                  style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'rgba(245, 241, 232, 0.75)' }}
                >
                  {p.resumo}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 06 — AS 7 FASES (consolida /jornada-90-dias) */}
      <section id="as-7-fases" className="bg-ink-2 relative scroll-mt-24 py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// 06_ROADMAP</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              <span className="text-acid">7 fases</span> · 90 dias guiados ·{' '}
              <span className="stroke-text">66 destravamentos</span>
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: '1.125rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.7)' }}
            >
              Cada destravamento é ação de 15–20 min com entregável tangível. Fases 1–5 nos 90
              dias. Fases 6–7 avançadas pós-fundação. Vitalício: entra qualquer dia, começa essa
              semana.
            </p>
          </div>

          <div className="mx-auto max-w-5xl border border-white/10">
            {fases.map((f, i) => (
              <div
                key={f.n}
                className="grid gap-0 md:grid-cols-[120px_220px_1fr]"
                style={{ borderTop: i === 0 ? '0' : '1px solid var(--jb-hair)' }}
              >
                <div
                  className="flex items-center border-white/10 p-5 md:border-r"
                  style={{ background: 'rgba(198,255,0,0.04)' }}
                >
                  <span
                    className="font-display text-acid"
                    style={{ fontSize: '2.25rem', lineHeight: '1', letterSpacing: '-0.04em' }}
                  >
                    F{f.n}
                  </span>
                </div>
                <div className="flex items-center border-white/10 p-5 md:border-r">
                  <div>
                    <div
                      className="font-display text-cream"
                      style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}
                    >
                      {f.nome}
                    </div>
                    <div className="mono text-fg-muted mt-1">{f.janela}</div>
                  </div>
                </div>
                <div className="flex items-center p-5">
                  <p
                    className="font-sans"
                    style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'rgba(245, 241, 232, 0.85)' }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 07 — PROVA SOCIAL (subiu — antes do preço, gera prova primeiro) */}
      {testimonials.length > 0 && (
        <section id="prova-social" className="bg-ink-2 relative scroll-mt-24 py-12">
          <Container>
            <div className="mx-auto mb-4 max-w-3xl">
              <div className="kicker mb-4">// 07_PROVA_SOCIAL</div>
              <h2
                className="font-display text-cream mb-2"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                Quem já implementou <span className="text-acid">conta</span>.
              </h2>
            </div>
            <TestimonialCarousel productSlug="vss" featured limit={6} />
          </Container>
        </section>
      )}

      {/* 08 — PRA QUEM É / NÃO É */}
      <section id="pra-quem-e" className="bg-ink relative scroll-mt-24 overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <div className="kicker mb-4">// 08_FIT</div>
              <h2
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                VSS <span className="text-acid">é pra você</span>. VSS{' '}
                <span className="text-fire">não é pra você</span>.
              </h2>
            </div>

            <div className="grid gap-0 border border-white/10 md:grid-cols-2">
              <div
                className="border-b border-white/10 p-8 md:border-r md:border-b-0"
                style={{ background: 'linear-gradient(180deg, rgba(198,255,0,0.04), transparent)' }}
              >
                <div className="mono text-acid mb-5">▲ É PRA VOCÊ SE</div>
                <ul className="space-y-4">
                  {paraQuem.map((item) => (
                    <li
                      key={item}
                      className="text-cream flex items-start gap-3 font-sans"
                      style={{ fontSize: '1rem', lineHeight: '1.45' }}
                    >
                      <span className="text-acid">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="p-8"
                style={{ background: 'linear-gradient(180deg, rgba(255,59,15,0.04), transparent)' }}
              >
                <div className="mono text-fire mb-5">▼ NÃO É PRA VOCÊ SE</div>
                <ul className="space-y-4">
                  {naoEPara.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 font-sans"
                      style={{
                        fontSize: '1rem',
                        lineHeight: '1.45',
                        color: 'rgba(245, 241, 232, 0.8)',
                      }}
                    >
                      <span className="text-fire">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 09 — FECHAMENTO (stack + garantia + CTA num único bloco contínuo) */}
      <section
        id="investimento"
        className="bg-ink relative scroll-mt-24 overflow-hidden py-24"
      >
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <div className="kicker mb-4">// 09_INVESTIMENTO · O QUE VOCÊ LEVA</div>
              <h2
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                Stack empilhada: <span className="stroke-text">{stackLabel}</span>. Investimento:{' '}
                <span className="text-acid">{priceLabel}</span>.
              </h2>
            </div>

            {/* Tabela stack + investimento */}
            <div className="border border-white/10">
              {stack.map((s, i) => (
                <div
                  key={s.item}
                  className="grid grid-cols-[1fr_auto] gap-4 p-5 md:p-6"
                  style={{ borderTop: i === 0 ? '0' : '1px solid var(--jb-hair)' }}
                >
                  <div className="text-cream font-sans" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                    <span className="mono text-acid mr-2">▶</span>
                    {s.item}
                  </div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1rem', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}
                  >
                    {s.valor}
                  </div>
                </div>
              ))}
              <div
                className="grid grid-cols-[1fr_auto] gap-4 p-5 md:p-6"
                style={{ borderTop: '1px solid var(--jb-hair)', background: 'rgba(198,255,0,0.06)' }}
              >
                <div
                  className="font-display text-cream"
                  style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}
                >
                  Total empilhado
                </div>
                <div
                  className="font-display text-cream"
                  style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}
                >
                  {stackLabel}
                </div>
              </div>
              <div
                className="grid grid-cols-[1fr_auto] items-center gap-4 p-5 md:p-6"
                style={{ borderTop: '2px solid var(--jb-acid)', background: 'rgba(198,255,0,0.12)' }}
              >
                <div
                  className="font-display text-cream"
                  style={{ fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}
                >
                  Investimento VSS
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-2">
                    <span
                      className="mono"
                      style={{ fontSize: '0.85rem', color: 'rgba(245, 241, 232, 0.7)' }}
                    >
                      {installmentsCount}×
                    </span>
                    <span
                      className="font-display text-acid"
                      style={{
                        fontSize: 'clamp(2.25rem, 5vw, 3rem)',
                        lineHeight: '1',
                        letterSpacing: '-0.035em',
                      }}
                    >
                      {installmentLabel}
                    </span>
                  </div>
                  <div
                    className="mono mt-1"
                    style={{ fontSize: '0.8rem', color: 'rgba(245, 241, 232, 0.6)' }}
                  >
                    ou {priceLabel} à vista
                  </div>
                </div>
              </div>
            </div>

            {/* Garantia inline (badge antes do CTA — reduz risco percebido) */}
            <div
              id="garantia"
              className="border-acid mt-10 border-2 p-8 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(198,255,0,0.10), rgba(198,255,0,0.02))',
              }}
            >
              <div
                className="font-display text-acid mb-2"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: '0.9', letterSpacing: '-0.045em' }}
              >
                {guaranteeDays} DIAS
              </div>
              <div
                className="font-display text-cream mb-3"
                style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.025em',
                  textTransform: 'uppercase',
                }}
              >
                Garantia incondicional · <span className="text-acid">reembolso 100%</span>
              </div>
              <p
                className="mx-auto max-w-2xl font-sans"
                style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'rgba(245, 241, 232, 0.8)' }}
              >
                Não funcionou? Reembolso integral, sem perguntas. O risco é nosso —
                base aplicada em 140+ empresas.
              </p>
            </div>

            {/* CTA final */}
            <div
              id="cta-final"
              className="border-acid mt-10 border-2 p-10 text-center md:p-12"
              style={{
                background: 'linear-gradient(180deg, rgba(198,255,0,0.12), #050505)',
              }}
            >
              <div className="kicker mb-4">// DECISÃO</div>
              <h3
                className="font-display text-cream mb-5"
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Entra hoje. <span className="text-acid">Primeira mentoria essa semana</span>.
              </h3>
              <p
                className="mx-auto mb-8 max-w-2xl font-sans"
                style={{ fontSize: '1.05rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.85)' }}
              >
                {priceLabel} à vista ou {installmentsCount}× {installmentLabel}. Perpétuo — entra
                qualquer dia, primeira mentoria na próxima data do calendário. Sistema &gt;
                Improviso. Bora pra cima.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <CheckoutButton
                  productSlug="vss"
                  label={`ENTRAR NO VSS · ${priceLabel}`}
                  variant="fire"
                  size="lg"
                />
                <Link href="/diagnostico" className="btn-secondary">
                  Diagnóstico 6Ps grátis
                </Link>
              </div>

              <div className="mono text-fg-muted mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
                <span>
                  <span className="text-acid">★</span> ACESSO VITALÍCIO
                </span>
                <span>
                  <span className="text-acid">★</span> GROWTH CRM 12 MESES
                </span>
                <span>
                  <span className="text-acid">★</span> 48 MENTORIAS AO VIVO
                </span>
                <span>
                  <span className="text-acid">★</span> MERCADO PAGO · CARTÃO/PIX
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 10 — FAQ COMPLETA (último convite — quebra objeções remanescentes) */}
      <section id="objecoes" className="bg-ink-2 relative scroll-mt-24 py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// 10_FAQ_COMPLETA</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
              }}
            >
              Ainda <span className="text-acid">na dúvida</span>? Lê isso aqui.
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: '1rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.75)' }}
            >
              Compilei {objecoes.length} perguntas que quase todo mundo faz antes de entrar. Se a sua
              não tá aqui, tem o popup logo abaixo — eu respondo direto.
            </p>
          </div>

          <div className="mx-auto max-w-5xl border border-white/10">
            {objecoes.map((o, i) => (
              <details
                key={o.q}
                className="group"
                style={{ borderTop: i === 0 ? '0' : '1px solid var(--jb-hair)' }}
              >
                <summary
                  className="font-display text-cream flex cursor-pointer items-center justify-between gap-4 p-6 md:p-8"
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    listStyle: 'none',
                  }}
                >
                  <span>{o.q}</span>
                  <span
                    className="text-acid group-open:rotate-45"
                    style={{ transition: 'transform 180ms' }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 md:px-8 md:pb-8">
                  <p
                    className="font-sans"
                    style={{ fontSize: '1rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.85)' }}
                  >
                    {o.a}
                  </p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="#cta-final" className="btn-primary" style={{ minHeight: '48px' }}>
              Convencido? Entrar agora <span className="font-mono">↑</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* 11 — DÚVIDAS (suporte fallback se nem FAQ resolveu) */}
      <section id="duvidas" className="bg-ink relative scroll-mt-24 overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="kicker mb-4">// 11_DÚVIDAS</div>
            <h2
              className="font-display text-cream mb-4"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
              }}
            >
              Ainda tem <span className="text-acid">dúvidas</span>?
            </h2>
            <p
              className="mb-8 font-sans"
              style={{ fontSize: '1.05rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.8)' }}
            >
              Joel responde direto. Em até 24h. Sem call obrigatória, sem script.
            </p>
            <div className="flex justify-center">
              <DoubtsPopup productSlug="vss" landingPage="/vendas-sem-segredos" />
            </div>
            <p className="mono text-fg-muted mt-8">
              ★ SISTEMA &gt; IMPROVISO · SEMPRE ABERTO · EST. 2008
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
