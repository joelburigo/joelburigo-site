import 'server-only';
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  teams,
  users,
  contacts,
  companies,
  pipelines,
  stages,
  opportunities,
  activities,
  lead_attribution,
  type Team,
  type Contact,
  type Company,
  type Opportunity,
  type Activity,
  type Pipeline,
  type Stage,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';

const DEFAULT_TEAM_SLUG = 'joelburigo';

export async function getDefaultTeam(): Promise<Team> {
  const [team] = await db.select().from(teams).where(eq(teams.slug, DEFAULT_TEAM_SLUG)).limit(1);
  if (!team) {
    throw new Error(`Team default "${DEFAULT_TEAM_SLUG}" não existe — rode pnpm db:seed.`);
  }
  return team;
}

// --------- Contacts ---------

export interface UpsertContactInput {
  teamId: string;
  name: string;
  email: string;
  whatsapp?: string | null;
  source?: string | null;
  produto_interesse?: string | null;
  lifecycle_stage?: string | null;
  ownerId?: string | null;
}

export async function upsertContact(input: UpsertContactInput): Promise<Contact> {
  const email = input.email.trim().toLowerCase();

  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.team_id, input.teamId), eq(contacts.email, email)))
    .limit(1);

  const now = new Date();

  if (existing) {
    const patch: Partial<typeof contacts.$inferInsert> = {
      last_touch_at: now,
      updated_at: now,
    };
    if (!existing.whatsapp && input.whatsapp) patch.whatsapp = input.whatsapp;
    if ((!existing.name || existing.name.length === 0) && input.name) patch.name = input.name;
    if (!existing.produto_interesse && input.produto_interesse) {
      patch.produto_interesse = input.produto_interesse;
    }
    if (!existing.owner_id && input.ownerId) patch.owner_id = input.ownerId;

    const [updated] = await db
      .update(contacts)
      .set(patch)
      .where(eq(contacts.id, existing.id))
      .returning();
    if (!updated) throw new Error('failed to update contact');
    return updated;
  }

  const id = ulid();
  const [created] = await db
    .insert(contacts)
    .values({
      id,
      team_id: input.teamId,
      name: input.name,
      email,
      whatsapp: input.whatsapp ?? null,
      source: input.source ?? null,
      produto_interesse: input.produto_interesse ?? null,
      lifecycle_stage: input.lifecycle_stage ?? 'lead',
      owner_id: input.ownerId ?? null,
      first_touch_at: now,
      last_touch_at: now,
    })
    .returning();
  if (!created) throw new Error('failed to create contact');
  return created;
}

// --------- Activities ---------

export interface LogActivityInput {
  teamId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  ownerId?: string | null;
  type: string;
  direction?: 'inbound' | 'outbound' | 'internal' | null;
  subject?: string | null;
  body_md?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: LogActivityInput): Promise<Activity> {
  const id = ulid();
  const now = new Date();
  const [created] = await db
    .insert(activities)
    .values({
      id,
      team_id: input.teamId,
      contact_id: input.contactId ?? null,
      opportunity_id: input.opportunityId ?? null,
      owner_id: input.ownerId ?? null,
      type: input.type,
      direction: input.direction ?? null,
      subject: input.subject ?? null,
      body_md: input.body_md ?? null,
      metadata: input.metadata ?? {},
      created_at: now,
    })
    .returning();
  if (!created) throw new Error('failed to log activity');

  if (input.contactId) {
    await db
      .update(contacts)
      .set({ last_touch_at: now })
      .where(eq(contacts.id, input.contactId));
  }

  return created;
}

// --------- Pipelines / Stages ---------

async function resolvePipelineAndStage(
  teamId: string,
  pipelineSlug: string,
  stageSlug: string
): Promise<{ pipelineId: string; stageId: string }> {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(and(eq(pipelines.team_id, teamId), eq(pipelines.slug, pipelineSlug)))
    .limit(1);
  if (!pipeline) throw new Error(`Pipeline "${pipelineSlug}" não existe no team.`);

  const [stage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, pipeline.id), eq(stages.slug, stageSlug)))
    .limit(1);
  if (!stage) throw new Error(`Stage "${stageSlug}" não existe na pipeline "${pipelineSlug}".`);

  return { pipelineId: pipeline.id, stageId: stage.id };
}

