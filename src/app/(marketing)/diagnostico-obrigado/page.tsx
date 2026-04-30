import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Diagnóstico concluído | Joel Burigo',
  description: 'Seu diagnóstico 6Ps foi processado. Resultado chegando no WhatsApp e email.',
  robots: { index: false, follow: false },
};

const steps = [
  {
    n: '01',
    title: 'Processamento automático',
    body: 'Suas respostas rodaram nos 6Ps. Score por P, gargalos, prioridades.',
  },
  {
    n: '02',
    title: 'Entrega em instantes',
    body: 'WhatsApp + email chegam com radar dos 6Ps, análise detalhada e plano de ação personalizado.',
  },
  {
    n: '03',
    title: 'Próximos passos',
    body: 'Com base no diagnóstico, eu recomendo o caminho: VSS (DIY) ou Advisory (1:1 comigo).',
  },
];

export default function DiagnosticoObrigadoPage() {
  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />
      <Container className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="kicker mb-6">
              // DIAGNÓSTICO · STATUS: PROCESSADO · RESULTADO_ENVIADO
            </div>

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
              <span className="stroke-text">DIAGNÓSTICO</span>
              <span className="text-acid block">CONCLUÍDO.</span>
            </h1>

            <p className="text-cream mt-8 max-w-2xl font-sans text-lg">
              Suas respostas foram processadas. O raio-X dos 6Ps tá indo pro teu WhatsApp e email
              agora.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="card" style={{ borderColor: 'var(--jb-acid-border)' }}>
                <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
                  // CANAL · WHATSAPP
                </div>
                <h3 className="heading-4 text-cream mb-2">Resultado completo</h3>
                <p className="text-fg-2 font-sans">
                  Análise automática dos 6Ps + score por P + diagnóstico estratégico chegando no teu
                  WhatsApp agora.
                </p>
              </div>
              <div className="card">
                <div className="kicker mb-3">// CANAL · EMAIL</div>
                <h3 className="heading-4 text-cream mb-2">Link pro raio-X</h3>
                <p className="text-fg-2 font-sans">
                  Também chega por email um link pra acessar o diagnóstico completo com plano de
                  ação.
                </p>
              </div>
            </div>

            <div className="bg-ink-2 mt-12 border border-[var(--jb-hair)] p-8">
              <div className="kicker mb-6">// O_QUE_ACONTECE_AGORA</div>
              <ol className="space-y-6">
                {steps.map((step) => (
                  <li key={step.n} className="flex items-start gap-5">
                    <div
                      className="text-acid shrink-0 font-mono text-sm font-bold"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      {step.n}
                    </div>
                    <div>
                      <h3 className="heading-4 text-cream mb-1">{step.title}</h3>
                      <p className="text-fg-2 font-sans">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-fire bg-ink-2 mt-12 border-l-2 p-8">
              <div className="kicker mb-3" style={{ color: 'var(--jb-fire)' }}>
                // ENQUANTO_AGUARDA
              </div>
              <h2 className="heading-2 text-cream mb-4">Conhece o framework 6Ps.</h2>
              <p className="text-fg-2 mb-6 font-sans">
                O diagnóstico que você fez é baseado na mesma base aplicada em 140+ empresas. Veja
                como funciona o VSS completo.
              </p>
              <ButtonLink href="/vendas-sem-segredos" variant="primary" size="lg" prefetch>
                <span>Conhecer VSS</span>
                <span aria-hidden="true">→</span>
              </ButtonLink>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              <Link href="/blog" className="card group flex items-center justify-between">
                <div>
                  <div className="kicker mb-1">// BLOG</div>
                  <div className="font-display text-cream">Ler artigos</div>
                </div>
                <span className="text-acid text-xl">→</span>
              </Link>
              <Link href="/cases" className="card group flex items-center justify-between">
                <div>
                  <div className="kicker mb-1">// CASES</div>
                  <div className="font-display text-cream">Resultados reais</div>
                </div>
                <span className="text-acid text-xl">→</span>
              </Link>
            </div>

            <div className="text-fg-muted mt-12 border-t border-[var(--jb-hair)] pt-8 font-mono text-[11px] tracking-[0.28em] uppercase">
              <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
              <span className="text-fire">&gt;</span> IMPROVISO · LET&apos;S GROW
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
