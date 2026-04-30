import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Agendamento de Sessão Advisory · Joel Burigo',
  description:
    'Página de orientação pós-compra da Sessão Advisory. Confira seu email pelo link único de agendamento.',
  robots: { index: false, follow: false },
};

export default function AgendamentoSessaoPage() {
  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12">
              <div className="kicker mb-6">// ADVISORY · AGENDAMENTO · LINK_NO_EMAIL</div>
              <h1
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(2.25rem, 6vw, 4rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  lineHeight: '0.96',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Já comprou sua <span className="text-acid">Sessão Advisory?</span>
              </h1>
              <p className="text-cream mt-6 font-sans text-lg">
                O agendamento agora é via link único enviado pra teu email logo após a confirmação
                do pagamento.
              </p>
            </div>

            <div
              className="bg-ink-2 mb-6 border p-8"
              style={{ borderColor: 'var(--jb-acid-border)' }}
            >
              <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                // CONFIRA_SEU_EMAIL
              </div>
              <h2 className="heading-3 text-cream mb-3">Link enviado pra tua caixa de entrada</h2>
              <p className="text-fg-2 mb-6 font-sans text-base">
                Enviei o link único de agendamento direto pra tua caixa de entrada — vale por{' '}
                <strong className="text-acid">30 dias</strong>. Abre lá, escolhe o melhor horário e
                recebe a confirmação por email.
              </p>
              <p className="text-fg-3 mb-6 font-mono text-[12px] tracking-wide uppercase">
                Se não chegou em poucos minutos, dá uma olhada no spam ou promoções antes de pedir
                ajuda.
              </p>
              <ButtonLink href="/contato" variant="primary">
                Não recebi o email
              </ButtonLink>
            </div>

            <div
              className="bg-ink-2 mb-10 border p-8"
              style={{ borderColor: 'var(--jb-fire-border)' }}
            >
              <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                // AINDA_QUER_COMPRAR
              </div>
              <h2 className="heading-3 text-cream mb-3">Sessão Advisory — R$ 997</h2>
              <p className="text-fg-2 mb-2 font-sans text-base">
                90 minutos comigo · diagnóstico 6Ps · plano de ação com 3-5 prioridades · gravação +
                relatório executivo.
              </p>
              <p className="text-fg-3 mb-6 font-mono text-[12px] tracking-wide uppercase">
                Máximo 4 sessões/mês na agenda.
              </p>
              <ButtonLink href="/advisory" variant="fire">
                Ver Sessão Advisory
              </ButtonLink>
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
