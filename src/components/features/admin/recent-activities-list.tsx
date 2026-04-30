import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { RecentActivity } from '@/server/services/admin-stats';

const TYPE_ICON: Record<string, string> = {
  note: '◆',
  task: '☐',
  call: '☎',
  email: '✉',
  whatsapp: '✆',
  meeting: '◉',
  form: '⌘',
  payment: '$',
  system: '⚙',
};

function iconFor(type: string): string {
  return TYPE_ICON[type] ?? '·';
}

export function RecentActivitiesList({ activities }: { activities: RecentActivity[] }) {
  return (
    <div className="bg-ink-2 flex flex-col border border-[var(--jb-hair)]">
      <header className="flex items-baseline justify-between border-b border-[var(--jb-hair)] p-6">
        <div>
          <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
            // TIMELINE · ÚLTIMAS {activities.length} ATIVIDADES
          </span>
          <h2 className="text-cream font-display mt-1 text-xl uppercase">Atividades recentes</h2>
        </div>
      </header>

      {activities.length === 0 ? (
        <p className="text-fg-muted p-6 text-xs">Sem atividades registradas.</p>
      ) : (
        <ul className="divide-y divide-[var(--jb-hair)]">
          {activities.map((a) => (
            <li
              key={a.id}
              className="hover:bg-ink/40 flex items-start gap-4 px-6 py-3 transition-colors"
            >
              <span
                className="text-fire mt-0.5 w-5 shrink-0 text-center font-mono text-base"
                aria-hidden
              >
                {iconFor(a.type)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-cream truncate text-sm">{a.subject}</span>
                  <span className="text-fg-muted shrink-0 font-mono text-[10px] uppercase">
                    {formatDistanceToNow(a.created_at, { locale: ptBR, addSuffix: true })}
                  </span>
                </div>
                <div className="text-fg-muted flex items-center gap-2 font-mono text-[10px] uppercase">
                  <span className="text-acid">{a.type}</span>
                  {a.direction && <span>· {a.direction}</span>}
                  {a.contact_name && (
                    <span className="text-fg-3 truncate">· {a.contact_name}</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
