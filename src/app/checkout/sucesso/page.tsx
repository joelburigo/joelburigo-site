import type { Metadata } from 'next';
import Script from 'next/script';
import { ButtonLink } from '@/components/ui';
import { Container } from '@/components/patterns/container';
import { env } from '@/env';
import { getProductInfo } from '../_lib/product-info';

export const metadata: Metadata = {
  title: 'Pagamento aprovado',
  robots: { index: false, follow: false },
};

interface SearchParams {
  product?: string;
  payment_id?: string;
  status?: string;
  preference_id?: string;
}

export default async function CheckoutSucessoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const product = getProductInfo(params.product);
  const paymentId = params.payment_id ?? '';
  const gtmId = env.PUBLIC_GTM_ID;

  return (
    <>
      {gtmId && paymentId && (
        <Script
          id="gtm-purchase-event"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'purchase',transaction_id:${JSON.stringify(
              paymentId
            )},product_slug:${JSON.stringify(product.slug)}});`,
          }}
        />
      )}

      <section className="bg-ink relative overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div
            className="border-acid mx-auto max-w-3xl border-2 p-10 md:p-16"
            style={{ background: 'linear-gradient(180deg, rgba(198,255,0,0.08), #050505)' }}
          >
            <div className="mono text-acid mb-5">// {product.shortName} · STATUS=APPROVED</div>
            <h1
              className="font-display text-acid mb-6"
              style={{
                fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.045em',
                textTransform: 'uppercase',
              }}
            >
              Pagamento <span className="text-cream">aprovado</span> ✓
            </h1>
            <p
              className="text-cream mb-6 font-sans"
              style={{ fontSize: '1.125rem', lineHeight: '1.55' }}
            >
              {product.successCopy}
            </p>

            {paymentId && (
              <div className="mono text-fg-muted mb-8" style={{ fontSize: '0.8rem' }}>
                // payment_id: {paymentId}
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/app/area" variant="primary">
                IR PARA A ÁREA →
              </ButtonLink>
              <ButtonLink href={product.productPath} variant="secondary">
                Voltar para {product.shortName}
              </ButtonLink>
            </div>

            <p className="mono text-fg-muted mt-10" style={{ fontSize: '0.8rem' }}>
              ★ DÚVIDA? joel@joelburigo.com.br · Resposta em horário comercial.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
