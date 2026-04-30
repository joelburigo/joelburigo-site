import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/server/services/admin-stats';

interface TileProps {
  label: string;
  value: string;
  hint?: string;
  variant?: 'fire' | 'acid' | 'default';
}

function Tile({ label, value, hint, variant = 'default' }: TileProps) {
  const accent =
    variant === 'fire'
      ? 'border-fire'
      : variant === 'acid'
        ? 'border-acid'
        : 'border-[var(--jb-hair)]';
  return (
    <div className={`bg-ink-2 flex flex-col gap-2 border p-6 ${accent}`}>
      <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
        {label}
      </span>
      <span className="text-cream font-display text-3xl font-black uppercase">{value}</span>
      {hint && <span className="text-fg-muted text-[11px]">{hint}</span>}
    </div>
  );
}

export function DashboardTiles({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Leads · 30d"
        value={stats.leads_30d.toLocaleString('pt-BR')}
        hint={`${stats.leads_total.toLocaleString('pt-BR')} total`}
      />
      <Tile
        label="Open Opps"
        value={stats.opportunities_open.toLocaleString('pt-BR')}
        hint={`${stats.opportunities_won_30d} won · ${stats.opportunities_lost_30d} lost (30d)`}
      />
      <Tile
        label="Won · 30d"
        value={stats.opportunities_won_30d.toLocaleString('pt-BR')}
        variant="acid"
      />
      <Tile
        label="Conversion · 30d"
        value={`${stats.conversion_rate_30d.toLocaleString('pt-BR')}%`}
        hint="won / (won + lost)"
      />
      <Tile
        label="Receita · 30d"
        value={formatCurrency(stats.revenue_30d_cents)}
        variant="acid"
        hint="opportunities ganhas"
      />
      <Tile
        label="Receita · total"
        value={formatCurrency(stats.revenue_total_cents)}
      />
      <Tile
        label="Purchases pagos · 30d"
        value={stats.purchases_paid_30d.toLocaleString('pt-BR')}
        hint={`${formatCurrency(stats.purchase_revenue_30d_cents)} no período`}
      />
      <Tile
        label="Diagnósticos · 30d"
        value={stats.leads_diagnostico_30d.toLocaleString('pt-BR')}
        hint={`${stats.leads_advisory_30d} advisory · ${stats.leads_doubts_30d} dúvidas`}
      />
    </div>
  );
}