// --------- Opportunities ---------

export interface CreateOpportunityInput {
  teamId: string;
  contactId: string;
  pipelineSlug: string;
  stageSlug: string;
  productId?: string | null;
  title: string;
  value_cents?: number | bigint | null;
  ownerId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function createOpportunity(input: CreateOpportunityInput): Promise<Opportunity> {
  const { pipelineId, stageId } = await resolvePipelineAndStage(
    input.teamId,
    input.pipelineSlug,
    input.stageSlug
  );

  // kanban_position = max(existing in stage) + 1000
  const [maxRow] = await db
    .select({ max: sql<string>`coalesce(max(${opportunities.kanban_position}), 0)` })
    .from(opportunities)
    .where(eq(opportunities.stage_id, stageId));

  const nextPos = (Number(maxRow?.max ?? 0) + 1000).toString();

  const id = ulid();
  const value =
    input.value_cents === undefined || input.value_cents === null
      ? null
      : typeof input.value_cents === 'bigint'
        ? input.value_cents
        : BigInt(input.value_cents);

  const [created] = await db
    .insert(opportunities)
    .values({
      id,
      team_id: input.teamId,
      contact_id: input.contactId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      product_id: input.productId ?? null,
      owner_id: input.ownerId ?? null,
      title: input.title,
      value_cents: value,
      currency: 'BRL',
      status: 'open',
      kanban_position: nextPos,
      metadata: input.metadata ?? {},
    })
    .returning();
  if (!created) throw new Error('failed to create opportunity');
  return created;
}

export async function moveOpportunityToStage(
  oppId: string,
  stageSlug: string
): Promise<Opportunity> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId)).limit(1);
  if (!opp) throw new Error(`Opportunity ${oppId} não existe.`);

  const [stage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, opp.pipeline_id), eq(stages.slug, stageSlug)))
    .limit(1);
  if (!stage) throw new Error(`Stage "${stageSlug}" não existe na pipeline da opp.`);

  const [updated] = await db
    .update(opportunities)
    .set({ stage_id: stage.id, updated_at: new Date() })
    .where(eq(opportunities.id, oppId))
    .returning();
  if (!updated) throw new Error('failed to move opportunity');

  await logActivity({
    teamId: opp.team_id,
    contactId: opp.contact_id,
    opportunityId: opp.id,
    type: 'system',
    direction: 'internal',
    subject: `Movida para "${stage.name}"`,
    metadata: { from_stage_id: opp.stage_id, to_stage_id: stage.id },
  });

  return updated;
}

export async function markOpportunityWon(
  oppId: string,
  purchaseId: string
): Promise<Opportunity> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId)).limit(1);
  if (!opp) throw new Error(`Opportunity ${oppId} não existe.`);

  const [wonStage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, opp.pipeline_id), eq(stages.kind, 'won')))
    .limit(1);
  if (!wonStage) throw new Error('Pipeline não tem stage kind=won.');

  const now = new Date();
  const [updated] = await db
    .update(opportunities)
    .set({
      status: 'won',
      stage_id: wonStage.id,
      actual_close_at: now,
      purchase_id: purchaseId,
      updated_at: now,
    })
    .where(eq(opportunities.id, oppId))
    .returning();
  if (!updated) throw new Error('failed to mark opportunity won');

  await logActivity({
    teamId: opp.team_id,
    contactId: opp.contact_id,
    opportunityId: opp.id,
    type: 'system',
    direction: 'internal',
    subject: `Ganha (purchase ${purchaseId})`,
    metadata: { purchase_id: purchaseId, stage_id: wonStage.id },
  });

  return updated;
}

// --------- Detail / list / generic update ---------

export interface OpportunityDetail {
  opportunity: Opportunity;
  contact: Contact;
  company: Company | null;
  pipeline: Pipeline;
  stage: Stage;
  activities: Array<
    Activity & { owner: { id: string; name: string | null; email: string } | null }
  >;
  attribution: typeof lead_attribution.$inferSelect | null;
}

