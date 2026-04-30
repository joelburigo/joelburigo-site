import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';
import { contactInfo, getWhatsAppLink } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Análise de crédito — VSS | Joel Burigo',
  description: 'Pagamento em análise pela operadora do cartão.',
  robots: { index: false, follow: false },
};

const items = [
  {
    n: '01',
    title: 'Análise antifraude',
    body: 'Operadora verifica se a transação é legítima. Normal e esperado.',
    icon: '●',
  },
  {
    n: '02',
    title: 'Tempo de análise',
    body: 'Minutos a 24 horas na maioria dos casos. Raro ultrapassar 3 dias úteis.',
    icon: '▶',
  },
  {
    n: '03',
    title: 'Notificação por email',
    body: 'Você recebe email quando aprovar ou recusar. Olha também o spam.',
    icon: '▶',
  },
];

export default function VssAnaliseCreditoPage() {
  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />
      <Container className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="kicker mb-6" style={{ color: 'var(--jb-fire)' }}>
              // VSS · STATUS: UNDER_REVIEW · ANÁLISE_CRÉDITO
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
              <span className="stroke-text">PAGAMENTO</span>
              <span className="text-fire block">EM ANÁLISE.</span>
            </h1>

            <p className="text-cream mt-8 max-w-2xl font-sans text-lg">
              A operadora do cartão está verificando a transação. Procedimento padrão de segurança —
              protege você e nós contra fraude.
            </p>

            <div className="mt-12 space-y-6">
              {items.map((item) => (
                <div
                  key={item.n}
                  className="border-acid bg-ink-2 flex items-start gap-5 border-l-2 p-5"
                >
                  <div
                    className="text-acid shrink-0 font-mono text-sm font-bold"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    {item.n}
                  </div>
                  <div className="flex-1">
                    <h3 className="heading-4 text-cream mb-1">
                      <span className="text-acid">{item.icon}</span>&nbsp; {item.title}
                    </h3>
                    <p className="text-fg-2 font-sans">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-ink-2 mt-12 border border-[var(--jb-fire-border)] p-6">
              <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                // CASO_RECUSADO · PLANOS_B
              </div>
              <ul className="text-fg-2 space-y-2 font-sans">
                <li>
                  <span className="text-acid">▶</span> Tentar com outro cartão
                </li>
                <li>
                  <span className="text-acid">▶</span> Pagar via PIX (confirmação instantânea)
                </li>
                <li>
                  <span className="text-acid">▶</span> Pagar via boleto (1-3 dias úteis)
                </li>
                <li>
                  <span className="text-acid">▶</span> Falar com a gente que a gente resolve
                </li>
              </ul>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink
                href={getWhatsAppLink(
                  'Olá! Meu pagamento do Vendas Sem Segredos está em análise de crédito. Gostaria de saber o status.'
                )}
                external
                variant="primary"
                size="lg"
              >
                <span>Falar com suporte</span>
                <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink
                href="/vendas-sem-segredos#investimento"
                variant="secondary"
                size="lg"
              >
                Tentar outro pagamento
              </ButtonLink>
            </div>

            <div className="text-fg-muted mt-12 border-t border-[var(--jb-hair)] pt-6 font-mono text-[11px] tracking-[0.22em] uppercase">
              WHATSAPP: {contactInfo.phone.display} &nbsp;·&nbsp; EMAIL: {contactInfo.email.main}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
