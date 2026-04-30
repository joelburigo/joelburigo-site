import { ButtonLink } from '@/components/ui';
import { Container } from '@/components/patterns/container';

export default function NotFound() {
  return (
    <div className="bg-ink flex min-h-screen items-center justify-center py-20">
      <Container size="md" className="text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="kicker">// ERROR 404</span>
          <h1 className="text-display-lg stroke-text">404</h1>
          <h2 className="text-display-sm">Esta página saiu do mapa.</h2>
          <p className="body-lg text-fg-3">
            A URL mudou, o link tá quebrado ou a página nunca existiu. Volta pra home ou tenta o
            diagnóstico.
          </p>
          <div className="flex gap-4">
            <ButtonLink href="/" variant="primary">
              Ir pra home <span className="font-mono">→</span>
            </ButtonLink>
            <ButtonLink href="/diagnostico" variant="secondary">
              Fazer diagnóstico
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
