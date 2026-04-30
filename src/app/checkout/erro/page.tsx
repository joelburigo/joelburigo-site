import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui';
import { Container } from '@/components/patterns/container';
import { getProductInfo } from '../_lib/product-info';

export const metadata: Metadata = {
  title: 'Pagamento não aprovado',
  robots: { index: false, follow: false },
};

interface SearchParams {
  product?: string;
  payment_id?: string;
  status?: string;
  preference_id?: string;
}

export default async function CheckoutErroPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const product = getProductInfo(params.product);
  const paymentId = params.payment_id ?? '';

  return (
    <section className="bg-ink relative overflow-hidden py-24">
      <div className="grid-overlay" />
      <Container>
        <div
          className="border-fire mx-auto max-w-3xl border-2 p-10 md:p-16"
          style={{ background: 'linear-gradient(180deg, rgba(255,59,15,0.08), #050505)' }}
        >
          <div className="mono text-fire mb-5">// {product.shortName} · STATUS=REJECTED</div>
          <h1
            className="font-display text-cream mb-6"
            style={{
              fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
              lineHeight: '0.92',
              letterSpacing: '-0.045em',
              textTransform: 'uppercase',
            }}
          >
            Não <span className="text-fire">rolou</span>.
          </h1>
          <p
            className="text-cream mb-6 font-sans"
            style={{ fontSize: '1.125rem', lineHeight: '1.55' }}
          >
            {product.errorCopy}
          </p>

          {paymentId && (
            <div className="mono text-fg-muted mb-8" style={{ fontSize: '0.8rem' }}>
              // payment_id: {paymentId}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href={product.productPath} variant="fire">
              TENTAR DE NOVO →
            </ButtonLink>
            <ButtonLink
              href="mailto:joel@joelburigo.com.br?subject=Erro%20no%20checkout"
              external
              variant="secondary"
            >
              Falar com o Joel
            </ButtonLink>
          </div>

          <p className="mono text-fg-muted mt-10" style={{ fontSize: '0.8rem' }}>
            ★ Cartão recusou? Pix funciona pra qualquer banco e libera acesso na hora.
          </p>
        </div>
      </Container>
    </section>
  );
}
