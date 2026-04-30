import type { Metadata } from 'next';
import { requireAdmin } from '@/server/services/session';
import { getDefaultTeam } from '@/server/services/admin';
import {
  getDashboardStats,
  getFunnelByPipeline,
  getRecentActivities,
} from '@/server/services/admin-stats';
import { DashboardTiles } from '@/components/features/admin/dashboard-tiles';
import { FunnelChart } from '@/components/features/admin/funnel-chart';
import { RecentActivitiesList } from '@/components/features/admin/recent-activities-list';

export const metadata: Metadata = {
  title: 'Admin · Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const team = await getDefaultTeam();

  const [stats, vssFunnel, advisoryFunnel, activities] = await Promise.all([
    getDashboardStats(team.id),
    getFunnelByPipeline(team.id, 'vss'),
    getFunnelByPipeline(team.id, 'advisory'),
    getRecentActivities(team.id, 10),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="kicker text-fire">// DASHBOARD · VISÃO GERAL</span>
        <h1 className="text-cream font-display mt-2 text-3xl tracking-tight uppercase">
          Painel
        </h1>
      </header>

      <DashboardTiles stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart funnel={vssFunnel} />
        <FunnelChart funnel={advisoryFunnel} />
      </div>

      <RecentActivitiesList activities={activities} />
    </div>
  );
}
