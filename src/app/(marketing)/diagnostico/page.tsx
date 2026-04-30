import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { DiagnosticoWizard } from '@/components/features/diagnostico/diagnostico-wizard';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Diagnóstico 6Ps · Raio-X de Vendas | Joel Burigo',
  description:
    'Diagnóstico 6Ps em 5 minutos. Receba seu nível de maturidade comercial e o caminho pra destravar a Máquina.',
  keywords: [
    'diagnóstico vendas',
    'diagnóstico 6Ps',
    'maturidade comercial',
    'framework 6Ps',
    'Joel Burigo',
  ],
  alternates: { canonical: '/diagnostico' },
};

export default function DiagnosticoRoute() {
  return (
    <main className="bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        {/* Hero */}
        <section className="pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="mx-auto max-w-4xl">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Diagnóstico', href: '/diagnostico' },
              ]}
              className="mb-5"
            />
            <div className="kicker mb-6">// DIAGNÓSTICO · 6PS · 5_MINUTOS</div>
            <h1
              className="font-display text-cream"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: '0.92',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Tua empresa é <span className="text-fire">Máquina</span> ou improviso?
            </h1>
            <p className="text-cream mt-6 max-w-2xl font-sans text-lg">
              Diagnóstico baseado em <strong>140+ empresas</strong> em <strong>17+ anos</strong>.
              6 perguntas, raio-x dos <span className="text-acid">6Ps das Vendas Escaláveis</span>,
              score 0–24 — em minutos você descobre qual P está travando.
            </p>
            <p className="text-fg-muted mt-3 max-w-2xl font-mono text-[12px] tracking-[0.22em] uppercase">
              <span className="text-acid">●</span>&nbsp; 5 MIN &nbsp;·&nbsp; GRÁTIS &nbsp;·&nbsp;
              SEM ENROLAÇÃO
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#wizard" variant="primary" size="lg">
                <span>COMEÇAR</span>
                <span aria-hidden="true">↓</span>
              </ButtonLink>
            </div>

            {/* Bloco honestidade — voz Joel (copy 1:1 de docs/conteudo/sections/diagnostico-page) */}
            <div className="border-fire bg-fire/5 mt-10 border-l-4 p-5">
              <div className="kicker mb-2" style={{ color: 'var(--jb-fire)' }}>
                // NA_MORAL
              </div>
              <p className="text-cream font-sans">
                Não é teste de certo ou errado. É radiografia real do que impede tua empresa de
                escalar. <strong>Responde com sinceridade</strong> — maquiar diagnóstico é
                improvisar cura. E improviso mata mais empresa que crise.
              </p>
            </div>
          </div>
        </section>

        {/* Wizard */}
        <section id="wizard" className="pb-16 md:pb-24 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="bg-ink-2 border border-[var(--jb-acid-border)] p-6 md:p-10">
              <div className="mb-8 flex items-center gap-2 border-b border-[var(--jb-hair)] pb-4">
                <span className="bg-fire inline-block h-3 w-3" />
                <span className="inline-block h-3 w-3" style={{ background: '#FFB020' }} />
                <span className="bg-acid inline-block h-3 w-3" />
                <span className="text-fg-muted ml-3 font-mono text-[11px] tracking-[0.22em] uppercase">
                  &gt; diagnostico_6ps.run
                </span>
              </div>
              <DiagnosticoWizard />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
