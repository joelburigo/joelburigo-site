import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Button } from '@/components/ui';
import { listUsers } from '@/server/services/admin';
import { UserRow } from '@/components/features/admin/user-row';

export const metadata: Metadata = {
  title: 'Admin · Alunos',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    role?: string;
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const role = sp.role === 'admin' || sp.role === 'user' ? sp.role : undefined;
  const status =
    sp.status === 'active' || sp.status === 'expired' || sp.status === 'none'
      ? sp.status
      : undefined;
  const page = Math.max(1, Number(sp.page ?? '1'));

  const { rows, total } = await listUsers({
    filters: { role, entitlementStatus: status, query: sp.q },
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container size="xl" className="flex flex-col gap-6 py-2">
      <div>
        <span className="kicker text-fire">// USERS</span>
        <h1 className="heading-2 text-cream mt-2">Alunos</h1>
      </div>

      <form className="flex flex-wrap items-end gap-3" method="GET">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="q"
            className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase"
          >
            Buscar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={sp.q ?? ''}
            placeholder="email ou nome"
            className="bg-ink-2 text-cream h-9 w-64 border border-[var(--jb-hair)] px-3 text-sm focus:border-acid focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="role"
            className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={sp.role ?? ''}
            className="bg-ink-2 text-cream h-9 border border-[var(--jb-hair)] px-2 text-sm"
          >
            <option value="">todos</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="status"
            className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase"
          >
            Entitlement
          </label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status ?? ''}
            className="bg-ink-2 text-cream h-9 border border-[var(--jb-hair)] px-2 text-sm"
          >
            <option value="">todos</option>
            <option value="active">active</option>
            <option value="expired">expired/revoked</option>
            <option value="none">sem entitlement</option>
          </select>
        </div>
        <Button type="submit" variant="primary" size="sm" className="font-mono text-[11px] tracking-[0.22em]">
          Filtrar
        </Button>
      </form>

      <div className="bg-ink-2 border-2 border-[var(--jb-hair)] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Criado</th>
              <th className="px-3 py-2">Entitlements</th>
              <th className="px-3 py-2">Tokens/mês</th>
              <th className="px-3 py-2">Último login</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-fg-muted px-3 py-6 text-center text-xs">
                  Nenhum user encontrado.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <UserRow
                key={r.user.id}
                data={{
                  id: r.user.id,
                  email: r.user.email,
                  name: r.user.name,
                  role: r.user.role,
                  createdAt: r.user.created_at.toISOString(),
                  lastLoginAt: r.user.last_login_at ? r.user.last_login_at.toISOString() : null,
                  productSlugs: r.activeProductSlugs,
                  monthTokensUsed: r.monthTokensUsed,
                  monthCostCents: r.monthCostCents,
                  tokenQuota: null,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-fg-3 flex items-center justify-between text-xs">
        <span>
          Mostrando {rows.length} de {total} ({page}/{totalPages})
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={{
                pathname: '/admin/users',
                query: { ...sp, page: String(page - 1) },
              }}
              className="border border-[var(--jb-hair)] px-3 py-1 font-mono text-[10px] uppercase hover:border-acid"
            >
              ← anterior
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={{
                pathname: '/admin/users',
                query: { ...sp, page: String(page + 1) },
              }}
              className="border border-[var(--jb-hair)] px-3 py-1 font-mono text-[10px] uppercase hover:border-acid"
            >
              próxima →
            </Link>
          )}
        </div>
      </div>
    </Container>
  );
}
