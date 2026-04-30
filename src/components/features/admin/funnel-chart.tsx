import { formatCurrency } from '@/lib/utils';
import type { FunnelData } from '@/server/services/admin-stats';

const KIND_LABEL: Record<'open' | 'won' | 'lost', string> = {
  open: 'aberta',
  won: 'ganha',
  lost: 'perdida',
};

export function FunnelChart({ funnel }: { funnel: FunnelData }) {
  const maxCount = Math.max(1, ...funnel.steps.map((s) => s.count));

  return (
    <div className="bg-ink-2 flex flex-col gap-4 border border-[var(--jb-hair)] p-6">
      <header className="flex items-baseline justify-between">
        <div>
          <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
            // FUNIL · {funnel.pipeline_slug.toUpperCase()}
          </span>
          <h2 className="text-cream font-display mt-1 text-xl uppercase">
            {funnel.pipeline_name}
          </h2>
        </div>
      </header>

      {funnel.steps.length === 0 ? (
        <p className="text-fg-muted text-xs">Pipeline sem stages.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {funnel.steps.map((step) => {
            const widthPct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
            const safeWidth = step.count === 0 ? 4 : Math.max(widthPct, 6);
            const color = step.stage_color || '#3F3F46';
            return (
              <li key={step.stage_id} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
                  <span className="text-cream truncate uppercase">
                    <span className="text-fg-muted">{String(step.position).padStart(2, '0')}</span>{' '}
                    {step.stage_name}{' '}
                    <span className="text-fg-muted">[{KIND_LABEL[step.stage_kind]}]</span>
                  </span>
                  <span className="text-fg-3 shrink-0">
                    {step.count.toLocaleString('pt-BR')}
                    {step.value_cents > 0 && (
                      <span className="text-acid ml-2">
                        {formatCurrency(step.value_cents)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="bg-ink h-6 w-full border border-[var(--jb-hair)]">
                  <div
                    className="h-full"
                    style={{
                      width: `${safeWidth}%`,
                      backgroundColor: color,
                      opacity: step.count === 0 ? 0.25 : 1,
                    }}
                    aria-label={`${step.count} oportunidades em ${step.stage_name}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
