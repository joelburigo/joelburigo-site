import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { Agentation } from 'agentation';
import { fontsClassName } from '@/lib/fonts';
import { SITE } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.longName,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: SITE.keywords.split(', '),
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.longName,
    title: SITE.longName,
    description: SITE.description,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: SITE.longName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.longName,
    description: SITE.description,
    creator: SITE.twitter,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
  },
  other: {
    'cloudflare-email-obfuscation': 'off',
    'geo.region': SITE.region,
    'geo.placename': SITE.place,
    language: 'Portuguese',
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.language} className={fontsClassName} data-scroll-behavior="smooth">
      <body className="bg-ink text-cream antialiased">
        {/* window.__JB_ENV servido por /api/public-env.js — external script
            evita warning React 19 de inline <script> dentro do tree. */}
        <Script src="/api/public-env.js" strategy="beforeInteractive" />
        {children}
        <Toaster
          theme="dark"
          richColors
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--jb-ink-2)',
              color: 'var(--jb-cream)',
              border: '1px solid var(--jb-acid-border)',
              borderRadius: 0,
              fontFamily: 'var(--font-archivo, Archivo, sans-serif)',
            },
          }}
        />
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  );
}
