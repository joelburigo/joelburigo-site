import 'server-only';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/server/services/session';
import { listAllForAdmin } from '@/server/services/testimonials';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui';
import { TestimonialListActions } from '@/components/features/testimonials/testimonial-list-actions';

export const metadata: Metadata = {
  title: 'Admin · Depoimentos',
  robots: { index: false, follow: false },
};

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');

function resolveImage(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  if (!R2_PUBLIC_URL) return null;
  return `${R2_PUBLIC_URL}/${path}`;
}

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const items = await listAllForAdmin();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="kicker text-fire">// PROVA SOCIAL</span>
          <h1 className="heading-2 text-cream mt-2">Depoimentos</h1>
          <p className="text-fg-3 body-sm mt-1">
            {items.length} {items.length === 1 ? 'depoimento' : 'depoimentos'} no banco
          </p>
        </div>
        <ButtonLink href="/admin/testimonials/new" variant="primary">
          + Novo
        </ButtonLink>
      </header>

      {items.length === 0 ? (
        <div className="border border-[var(--jb-hair)] p-12 text-center">
          <p className="text-fg-3 font-mono text-sm tracking-[0.22em] uppercase">
            Nenhum depoimento ainda. Use o botão "+ Novo" pra começar.
          </p>
        </div>
      ) : (
        <div className="bg-ink-2 overflow-x-auto border border-[var(--jb-hair)]">
          <table className="w-full text-sm">
            <thead className="border-fire bg-ink border-b">
              <tr className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                <th className="px-4 py-3 text-left">Foto</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-center">Pub</th>
                <th className="px-4 py-3 text-right">Pos</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const photo = resolveImage(t.client_photo_path);
                return (
                  <tr key={t.id} className="hover:bg-ink/40 border-t border-[var(--jb-hair)]">
                    <td className="px-4 py-3">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo}
                          alt={t.client_name}
                          className="size-10 border border-[var(--jb-hair)] object-cover"
                        />
                      ) : (
                        <div className="bg-ink text-acid font-display flex size-10 items-center justify-center border border-[var(--jb-hair)] text-sm">
                          {t.client_name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/testimonials/${t.id}`}
                        className="text-cream hover:text-acid font-medium"
                      >
                        {t.client_name}
                      </Link>
                      {t.client_role && (
                        <div className="text-fg-3 mt-0.5 font-mono text-[11px]">{t.client_role}</div>
                      )}
                    </td>
                    <td className="text-fg-2 px-4 py-3 font-mono text-xs">
                      {t.client_company ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ProductBadge product={t.product_used} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.featured ? <Badge variant="acid">★</Badge> : <span className="text-fg-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.published ? (
                        <Badge variant="acid">on</Badge>
                      ) : (
                        <Badge variant="outline">off</Badge>
                      )}
                    </td>
                    <td className="text-fg-2 px-4 py-3 text-right font-mono text-xs">
                      {t.position}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TestimonialListActions id={t.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductBadge({ product }: { product: string }) {
  if (product === 'advisory') return <Badge variant="fire">advisory</Badge>;
  if (product === 'both') return <Badge variant="acid">vss + adv</Badge>;
  return <Badge variant="default">vss</Badge>;
}
