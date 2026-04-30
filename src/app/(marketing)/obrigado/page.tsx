import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Obrigado',
  robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
  return (
    <section className="section">
      <Container size="md" className="text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="kicker">// RECEBIDO</span>
          <h1 className="text-display-sm md:text-display-md">Recebi. Já te respondo.</h1>
          <p className="body-lg text-fg-2">
            Vou ler com calma e te mando um retorno em até 2 dias úteis.
          </p>
          <ButtonLink href="/" variant="primary">
            Voltar pra home <span className="font-mono" aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
