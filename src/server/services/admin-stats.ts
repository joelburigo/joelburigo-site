import 'server-only';
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  contacts,
  opportunities,
  pipelines,
  stages,
  activities,
  purchases,
  diagnostico_submissions,
  lead_doubts,
  advisory_applications,
} from '@/server/db/schema';

// ---------- Types ----------

export interface DashboardStats {
  // Tiles principais
  leads_total: number;
  leads_30d: number;
  leads_diagnostico_30d: number;
  leads_doubts_30d: number;
  leads_advisory_30d: number;

  opportunities_open: number;
  opportunities_won_30d: number;
  opportunities_lost_30d: number;

  conversion_rate_30d: number; // 0..100

  // Receita (de opportunities marcadas won)
  revenue_30d_cents: number;
  revenue_total_cents: number;

  // Purchases reais
  purchases_paid_30d: number;
  purchases_paid_total: number;
  purchase_revenue_30d_cents: number;
}

export interface FunnelStep {
  stage_id: string;
  stage_name: string;
  stage_kind: 'open' | 'won' | 'lost';
  stage_color: string;
  position: number;
  count: number;
  value_cents: number;
}

export interface FunnelData {
  pipeline_slug: string;
  pipeline_name: string;
  steps: FunnelStep[];
}

export interface RecentActivity {
  id: string;
  type: string;
  direction: string | null;
  subject: string;
  contact_name: string | null;
  created_at: Date;
}

// ---------- Helpers ----------

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  return Number(v);
}

// ---------- Stats ----------

export async function getDashboardStats(teamId: string): Promise<DashboardStats> {
  const since30 = daysAgo(30);

  const [
    leadsRow,
    oppsRow,
    revenueRow,
    purchasesRow,
    diagRow,
    doubtsRow,
    advisoryRow,
  ] = await Promise.all([
    // contacts: total + 30d
    db
      .select({
        total: sql<string>`COUNT(*)`,
        last30: sql<string>`COUNT(*) FILTER (WHERE ${contacts.created_at} >= ${since30})`,
      })
      .from(contacts)
      .where(eq(contacts.team_id, teamId)),

    // opportunities aggregates
    db
      .select({
        open: sql<string>`COUNT(*) FILTER (WHERE ${opportunities.status} = 'open')`,
        won30: sql<string>`COUNT(*) FILTER (WHERE ${opportunities.status} = 'won' AND ${opportunities.actual_close_at} >= ${since30})`,
        lost30: sql<string>`COUNT(*) FILTER (WHERE ${opportunities.status} = 'lost' AND ${opportunities.actual_close_at} >= ${since30})`,
      })
      .from(opportunities)
      .where(eq(opportunities.team_id, teamId)),

    // revenue from won opps (30d + total)
    db
      .select({
        total: sql<string>`COALESCE(SUM(CASE WHEN ${opportunities.status} = 'won' THEN ${opportunities.value_cents} ELSE 0 END), 0)`,
        last30: sql<string>`COALESCE(SUM(CASE WHEN ${opportunities.status} = 'won' AND ${opportunities.actual_close_at} >= ${since30} THEN ${opportunities.value_cents} ELSE 0 END), 0)`,
      })
      .from(opportunities)
      .where(eq(opportunities.team_id, teamId)),

    // purchases paid: count 30d + count total + revenue 30d
    db
      .select({
        total: sql<string>`COUNT(*) FILTER (WHERE ${purchases.status} = 'paid')`,
        last30: sql<string>`COUNT(*) FILTER (WHERE ${purchases.status} = 'paid' AND ${purchases.paid_at} >= ${since30})`,
        revenue30: sql<string>`COALESCE(SUM(CASE WHEN ${purchases.status} = 'paid' AND ${purchases.paid_at} >= ${since30} THEN ${purchases.amount_cents} ELSE 0 END), 0)`,
      })
      .from(purchases),

    // diagnosticos 30d
    db
      .select({ count: sql<string>`COUNT(*)` })
      .from(diagnostico_submissions)
      .where(gte(diagnostico_submissions.created_at, since30)),

    // lead doubts 30d
    db
      .select({ count: sql<string>`COUNT(*)` })
      .from(lead_doubts)
      .where(gte(lead_doubts.created_at, since30)),

    // advisory applications 30d
    db
      .select({ count: sql<string>`COUNT(*)` })
      .from(advisory_applications)
      .where(gte(advisory_applications.created_at, since30)),
  ]);

  const won30 = toNum(oppsRow[0]?.won30);
  const lost30 = toNum(oppsRow[0]?.lost30);
  const conv = won30 + lost30 > 0 ? (won30 / (won30 + lost30)) * 100 : 0;

  return {
    leads_total: toNum(leadsRow[0]?.total),
    leads_30d: toNum(leadsRow[0]?.last30),
    leads_diagnostico_30d: toNum(diagRow[0]?.count),
    leads_doubts_30d: toNum(doubtsRow[0]?.count),
    leads_advisory_30d: toNum(advisoryRow[0]?.count),

    opportunities_open: toNum(oppsRow[0]?.open),
    opportunities_won_30d: won30,
    opportunities_lost_30d: lost30,

    conversion_rate_30d: Math.round(conv * 10) / 10,

    revenue_30d_cents: toNum(revenueRow[0]?.last30),
    revenue_total_cents: toNum(revenueRow[0]?.total),

    purchases_paid_30d: toNum(purchasesRow[0]?.last30),
    purchases_paid_total: toNum(purchasesRow[0]?.total),
    purchase_revenue_30d_cents: toNum(purchasesRow[0]?.revenue30),
  };
}

