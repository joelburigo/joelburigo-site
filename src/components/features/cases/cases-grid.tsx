'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Testimonial } from '@/server/db/schema';
import { Button } from '@/components/ui';

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'vss', label: 'VSS' },
  { value: 'advisory', label: 'Advisory' },
] as const;

type FilterValue = (typeof filters)[number]['value'];

interface Props {
  items: Testimonial[];
  r2PublicUrl: string;
}

function resolveImage(path: string | null, r2PublicUrl: string): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  if (!r2PublicUrl) return null;
  return `${r2PublicUrl.replace(/\/$/, '')}/${path}`;
}

export function CasesGrid({ items, r2PublicUrl }: Props) {
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = items.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'vss') return t.product_used === 'vss' || t.product_used === 'both';
    if (filter === 'advisory') return t.product_used === 'advisory' || t.product_used === 'both';
    return true;
  });

  return (
    <>
      <section className="pb-10">
        <div className="mx-auto max-w-5xl">
          <div className="kicker mb-4">// FILTRAR_POR_PRODUTO</div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f.value}
                onClick={() => setFilter(f.value)}
                variant={filter === f.value ? 'primary' : 'secondary'}
                size="sm"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((t) => (
              <CaseCard key={t.id} t={t} r2PublicUrl={r2PublicUrl} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="border border-[var(--jb-hair)] p-12 text-center">
              <p className="text-fg-3 font-mono text-sm tracking-[0.22em] uppercase">
                Nenhum case neste filtro.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CaseCard({ t, r2PublicUrl }: { t: Testimonial; r2PublicUrl: string }) {
  const isAdvisory = t.product_used === 'advisory';
  const cover = resolveImage(t.cover_image_path, r2PublicUrl);
  const photo = resolveImage(t.client_photo_path, r2PublicUrl);
  const productLabel =
    t.product_used === 'advisory'
      ? 'ADVISORY'
      : t.product_used === 'both'
        ? 'VSS · ADVISORY'
        : 'VENDAS SEM SEGREDOS';

  return (
    <article className="bg-ink-2 hover:border-acid border border-[var(--jb-hair)] p-6 transition-all duration-[180ms] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_var(--jb-acid)] md:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--jb-hair)] pb-5">
        <div
          className="kicker"
          style={isAdvisory ? { color: 'var(--jb-fire)' } : undefined}
        >
          // {productLabel}
        </div>
        {t.featured && (
          <div className="text-acid border border-[var(--jb-acid-border)] bg-[var(--jb-acid-soft)] px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
            ★ Destaque
          </div>
        )}
      </div>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={t.cover_image_alt ?? t.client_name}
          className="mb-5 h-40 w-full border border-[var(--jb-hair)] object-cover"
        />
      )}

      <div className="mb-6 flex items-center gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={t.client_name}
            className="size-14 border border-[var(--jb-hair)] object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <h3 className="heading-3 text-cream mb-1">{t.client_name}</h3>
          <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
            {[t.client_role, t.client_company, t.client_segment]
              .filter(Boolean)
              .join(' · ') || ''}
          </p>
        </div>
      </div>

      {(t.result_metric || t.client_revenue_range) && (
        <div className="border-acid bg-ink mb-6 flex flex-wrap items-baseline gap-3 border-l-2 p-4">
          {t.result_metric && (
            <>
              <span className="text-acid font-mono">▲</span>
              <span className="font-display text-acid text-2xl">{t.result_metric}</span>
            </>
          )}
          {t.client_revenue_range && (
            <span className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
              · faturamento {t.client_revenue_range}
            </span>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
          // DEPOIMENTO
        </div>
        <div className="text-fg-2 prose-testimonial font-sans text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.quote_md}</ReactMarkdown>
        </div>
      </div>

      {t.case_md && (
        <div>
          <div className="kicker mb-2" style={{ color: 'var(--jb-fire)' }}>
            // ESTUDO_DE_CASO
          </div>
          <div className="text-fg-2 prose-testimonial font-sans text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.case_md}</ReactMarkdown>
          </div>
        </div>
      )}
    </article>
  );
}
