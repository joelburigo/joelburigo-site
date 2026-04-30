import 'server-only';
import type { Metadata } from 'next';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_accounts, calendar_events } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import { GoogleIntegrationActions } from '@/components/features/admin/google-integration-actions';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Integrações · Google Calendar · Admin',
  robots: { index: false, follow: false },
};

interface SearchParams {
  status?: string;
  reason?: string;
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default async function AdminGoogleIntegrationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdmin();
  const sp = await searchParams;

  const [accounts, externalEvents] = await Promise.all([
    db
      .select()
      .from(calendar_accounts)
      .where(eq(calendar_accounts.user_id, admin.id))
      .orderBy(desc(calendar_accounts.created_at)),
    db
      .select()
      .from(calendar_events)
      .where(
        and(eq(calendar_events.owner_id, admin.id), eq(calendar_events.source, 'external_google'))
      )
      .orderBy(desc(calendar_events.starts_at))
      .limit(20),
  ]);

  const active = accounts.find((a) => a.status === 'active') ?? null;
  const lastNonActive = accounts.find((a) => a.status !== 'active') ?? null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.22em] text-fire uppercase">
          // ADMIN_INTEGRATIONS
        </span>
        <h1 className="heading-1 text-cream">Google Calendar</h1>
        <p className="body-sm text-fg-3">
          Sync 2-vias entre o agenda interno e o Google Calendar. Eventos criados no admin viram
          eventos no Google; eventos criados no Google bloqueiam slots de booking.
        </p>
      </header>

      {/* Status banner */}
      {sp.status === 'connected' && (
        <div className="border border-acid bg-acid/5 p-4 font-mono text-sm text-acid">
          // conta conectada com sucesso
        </div>
      )}
      {sp.status === 'error' && (
        <div className="border border-fire bg-fire/5 p-4 font-mono text-sm text-fire">
          // erro: {sp.reason ?? 'desconhecido'}
        </div>
      )}

      {/* Card principal — depende do status */}
      {!active && !lastNonActive && <ConnectCard />}
      {!active && lastNonActive && <ReauthCard status={lastNonActive.status} />}
      {active && (
        <ActiveCard
          email={active.email ?? '—'}
          lastSyncAt={fmtDate(active.last_sync_at ?? null)}
          webhookExpiresAt={fmtDate(active.webhook_expires_at ?? null)}
          lastError={active.last_error ?? null}
          syncToken={active.sync_token ? `${active.sync_token.slice(0, 8)}…` : '—'}
        />
      )}

      {/* Tabela de eventos externos */}
      <section className="flex flex-col gap-3">
        <header className="flex flex-col gap-1 border-l-2 border-acid pl-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-acid uppercase">
            // últimos_eventos_externos
          </span>
          <h2 className="heading-3 text-cream">Eventos importados do Google</h2>
          <p className="body-sm text-fg-3">
            Últimos 20 eventos com source=external_google (criados direto no Google e puxados via
            sync).
          </p>
        </header>
        {externalEvents.length === 0 ? (
          <div className="border border-[var(--jb-hair)] p-6 text-center font-mono text-[11px] tracking-[0.22em] text-fg-3 uppercase">
            // nenhum evento externo sincronizado
          </div>
        ) : (
          <div className="border border-[var(--jb-hair)] overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-2">
                <tr>
                  <th className="px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
                    Quando
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
                    Título
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
                    Sync
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
                    Google ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {externalEvents.map((e) => (
                  <tr key={e.id} className="border-t border-[var(--jb-hair)]">
                    <td className="px-4 py-3 font-mono text-cream">{fmtDate(e.starts_at)}</td>
                    <td className="px-4 py-3 text-cream">{e.title}</td>
                    <td className="px-4 py-3">
                      <SyncBadge status={e.sync_status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-fg-3 truncate max-w-[200px]">
                      {e.google_event_id?.slice(0, 18) ?? '—'}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="border border-fire bg-fire/5 p-8 shadow-[6px_6px_0_var(--jb-fire)]">
      <span className="font-mono text-[10px] tracking-[0.22em] text-fire uppercase">
        // não_conectado
      </span>
      <h2 className="heading-2 mt-2 text-cream">Conectar Google Calendar</h2>
      <p className="body mt-3 text-fg-2">
        Autoriza acesso à conta Google do Joel pra ler/escrever eventos. Calendar primário é
        configurado em <code className="font-mono text-acid">GOOGLE_PRIMARY_CALENDAR_ID</code>.
      </p>
      <Button asChild variant="primary" className="mt-6">
        <a href="/api/calendar/google/connect">Iniciar OAuth →</a>
      </Button>
    </div>
  );
}

function ReauthCard({ status }: { status: string }) {
  return (
    <div className="border border-fire bg-fire/5 p-8">
      <span className="font-mono text-[10px] tracking-[0.22em] text-fire uppercase">
        // status: {status}
      </span>
      <h2 className="heading-2 mt-2 text-cream">Conta precisa de reautorização</h2>
      <p className="body mt-3 text-fg-2">
        A conta Google que estava conectada foi revogada ou os tokens expiraram. Conecte de novo
        pra retomar o sync.
      </p>
      <Button asChild variant="primary" className="mt-6">
        <a href="/api/calendar/google/connect">Reconectar →</a>
      </Button>
    </div>
  );
}

function ActiveCard({
  email,
  lastSyncAt,
  webhookExpiresAt,
  lastError,
  syncToken,
}: {
  email: string;
  lastSyncAt: string;
  webhookExpiresAt: string;
  lastError: string | null;
  syncToken: string;
}) {
  return (
    <div className="border border-acid bg-acid/5 p-8 shadow-[6px_6px_0_var(--jb-acid)]">
      <span className="font-mono text-[10px] tracking-[0.22em] text-acid uppercase">
        // conectado
      </span>
      <h2 className="heading-2 mt-2 text-cream">{email}</h2>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Último sync" value={lastSyncAt} />
        <Field label="Webhook expira em" value={webhookExpiresAt} />
        <Field label="Sync token" value={syncToken} />
        <Field label="Status" value="active" />
      </dl>

      {lastError && (
        <div className="mt-4 border border-fire bg-fire/5 p-3 font-mono text-xs text-fire">
          // último erro: {lastError}
        </div>
      )}

      <div className="mt-6">
        <GoogleIntegrationActions />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">// {label}</dt>
      <dd className="mt-1 font-mono text-sm text-cream">{value}</dd>
    </div>
  );
}

function SyncBadge({ status }: { status: string | null }) {
  const tone = (() => {
    if (status === 'synced') return { bg: 'bg-acid/10', border: 'border-acid', text: 'text-acid' };
    if (status === 'pending_push' || status === 'pending_pull')
      return { bg: 'bg-cream/5', border: 'border-cream', text: 'text-cream' };
    if (status === 'conflict')
      return { bg: 'bg-fire/10', border: 'border-fire', text: 'text-fire' };
    return { bg: 'bg-cream/5', border: 'border-fg-3', text: 'text-fg-3' };
  })();
  return (
    <span
      className={cn(
        'border-l-2 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase',
        tone.bg,
        tone.border,
        tone.text
      )}
    >
      {status ?? 'unknown'}
    </span>
  );
}