// ---------- Funnel ----------

export async function getFunnelByPipeline(
  teamId: string,
  pipelineSlug: string
): Promise<FunnelData> {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(and(eq(pipelines.team_id, teamId), eq(pipelines.slug, pipelineSlug)))
    .limit(1);

  if (!pipeline) {
    return {
      pipeline_slug: pipelineSlug,
      pipeline_name: pipelineSlug,
      steps: [],
    };
  }

  const rows = await db
    .select({
      stage_id: stages.id,
      stage_name: stages.name,
      stage_kind: stages.kind,
      stage_color: stages.color,
      position: stages.position,
      count: sql<string>`COUNT(${opportunities.id})`,
      value_cents: sql<string>`COALESCE(SUM(${opportunities.value_cents}), 0)`,
    })
    .from(stages)
    .leftJoin(
      opportunities,
      and(eq(opportunities.stage_id, stages.id), eq(opportunities.team_id, teamId))
    )
    .where(eq(stages.pipeline_id, pipeline.id))
    .groupBy(stages.id, stages.name, stages.kind, stages.color, stages.position)
    .orderBy(asc(stages.position));

  return {
    pipeline_slug: pipeline.slug,
    pipeline_name: pipeline.name,
    steps: rows.map((r) => ({
      stage_id: r.stage_id,
      stage_name: r.stage_name,
      stage_kind: (r.stage_kind === 'won' || r.stage_kind === 'lost' ? r.stage_kind : 'open') as
        | 'open'
        | 'won'
        | 'lost',
      stage_color: r.stage_color ?? '#3F3F46',
      position: r.position,
      count: toNum(r.count),
      value_cents: toNum(r.value_cents),
    })),
  };
}

// ---------- Recent activities ----------

export async function getRecentActivities(
  teamId: string,
  limit = 10
): Promise<RecentActivity[]> {
  const rows = await db
    .select({
      id: activities.id,
      type: activities.type,
      direction: activities.direction,
      subject: activities.subject,
      contact_name: contacts.name,
      created_at: activities.created_at,
    })
    .from(activities)
    .leftJoin(contacts, eq(contacts.id, activities.contact_id))
    .where(eq(activities.team_id, teamId))
    .orderBy(desc(activities.created_at))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    direction: r.direction,
    subject: r.subject ?? '—',
    contact_name: r.contact_name,
    created_at: r.created_at,
  }));
}
