import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { AdvisoryApplicationForm } from '@/components/features/advisory/advisory-application-form';
import type { AdvisoryFormato } from '@/components/features/advisory/advisory-application-form';

export const metadata: Metadata = {
  title: 'Aplicar pra Advisory — Sprint + Conselho | Joel Burigo',
  description:
    'Aplicação Sprint Estratégico 30 Dias ou Conselho Executivo. Análise direta do Joel · vagas limitadas conforme capacidade.',
  keywords: ['advisory', 'sprint estratégico', 'conselho executivo', 'consultoria', 'Joel Burigo'],
  robots: { index: false, follow: false },
  alternates: { canonical: '/advisory-aplicacao' },
};

const VALID: ReadonlySet<AdvisoryFormato> = new Set(['sprint', 'conselho', 'ambos']);

interface SearchParams {
  formato?: string;
}

const steps = [
  {
    n: '01',
    title: 'Você aplica',
    body: 'Preenche os 3 blocos abaixo: identificação, empresa, momento + dor.',
  },
  {
    n: '02',
    title: 'Análise direta do Joel',
    body: 'Leio pessoalmente. Sem fila, sem intermediário. Triagem mútua honesta.',
  },
  {
    n: '03',
    title: 'Resposta + próximos passos',
    body: 'Se houver fit, chamo no WhatsApp pra alinhar. Se não, indico VSS ou alternativa.',
  },
];

export default async function AdvisoryAplicacaoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { formato: formatoRaw } = await searchParams;
  const formato: AdvisoryFormato =
    formatoRaw && VALID.has(formatoRaw as AdvisoryFormato)
      ? (formatoRaw as AdvisoryFormato)
      : 'sprint';

  const headlineParts: { lead: string; tail: string } =
    formato === 'conselho'
      ? { lead: 'Aplicar pro', tail: 'Conselho Executivo.' }
      : formato === 'ambos'
        ? { lead: 'Aplicar pra', tail: 'Advisory.' }
        : { lead: 'Aplicar pra', tail: 'Sprint Estratégico.' };

  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <div className="kicker mb-6">// ADVISORY · APLICAÇÃO · ANÁLISE_DE_FIT</div>
              <h1
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(2.25rem, 6.5vw, 4rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  lineHeight: '0.92',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                {headlineParts.lead}
                <span className="text-acid block">{headlineParts.tail}</span>
              </h1>
              <p className="text-cream mt-6 max-w-2xl font-sans text-lg">
                Preenche detalhando teu momento. Analiso pessoalmente ·{' '}
                <strong className="text-acid">resposta direta do Joel</strong>, sem fila, sem
                intermediário.
              </p>
            </div>

            <div className="bg-ink-2 mb-10 border border-[var(--jb-hair)] p-6">
              <div className="kicker mb-6">// COMO_FUNCIONA</div>
              <div className="grid gap-6 md:grid-cols-3">
                {steps.map((step) => (
                  <div key={step.n}>
                    <div
                      className="text-acid mb-3 font-mono text-sm font-bold"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      {step.n}
                    </div>
                    <h3 className="heading-4 text-cream mb-2">{step.title}</h3>
                    <p className="text-fg-2 font-sans text-sm">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <AdvisoryApplicationForm formato={formato} />

            <div className="border-fire bg-ink-2 mt-10 border-l-2 p-6">
              <div className="kicker mb-2" style={{ color: 'var(--jb-fire)' }}>
                // VAGAS · LIMITADAS · CONFORME_CAPACIDADE
              </div>
              <p className="text-cream font-sans">
                Aceito quem tá em momento crítico real, fatura R$ 200k+/mês e vai executar. Se
                não houver fit no momento, indico VSS ou recurso gratuito — sem empurrar venda
                forçada.
              </p>
            </div>

            <div className="mt-10">
              <Link
                href="/advisory"
                className="text-fg-3 hover:text-acid font-mono text-[12px] tracking-[0.22em] uppercase"
              >
                ← Voltar pra Advisory
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