export async function getOpportunityDetail(
  id: string,
  teamId: string
): Promise<OpportunityDetail | null> {
  const [opp] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.team_id, teamId)))
    .limit(1);
  if (!opp) return null;

  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, opp.contact_id))
    .limit(1);
  if (!contact) return null;

  const company = contact.company_id
    ? (
        await db.select().from(companies).where(eq(companies.id, contact.company_id)).limit(1)
      )[0] ?? null
    : null;

  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, opp.pipeline_id))
    .limit(1);
  if (!pipeline) return null;

  const [stage] = await db.select().from(stages).where(eq(stages.id, opp.stage_id)).limit(1);
  if (!stage) return null;

  const actsRaw = await db
    .select({
      activity: activities,
      ownerId: users.id,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(activities)
    .leftJoin(users, eq(users.id, activities.owner_id))
    .where(eq(activities.opportunity_id, id))
    .orderBy(desc(activities.created_at));

  const acts = actsRaw.map((r) => ({
    ...r.activity,
    owner: r.ownerId
      ? { id: r.ownerId, name: r.ownerName, email: r.ownerEmail ?? '' }
      : null,
  }));

  const [attribution] = await db
    .select()
    .from(lead_attribution)
    .where(eq(lead_attribution.contact_id, contact.id))
    .orderBy(desc(lead_attribution.created_at))
    .limit(1);

  return {
    opportunity: opp,
    contact,
    company,
    pipeline,
    stage,
    activities: acts,
    attribution: attribution ?? null,
  };
}

export interface UpdateOpportunityPatch {
  stage_id?: string;
  status?: 'open' | 'won' | 'lost';
  kanban_position?: number;
  lost_reason?: string | null;
  notes_md?: string | null;
  title?: string;
  value_cents?: number | null;
  expected_close_at?: Date | null;
}

export async function updateOpportunity(
  opId: string,
  patch: UpdateOpportunityPatch
): Promise<Opportunity> {
  const set: Partial<typeof opportunities.$inferInsert> = { updated_at: new Date() };
  if (patch.stage_id !== undefined) set.stage_id = patch.stage_id;
  if (patch.status !== undefined) {
    set.status = patch.status;
    if (patch.status === 'won' || patch.status === 'lost') {
      set.actual_close_at = new Date();
    }
  }
  if (patch.kanban_position !== undefined) {
    set.kanban_position = patch.kanban_position.toString();
  }
  if (patch.lost_reason !== undefined) set.lost_reason = patch.lost_reason;
  if (patch.notes_md !== undefined) set.notes_md = patch.notes_md;
  if (patch.title !== undefined) set.title = patch.title;
  if (patch.value_cents !== undefined) {
    set.value_cents = patch.value_cents === null ? null : BigInt(patch.value_cents);
  }
  if (patch.expected_close_at !== undefined) set.expected_close_at = patch.expected_close_at;

  const [updated] = await db
    .update(opportunities)
    .set(set)
    .where(eq(opportunities.id, opId))
    .returning();
  if (!updated) throw new Error(`Opportunity ${opId} não existe.`);
  return updated;
}

/**
 * Move opportunity para nova stage por id (não slug). Cria activity de sistema
 * registrando a transição. Use em fluxo Kanban (drag-and-drop).
 */
export async function moveOpportunityStage(
  opId: string,
  newStageId: string,
  userId: string
): Promise<Opportunity> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, opId)).limit(1);
  if (!opp) throw new Error(`Opportunity ${opId} não existe.`);

  const [newStage] = await db
    .select()
    .from(stages)
    .where(eq(stages.id, newStageId))
    .limit(1);
  if (!newStage) throw new Error(`Stage ${newStageId} não existe.`);
  if (newStage.pipeline_id !== opp.pipeline_id) {
    throw new Error('stage_pipeline_mismatch');
  }

  const [oldStage] = await db.select().from(stages).where(eq(stages.id, opp.stage_id)).limit(1);

  const newStatus =
    newStage.kind === 'won' ? 'won' : newStage.kind === 'lost' ? 'lost' : 'open';

  const now = new Date();
  const set: Partial<typeof opportunities.$inferInsert> = {
    stage_id: newStageId,
    status: newStatus,
    updated_at: now,
  };
  if (newStatus !== 'open') set.actual_close_at = now;

  const [updated] = await db
    .update(opportunities)
    .set(set)
    .where(eq(opportunities.id, opId))
    .returning();
  if (!updated) throw new Error('failed to update opportunity');

  await logActivity({
    teamId: opp.team_id,
    contactId: opp.contact_id,
    opportunityId: opp.id,
    ownerId: userId,
    type: 'system',
    direction: 'internal',
    subject: `Stage: ${oldStage?.name ?? '?'} → ${newStage.name}`,
    metadata: { from_stage_id: opp.stage_id, to_stage_id: newStageId },
  });

  return updated;
}

