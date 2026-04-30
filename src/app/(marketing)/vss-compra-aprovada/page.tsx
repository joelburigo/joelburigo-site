import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Compra aprovada · VSS',
  robots: { index: false, follow: false },
};

export default function VssCompraAprovadaPage() {
  return (
    <section className="section">
      <Container size="md" className="text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="kicker text-acid">// PAGAMENTO APROVADO</span>
          <h1 className="text-display-md">Pronto. A máquina tá ligada.</h1>
          <p className="body-lg text-fg-2">
            Enviei um email com o link de acesso. Clica nele e vamos começar seu onboarding com o
            copiloto — 10 min pra mapear sua empresa e abrir a Fase 1 do VSS.
          </p>
          <p className="mono text-fg-muted">// Growth CRM: provisionamento em andamento</p>
          <ButtonLink href="/entrar" variant="primary">
            Entrar agora <span className="font-mono" aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
