import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Aguardando pagamento · VSS',
  robots: { index: false, follow: false },
};

export default function VssAguardandoPage() {
  return (
    <section className="section">
      <Container size="md" className="text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="kicker">// AGUARDANDO CONFIRMAÇÃO</span>
          <h1 className="text-display-md">Pagamento em processamento</h1>
          <p className="body-lg text-fg-2">
            Se foi PIX, costuma confirmar em segundos. Se foi boleto, até 3 dias úteis. Assim que
            aprovar, te mando um email com o link de acesso.
          </p>
          <p className="mono text-fg-muted">// Você pode fechar esta página</p>
          <ButtonLink href="/" variant="secondary">
            Voltar pra home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