export interface CreateActivityInput {
  teamId: string;
  contactId?: string | null;
  opportunityId: string;
  ownerId: string;
  type: 'note' | 'task' | 'call' | 'email' | 'whatsapp' | 'meeting';
  direction?: 'inbound' | 'outbound' | 'internal' | null;
  subject: string;
  body_md?: string | null;
  scheduled_for?: Date | null;
  metadata?: Record<string, unknown>;
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const id = ulid();
  const now = new Date();
  const [created] = await db
    .insert(activities)
    .values({
      id,
      team_id: input.teamId,
      contact_id: input.contactId ?? null,
      opportunity_id: input.opportunityId,
      owner_id: input.ownerId,
      type: input.type,
      direction: input.direction ?? null,
      subject: input.subject,
      body_md: input.body_md ?? null,
      scheduled_for: input.scheduled_for ?? null,
      metadata: input.metadata ?? {},
      created_at: now,
    })
    .returning();
  if (!created) throw new Error('failed to create activity');

  if (input.contactId) {
    await db.update(contacts).set({ last_touch_at: now }).where(eq(contacts.id, input.contactId));
  }

  return created;
}

export interface UpdateActivityPatch {
  subject?: string;
  body_md?: string | null;
  scheduled_for?: Date | null;
  completed_at?: Date | null;
  metadata?: Record<string, unknown>;
}

export async function updateActivity(id: string, patch: UpdateActivityPatch): Promise<Activity> {
  const set: Partial<typeof activities.$inferInsert> = {};
  if (patch.subject !== undefined) set.subject = patch.subject;
  if (patch.body_md !== undefined) set.body_md = patch.body_md;
  if (patch.scheduled_for !== undefined) set.scheduled_for = patch.scheduled_for;
  if (patch.completed_at !== undefined) set.completed_at = patch.completed_at;
  if (patch.metadata !== undefined) set.metadata = patch.metadata as never;

  const [updated] = await db
    .update(activities)
    .set(set)
    .where(eq(activities.id, id))
    .returning();
  if (!updated) throw new Error(`Activity ${id} não existe.`);
  return updated;
}

export async function deleteActivity(id: string): Promise<void> {
  await db.delete(activities).where(eq(activities.id, id));
}

// --------- List / filter ---------

export interface ListOpportunitiesFilters {
  teamId: string;
  pipelineSlug?: string;
  ownerId?: string;
  source?: string;
  status?: 'open' | 'won' | 'lost';
  from?: Date;
  to?: Date;
  query?: string;
  limit?: number;
}

export interface OpportunityListItem {
  id: string;
  title: string;
  value_cents: number | null;
  status: string;
  kanban_position: string;
  stage_id: string;
  pipeline_id: string;
  contact: {
    id: string;
    name: string;
    email: string | null;
    whatsapp: string | null;
    source: string | null;
    produto_interesse: string | null;
  };
  stage: {
    id: string;
    slug: string;
    name: string;
    kind: string;
    color: string | null;
    position: number;
    probability: number | null;
  };
  created_at: Date;
  updated_at: Date;
  last_activity_at: Date | null;
}

export interface ListOpportunitiesResult {
  items: OpportunityListItem[];
  total: number;
  facets: {
    pipeline: Record<string, number>;
    sources: Array<{ value: string; count: number }>;
    owners: Array<{ id: string; name: string | null; email: string }>;
  };
}

