import type { Metadata } from 'next';
import { AdvisoryPage } from '@/components/sections/advisory-page';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Advisory 1:1 | Joel Burigo',
  description:
    'Mentoria estratégica direto comigo. Sessões mensais + WhatsApp para decisões críticas.',
  keywords: [
    'consultoria estratégica',
    'mentoria CEO',
    'sparring partner',
    'consultoria vendas',
    'Joel Burigo',
  ],
  alternates: { canonical: '/advisory' },
};

export const revalidate = 300;

const advisorySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Strategic Advisory',
  description:
    'Mentoria estratégica direto comigo. Sessões mensais + WhatsApp para decisões críticas.',
  url: `${SITE.url}/advisory`,
  provider: {
    '@type': 'Person',
    name: 'Joel Burigo',
    url: `${SITE.url}/sobre`,
    jobTitle: 'Especialista em Vendas Escaláveis',
  },
  serviceType: 'Consultoria Estratégica 1-on-1',
  areaServed: { '@type': 'Country', name: 'Brasil' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Modalidades Advisory',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Sprint Estratégico 30 Dias',
          description: '4 sessões de 90 minutos em 30 dias intensivos',
        },
        price: '7500',
        priceCurrency: 'BRL',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Conselho Executivo',
          description: 'Acompanhamento executivo contínuo de 3-6 meses',
        },
        price: '15000',
        priceCurrency: 'BRL',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '15000',
          priceCurrency: 'BRL',
          unitText: 'mês',
        },
      },
    ],
  },
};

export default async function AdvisoryRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(advisorySchema) }}
      />
      <AdvisoryPage
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Advisory', href: '/advisory' },
        ]}
      />
    </>
  );
}
