import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui';
import { Container } from '@/components/patterns/container';
import { getProductInfo } from '../_lib/product-info';

export const metadata: Metadata = {
  title: 'Pagamento em análise',
  robots: { index: false, follow: false },
};

interface SearchParams {
  product?: string;
  payment_id?: string;
  status?: string;
  preference_id?: string;
}

export default async function CheckoutPendentePage({
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
          className="mx-auto max-w-3xl border-2 p-10 md:p-16"
          style={{
            borderColor: '#FFB020',
            background: 'linear-gradient(180deg, rgba(255,176,32,0.08), #050505)',
          }}
        >
          <div className="mono mb-5" style={{ color: '#FFB020' }}>
            // {product.shortName} · STATUS=PENDING
          </div>
          <h1
            className="font-display text-cream mb-6"
            style={{
              fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
              lineHeight: '0.92',
              letterSpacing: '-0.045em',
              textTransform: 'uppercase',
            }}
          >
            Em <span style={{ color: '#FFB020' }}>análise</span>.
          </h1>
          <p
            className="text-cream mb-6 font-sans"
            style={{ fontSize: '1.125rem', lineHeight: '1.55' }}
          >
            {product.pendingCopy}
          </p>

          {paymentId && (
            <div className="mono text-fg-muted mb-8" style={{ fontSize: '0.8rem' }}>
              // payment_id: {paymentId}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/app/area" variant="secondary">
              ACOMPANHAR NA ÁREA →
            </ButtonLink>
            <ButtonLink href={product.productPath} variant="secondary">
              Voltar para {product.shortName}
            </ButtonLink>
          </div>

          <p className="mono text-fg-muted mt-10" style={{ fontSize: '0.8rem' }}>
            ★ Dúvida sobre o pagamento? joel@joelburigo.com.br
          </p>
        </div>
      </Container>
    </section>
  );
}