export async function listOpportunities(
  filters: ListOpportunitiesFilters
): Promise<ListOpportunitiesResult> {
  const status = filters.status ?? 'open';
  const limit = filters.limit ?? 200;

  const where = [eq(opportunities.team_id, filters.teamId), eq(opportunities.status, status)];

  if (filters.pipelineSlug) {
    const [pipe] = await db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.team_id, filters.teamId), eq(pipelines.slug, filters.pipelineSlug)))
      .limit(1);
    if (!pipe) {
      return { items: [], total: 0, facets: { pipeline: {}, sources: [], owners: [] } };
    }
    where.push(eq(opportunities.pipeline_id, pipe.id));
  }
  if (filters.ownerId) where.push(eq(opportunities.owner_id, filters.ownerId));
  if (filters.from) where.push(gte(opportunities.created_at, filters.from));
  if (filters.to) where.push(lte(opportunities.created_at, filters.to));
  if (filters.source) where.push(eq(contacts.source, filters.source));

  if (filters.query) {
    const q = `%${filters.query.toLowerCase()}%`;
    const orCond = or(
      ilike(contacts.name, q),
      ilike(contacts.email, q),
      ilike(contacts.whatsapp, q),
      ilike(opportunities.title, q)
    );
    if (orCond) where.push(orCond);
  }

  const lastActivitySub = sql<Date | null>`(
    SELECT MAX(${activities.created_at})
    FROM ${activities}
    WHERE ${activities.opportunity_id} = ${opportunities.id}
  )`;

  const rows = await db
    .select({
      opportunity: opportunities,
      contact: contacts,
      stage: stages,
      lastActivityAt: lastActivitySub,
    })
    .from(opportunities)
    .innerJoin(contacts, eq(contacts.id, opportunities.contact_id))
    .innerJoin(stages, eq(stages.id, opportunities.stage_id))
    .where(and(...where))
    .orderBy(asc(stages.position), asc(opportunities.kanban_position))
    .limit(limit);

  // Facets — counts globais (mesmos filtros sem o que tá sendo facetado)
  const facetWhereBase = [
    eq(opportunities.team_id, filters.teamId),
    eq(opportunities.status, status),
  ];
  if (filters.from) facetWhereBase.push(gte(opportunities.created_at, filters.from));
  if (filters.to) facetWhereBase.push(lte(opportunities.created_at, filters.to));

  const pipelineFacet = await db
    .select({
      slug: pipelines.slug,
      count: sql<string>`COUNT(*)`,
    })
    .from(opportunities)
    .innerJoin(pipelines, eq(pipelines.id, opportunities.pipeline_id))
    .where(and(...facetWhereBase))
    .groupBy(pipelines.slug);

  const sourceFacet = await db
    .select({
      source: contacts.source,
      count: sql<string>`COUNT(*)`,
    })
    .from(opportunities)
    .innerJoin(contacts, eq(contacts.id, opportunities.contact_id))
    .where(and(...facetWhereBase))
    .groupBy(contacts.source);

  // Owners distintos com nome/email (left join — opportunity sem owner é null)
  const ownerFacet = await db
    .selectDistinct({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(opportunities)
    .innerJoin(users, eq(users.id, opportunities.owner_id))
    .where(and(...facetWhereBase));

  const items: OpportunityListItem[] = rows.map((r) => ({
    id: r.opportunity.id,
    title: r.opportunity.title,
    value_cents: r.opportunity.value_cents == null ? null : Number(r.opportunity.value_cents),
    status: r.opportunity.status,
    kanban_position: r.opportunity.kanban_position,
    stage_id: r.opportunity.stage_id,
    pipeline_id: r.opportunity.pipeline_id,
    contact: {
      id: r.contact.id,
      name: r.contact.name,
      email: r.contact.email,
      whatsapp: r.contact.whatsapp,
      source: r.contact.source,
      produto_interesse: r.contact.produto_interesse,
    },
    stage: {
      id: r.stage.id,
      slug: r.stage.slug,
      name: r.stage.name,
      kind: r.stage.kind,
      color: r.stage.color,
      position: r.stage.position,
      probability: r.stage.probability,
    },
    created_at: r.opportunity.created_at,
    updated_at: r.opportunity.updated_at,
    last_activity_at: r.lastActivityAt,
  }));

  const pipelineCounts: Record<string, number> = {};
  for (const f of pipelineFacet) pipelineCounts[f.slug] = Number(f.count);

  const sources: Array<{ value: string; count: number }> = sourceFacet
    .filter((f): f is typeof f & { source: string } => Boolean(f.source))
    .map((f) => ({ value: f.source, count: Number(f.count) }));

  const owners: Array<{ id: string; name: string | null; email: string }> = ownerFacet.map(
    (o) => ({ id: o.id, name: o.name, email: o.email })
  );

  return {
    items,
    total: items.length,
    facets: { pipeline: pipelineCounts, sources, owners },
  };
}
