import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { contactInfo, getWhatsAppLink } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Aplicação recebida — Advisory | Joel Burigo',
  description: 'Sua aplicação para Advisory foi recebida. Análise de fit direta do Joel, sem fila.',
  robots: { index: false, follow: false },
};

const steps = [
  {
    n: '01',
    title: 'Análise de fit',
    body: 'Leio pessoalmente a aplicação e avalio se o momento atual e o desafio são adequados pra Advisory. Honestidade brutal: se não for, indico alternativa.',
  },
  {
    n: '02',
    title: 'Contato via WhatsApp',
    body: 'Se tiver fit, chamo no WhatsApp que você informou pra agendar conversa inicial de 30 minutos.',
  },
  {
    n: '03',
    title: 'Alinhamento',
    body: 'Na conversa validamos expectativa e definimos qual formato faz mais sentido: Sessão, Sprint ou Conselho Executivo.',
  },
];

interface SearchParams {
  id?: string;
}

export default async function AdvisoryObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await searchParams;
  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="kicker mb-6">
              // ADVISORY · STATUS: RECEBIDO · ANÁLISE_FIT_EM_ANDAMENTO
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
              <span className="stroke-text">APLICAÇÃO</span>
              <span className="text-acid block">RECEBIDA.</span>
            </h1>

            <p className="text-cream mt-8 max-w-2xl font-sans text-lg">
              Aplicação recebida. <strong className="text-acid">Joel responde em até 48h</strong>{' '}
              via email ou WhatsApp · sem fila, sem intermediário.
            </p>

            {id && (
              <p className="text-fg-muted mt-3 font-mono text-[11px] tracking-[0.22em] uppercase">
                ★ ref: <span className="text-acid">{id}</span>
              </p>
            )}

            <div className="bg-ink-2 mt-12 border border-[var(--jb-acid-border)] p-8">
              <div className="kicker mb-6" style={{ color: 'var(--jb-acid)' }}>
                // PRÓXIMOS_PASSOS
              </div>
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

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="card">
                <div className="kicker mb-3">// VAGAS · LIMITADAS</div>
                <p className="text-fg-2 font-sans">
                  Vagas limitadas conforme capacidade do momento — tanto no Sprint quanto no
                  Conselho Executivo. É sério.
                </p>
              </div>
              <div className="card">
                <div className="kicker mb-3">// RESPOSTA · HONESTA</div>
                <p className="text-fg-2 font-sans">
                  Se não houver fit, indico VSS ou recursos gratuitos. Sem empurrar venda forçada.
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-[var(--jb-hair)] pt-8">
              <div className="kicker mb-4">// ENQUANTO_AGUARDA</div>
              <p className="text-cream mb-4 font-sans">
                Faz o diagnóstico gratuito dos 6Ps e descobre onde teu sistema de vendas está
                travando.
              </p>
              <Link href="/diagnostico" className="btn-primary min-h-[48px]">
                <span>Diagnóstico grátis · 10 min</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              <Link href="/blog" className="card group flex items-center justify-between">
                <div>
                  <div className="kicker mb-1">// BLOG</div>
                  <div className="font-display text-cream">+50 artigos</div>
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

            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href={getWhatsAppLink(
                  'Olá! Enviei aplicação pra Advisory e tenho dúvidas sobre o processo.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-h-[48px]"
              >
                WhatsApp: {contactInfo.phone.display}
              </a>
              <Link href="/advisory" className="btn-secondary min-h-[48px]">
                Voltar pra Advisory
              </Link>
            </div>

            <div className="text-fg-muted mt-12 border-t border-[var(--jb-hair)] pt-8 font-mono text-[11px] tracking-[0.28em] uppercase">
              <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
              <span className="text-fire">&gt;</span> IMPROVISO · BORA PRA CIMA
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
