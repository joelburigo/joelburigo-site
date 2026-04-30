/**
 * Drizzle schema — joelburigo-site
 *
 * Organizado por domínio (espelha PROPOSAL.md §3):
 *   1. Users & Auth
 *   2. Products & Purchases
 *   3. VSS Content & Progress
 *   4. Agent (LLM)
 *   5. Mentorias
 *   6. Advisory
 *   7. Blog
 *   8. Forms
 *   9. Admin audit
 *  10. CRM interno (teams, contacts, pipelines, stages, opportunities, activities)
 *
 * Sprint 0 habilita todas as tabelas pra drizzle-kit gerar as migrations.
 * Sprint 1 conecta os serviços que efetivamente persistem.
 */

import {
  pgTable,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  numeric,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============ 1. USERS & AUTH ============

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    whatsapp: text('whatsapp'),
    stripe_customer_id: text('stripe_customer_id').unique(),
    mercado_pago_customer_id: text('mercado_pago_customer_id').unique(),
    role: text('role').notNull().default('user'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    last_login_at: timestamp('last_login_at', { withTimezone: true }),
  },
  (t) => ({
    emailIdx: index('idx_users_email').on(t.email),
  })
);

export const user_profiles = pgTable('user_profiles', {
  user_id: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  empresa_nome: text('empresa_nome'),
  segmento: text('segmento'),
  faturamento_atual_cents: bigint('faturamento_atual_cents', { mode: 'bigint' }),
  meta_12m_cents: bigint('meta_12m_cents', { mode: 'bigint' }),
  ticket_medio_cents: bigint('ticket_medio_cents', { mode: 'bigint' }),
  gargalo_principal: text('gargalo_principal'),
  produto_md: text('produto_md'),
  pessoas_md: text('pessoas_md'),
  precificacao_md: text('precificacao_md'),
  processos_md: text('processos_md'),
  performance_md: text('performance_md'),
  propaganda_md: text('propaganda_md'),
  raw_data: jsonb('raw_data').notNull().default({}),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const magic_links = pgTable('magic_links', {
  token: text('token').primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  used_at: timestamp('used_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const kv_store = pgTable(
  'kv_store',
  {
    key: text('key').primaryKey(),
    value: jsonb('value').notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    expiresIdx: index('idx_kv_expires').on(t.expires_at),
  })
);

// ============ 2. PRODUCTS & PURCHASES ============

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  price_cents: integer('price_cents').notNull(),
  currency: text('currency').notNull().default('BRL'),
  recurring: boolean('recurring').notNull().default(false),
  access_kind: text('access_kind').notNull(),
  gateway_default: text('gateway_default').notNull().default('mercado_pago'),
  stripe_price_id: text('stripe_price_id'),
  mercado_pago_item_id: text('mercado_pago_item_id'),
  monthly_llm_token_quota: bigint('monthly_llm_token_quota', { mode: 'bigint' }),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const purchases = pgTable(
  'purchases',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id),
    product_id: text('product_id')
      .notNull()
      .references(() => products.id),
    gateway: text('gateway').notNull(),
    gateway_checkout_id: text('gateway_checkout_id'),
    gateway_payment_id: text('gateway_payment_id'),
    gateway_customer_id: text('gateway_customer_id'),
    status: text('status').notNull(),
    amount_cents: integer('amount_cents').notNull(),
    currency: text('currency').notNull(),
    raw_payload: jsonb('raw_payload'),
    paid_at: timestamp('paid_at', { withTimezone: true }),
    refunded_at: timestamp('refunded_at', { withTimezone: true }),
    welcome_sent_at: timestamp('welcome_sent_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_purchases_user').on(t.user_id),
    statusIdx: index('idx_purchases_status').on(t.status),
  })
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id),
    product_id: text('product_id')
      .notNull()
      .references(() => products.id),
    gateway: text('gateway').notNull(),
    gateway_subscription_id: text('gateway_subscription_id').notNull().unique(),
    gateway_customer_id: text('gateway_customer_id'),
    status: text('status').notNull(),
    current_period_end: timestamp('current_period_end', { withTimezone: true }),
    canceled_at: timestamp('canceled_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_subscriptions_user').on(t.user_id),
    statusIdx: index('idx_subscriptions_status').on(t.status),
  })
);

export const entitlements = pgTable(
  'entitlements',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    product_id: text('product_id')
      .notNull()
      .references(() => products.id),
    source_purchase_id: text('source_purchase_id').references(() => purchases.id),
    source_subscription_id: text('source_subscription_id').references(() => subscriptions.id),
    status: text('status').notNull(),
    starts_at: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
    ends_at: timestamp('ends_at', { withTimezone: true }),
    revoked_at: timestamp('revoked_at', { withTimezone: true }),
    revoked_reason: text('revoked_reason'),
    metadata: jsonb('metadata').notNull().default({}),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_entitlements_user').on(t.user_id),
    productIdx: index('idx_entitlements_product').on(t.product_id),
    statusIdx: index('idx_entitlements_status').on(t.status),
  })
);

export const payment_events = pgTable(
  'payment_events',
  {
    id: text('id').primaryKey(),
    gateway: text('gateway').notNull(),
    gateway_event_id: text('gateway_event_id').notNull(),
    event_type: text('event_type').notNull(),
    object_id: text('object_id'),
    status: text('status').notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    payload: jsonb('payload').notNull(),
    last_attempt_at: timestamp('last_attempt_at', { withTimezone: true }),
    processed_at: timestamp('processed_at', { withTimezone: true }),
    error: text('error'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    gatewayEventUnique: uniqueIndex('uniq_payment_events_gateway_event').on(
      t.gateway,
      t.gateway_event_id
    ),
    objectIdx: index('idx_payment_events_object').on(t.gateway, t.object_id),
  })
);

// Admin aprova reembolso (15d incondicional mas operacional: Joel revisa cada pedido)
export const refund_requests = pgTable('refund_requests', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  purchase_id: text('purchase_id')
    .notNull()
    .references(() => purchases.id),
  reason: text('reason'),
  status: text('status').notNull().default('pending'), // pending · approved · denied · converted
  admin_note: text('admin_note'),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  denied_at: timestamp('denied_at', { withTimezone: true }),
  converted_at: timestamp('converted_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============ 3. VSS CONTENT & PROGRESS ============

export const vss_phases = pgTable('vss_phases', {
  id: text('id').primaryKey(),
  position: integer('position').notNull(),
  code: text('code').notNull().unique(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
});

export const vss_modules = pgTable('vss_modules', {
  id: text('id').primaryKey(),
  phase_id: text('phase_id')
    .notNull()
    .references(() => vss_phases.id),
  position: integer('position').notNull(),
  code: text('code').notNull().unique(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
});

export const vss_destravamentos = pgTable('vss_destravamentos', {
  id: text('id').primaryKey(),
  module_id: text('module_id')
    .notNull()
    .references(() => vss_modules.id),
  position: integer('position').notNull(),
  code: text('code').notNull().unique(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  estimated_minutes: integer('estimated_minutes').notNull().default(20),
  flow_kind: text('flow_kind').notNull().default('agent_guided'),
  content_version: text('content_version').notNull(),
  available_from: timestamp('available_from', { withTimezone: true }),
  published_at: timestamp('published_at', { withTimezone: true }),
});

export const user_progress = pgTable(
  'user_progress',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => users.id),
    destravamento_id: text('destravamento_id')
      .notNull()
      .references(() => vss_destravamentos.id),
    started_at: timestamp('started_at', { withTimezone: true }),
    completed_at: timestamp('completed_at', { withTimezone: true }),
    last_artifact_id: text('last_artifact_id'),
    minutes_spent: integer('minutes_spent').notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.destravamento_id] }),
  })
);

// ============ 4. AGENT (LLM) ============

export const agent_conversations = pgTable(
  'agent_conversations',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    destravamento_id: text('destravamento_id').references(() => vss_destravamentos.id),
    topic: text('topic'),
    status: text('status').notNull().default('active'),
    context_snapshot: jsonb('context_snapshot'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_agent_conversations_user').on(t.user_id),
    destIdx: index('idx_agent_conversations_destravamento').on(t.destravamento_id),
  })
);

export const agent_messages = pgTable(
  'agent_messages',
  {
    id: text('id').primaryKey(),
    conversation_id: text('conversation_id')
      .notNull()
      .references(() => agent_conversations.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: jsonb('content').notNull(),
    tokens_input: integer('tokens_input'),
    tokens_output: integer('tokens_output'),
    tokens_cached: integer('tokens_cached'),
    model: text('model'),
    provider: text('provider'), // openai · anthropic
    cost_cents: numeric('cost_cents', { precision: 10, scale: 4 }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    convIdx: index('idx_agent_messages_conversation').on(t.conversation_id),
    createdIdx: index('idx_agent_messages_created').on(t.created_at),
  })
);

export const agent_artifacts = pgTable(
  'agent_artifacts',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    conversation_id: text('conversation_id').references(() => agent_conversations.id, {
      onDelete: 'set null',
    }),
    destravamento_id: text('destravamento_id').references(() => vss_destravamentos.id),
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    content_md: text('content_md'),
    r2_export_key: text('r2_export_key'),
    version: integer('version').notNull().default(1),
    parent_artifact_id: text('parent_artifact_id'),
    is_current: boolean('is_current').notNull().default(true),
    metadata: jsonb('metadata').notNull().default({}),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_agent_artifacts_user').on(t.user_id),
    destIdx: index('idx_agent_artifacts_destravamento').on(t.destravamento_id),
  })
);

export const agent_usage = pgTable('agent_usage', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  period_month: text('period_month').notNull(),
  tokens_input: bigint('tokens_input', { mode: 'number' }).notNull().default(0),
  tokens_output: bigint('tokens_output', { mode: 'number' }).notNull().default(0),
  tokens_cached: bigint('tokens_cached', { mode: 'number' }).notNull().default(0),
  cost_cents: numeric('cost_cents', { precision: 10, scale: 2 }).notNull().default('0'),
  conversation_count: integer('conversation_count').notNull().default(0),
});

// ============ 5. MENTORIAS (CF Stream Live Input) ============

export const mentorias = pgTable('mentorias', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  topic: text('topic'),
  scheduled_at: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  duration_min: integer('duration_min').notNull().default(90),
  cf_live_input_id: text('cf_live_input_id'),
  cf_playback_id: text('cf_playback_id'),
  rtmp_url: text('rtmp_url'),
  rtmp_stream_key: text('rtmp_stream_key'),
  live_status: text('live_status').notNull().default('idle'),
  recording_ready_at: timestamp('recording_ready_at', { withTimezone: true }),
  transcript_r2_key: text('transcript_r2_key'),
  status: text('status').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mentoria_presencas = pgTable(
  'mentoria_presencas',
  {
    mentoria_id: text('mentoria_id')
      .notNull()
      .references(() => mentorias.id, { onDelete: 'cascade' }),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    checked_in_at: timestamp('checked_in_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.mentoria_id, t.user_id] }),
  })
);

// ============ 6. ADVISORY ============

export const advisory_sessions = pgTable(
  'advisory_sessions',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id),
    product_id: text('product_id')
      .notNull()
      .references(() => products.id),
    purchase_id: text('purchase_id').references(() => purchases.id),
    // Token público pra acessar `/sessao/agendar?token=...` antes de criar conta
    booking_token: text('booking_token').unique(),
    booking_token_expires_at: timestamp('booking_token_expires_at', { withTimezone: true }),
    booked_at: timestamp('booked_at', { withTimezone: true }),
    scheduled_at: timestamp('scheduled_at', { withTimezone: true }),
    duration_min: integer('duration_min').notNull().default(90),
    cliente_timezone: text('cliente_timezone'),
    meeting_url: text('meeting_url'),
    // Linka pro hub unificado calendar_events (declared abaixo — referência via string evita ciclo)
    calendar_event_id: text('calendar_event_id'),
    ics_uid: text('ics_uid'),
    status: text('status').notNull().default('pending_booking'), // pending_booking · scheduled · completed · cancelled · no_show
    joel_notes_r2_key: text('joel_notes_r2_key'),
    client_preparation_md: text('client_preparation_md'),
    completed_at: timestamp('completed_at', { withTimezone: true }),
    cancelled_at: timestamp('cancelled_at', { withTimezone: true }),
    cancellation_reason: text('cancellation_reason'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_advisory_sessions_user').on(t.user_id),
    statusIdx: index('idx_advisory_sessions_status').on(t.status),
    bookingTokenIdx: index('idx_advisory_sessions_booking_token').on(t.booking_token),
    scheduledIdx: index('idx_advisory_sessions_scheduled').on(t.scheduled_at),
  })
);

export const external_provisioning = pgTable(
  'external_provisioning',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    product_id: text('product_id')
      .notNull()
      .references(() => products.id),
    entitlement_id: text('entitlement_id').references(() => entitlements.id),
    provider: text('provider').notNull(),
    status: text('status').notNull(),
    external_account_id: text('external_account_id'),
    external_login_url: text('external_login_url'),
    metadata: jsonb('metadata').notNull().default({}),
    provisioned_at: timestamp('provisioned_at', { withTimezone: true }),
    revoked_at: timestamp('revoked_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_external_provisioning_user').on(t.user_id),
    statusIdx: index('idx_external_provisioning_status').on(t.status),
  })
);

// ============ 6.5 AGENDA UNIFICADA + GOOGLE CALENDAR (Sprint 3) ============
//
// Modelo:
//  - `availability_windows`: matriz semanal de slots livres do owner (Joel)
//  - `availability_overrides`: bloqueios/aberturas pontuais (férias, feriado, slot extra)
//  - `calendar_accounts`: OAuth tokens criptografados (AES via JWT_SECRET-derived key)
//  - `calendar_events`: hub unificado (advisory + mentoria + aula + activity + external_google + manual)
//                       cores no /admin/agenda mapeiam por `source`
//  - `session_reschedule_requests`: cliente propõe até 3 slots, Joel aceita um
//
// Sync 2-vias:
//  - Push (interno → Google): create/update/delete em calendar_events dispara API call
//  - Pull (Google → interno): webhook `/api/calendar/google/webhook` + cron `calendar_full_sync` 5min
//                             usa `sync_token` (delta) em fallback ao webhook
//  - Eventos Google externos (ex: médico, viagem) bloqueiam slots de self-booking

export const availability_windows = pgTable(
  'availability_windows',
  {
    id: text('id').primaryKey(),
    owner_id: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    team_id: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
    weekday: integer('weekday').notNull(), // 0=domingo ... 6=sábado
    start_time: text('start_time').notNull(), // 'HH:MM' (24h, no TZ do owner)
    end_time: text('end_time').notNull(),
    timezone: text('timezone').notNull().default('America/Sao_Paulo'),
    active: boolean('active').notNull().default(true),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ownerIdx: index('idx_availability_windows_owner').on(t.owner_id, t.weekday, t.active),
  })
);

export const availability_overrides = pgTable(
  'availability_overrides',
  {
    id: text('id').primaryKey(),
    owner_id: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    team_id: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
    starts_at: timestamp('starts_at', { withTimezone: true }).notNull(),
    ends_at: timestamp('ends_at', { withTimezone: true }).notNull(),
    kind: text('kind').notNull(), // 'block' | 'extra'
    reason: text('reason'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ownerIdx: index('idx_availability_overrides_owner').on(t.owner_id, t.starts_at),
  })
);

export const calendar_accounts = pgTable(
  'calendar_accounts',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('google'),
    external_account_id: text('external_account_id'),
    email: text('email'),
    // Encriptados via AES-GCM com chave derivada de JWT_SECRET (ver src/server/lib/crypto.ts)
    access_token: text('access_token'),
    refresh_token: text('refresh_token'),
    scope: text('scope'),
    token_type: text('token_type'),
    expires_at: timestamp('expires_at', { withTimezone: true }),
    sync_token: text('sync_token'),
    webhook_channel_id: text('webhook_channel_id'),
    webhook_resource_id: text('webhook_resource_id'),
    webhook_expires_at: timestamp('webhook_expires_at', { withTimezone: true }),
    status: text('status').notNull().default('active'), // active · reauth_required · revoked
    last_sync_at: timestamp('last_sync_at', { withTimezone: true }),
    last_error: text('last_error'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('idx_calendar_accounts_user').on(t.user_id, t.status),
    providerExternalUnique: uniqueIndex('uniq_calendar_accounts_provider_external').on(
      t.provider,
      t.external_account_id
    ),
  })
);

export const calendar_events = pgTable(
  'calendar_events',
  {
    id: text('id').primaryKey(),
    team_id: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
    owner_id: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Origem polimórfica
    source: text('source').notNull(), // advisory_session · mentoria · aula · activity · external_google · manual
    source_id: text('source_id'), // ULID da row de origem (advisory_sessions.id, mentorias.id, etc)

    // Espelho Google
    google_event_id: text('google_event_id'),
    google_calendar_id: text('google_calendar_id'),
    google_etag: text('google_etag'),
    sync_status: text('sync_status').notNull().default('local_only'),
    // synced · pending_push · pending_pull · conflict · local_only

    // Conteúdo
    title: text('title').notNull(),
    description_md: text('description_md'),
    starts_at: timestamp('starts_at', { withTimezone: true }).notNull(),
    ends_at: timestamp('ends_at', { withTimezone: true }).notNull(),
    timezone: text('timezone').notNull().default('America/Sao_Paulo'),
    meeting_url: text('meeting_url'),
    location: text('location'),
    visibility: text('visibility').notNull().default('private'), // public · private · confidential
    attendees: jsonb('attendees').notNull().default([]),

    cancelled_at: timestamp('cancelled_at', { withTimezone: true }),
    cancellation_reason: text('cancellation_reason'),
    // Minutos antes do evento pra disparar lembrete (Brevo + WhatsApp)
    reminder_offsets: jsonb('reminder_offsets').notNull().default([1440, 60]),
    last_reminder_at: timestamp('last_reminder_at', { withTimezone: true }),

    metadata: jsonb('metadata').notNull().default({}),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ownerStartsIdx: index('idx_calendar_events_owner_starts').on(t.owner_id, t.starts_at),
    sourceIdx: index('idx_calendar_events_source').on(t.source, t.source_id),
    googleEventIdx: uniqueIndex('uniq_calendar_events_google_event')
      .on(t.google_event_id)
      .where(sql`${t.google_event_id} IS NOT NULL`),
    syncStatusIdx: index('idx_calendar_events_sync_status').on(t.sync_status),
  })
);

export const session_reschedule_requests = pgTable(
  'session_reschedule_requests',
  {
    id: text('id').primaryKey(),
    advisory_session_id: text('advisory_session_id')
      .notNull()
      .references(() => advisory_sessions.id, { onDelete: 'cascade' }),
    requested_by_user_id: text('requested_by_user_id').references(() => users.id),
    proposed_slots: jsonb('proposed_slots').notNull(), // array de { starts_at, timezone }
    reason: text('reason'),
    status: text('status').notNull().default('pending'), // pending · accepted · rejected · cancelled
    resolution_event_id: text('resolution_event_id'),
    admin_note: text('admin_note'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    resolved_at: timestamp('resolved_at', { withTimezone: true }),
  },
  (t) => ({
    sessionIdx: index('idx_reschedule_requests_session').on(t.advisory_session_id, t.status),
  })
);

// ============ 7. BLOG ============

export const blog_posts = pgTable(
  'blog_posts',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    excerpt: text('excerpt'),
    content_md: text('content_md').notNull(),
    cover_image_path: text('cover_image_path'),
    cover_image_alt: text('cover_image_alt'),
    audio_path: text('audio_path'),
    audio_duration_seconds: integer('audio_duration_seconds'),
    author_id: text('author_id').references(() => users.id),
    status: text('status').notNull().default('draft'),
    published_at: timestamp('published_at', { withTimezone: true }),
    scheduled_for: timestamp('scheduled_for', { withTimezone: true }),
    reading_minutes: integer('reading_minutes'),
    seo_title: text('seo_title'),
    seo_description: text('seo_description'),
    og_image_path: text('og_image_path'),
    view_count: integer('view_count').notNull().default(0),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: index('idx_blog_posts_slug').on(t.slug),
    statusIdx: index('idx_blog_posts_status').on(t.status),
  })
);

export const blog_tags = pgTable('blog_tags', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
});

export const blog_post_tags = pgTable(
  'blog_post_tags',
  {
    post_id: text('post_id')
      .notNull()
      .references(() => blog_posts.id, { onDelete: 'cascade' }),
    tag_id: text('tag_id')
      .notNull()
      .references(() => blog_tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.post_id, t.tag_id] }),
  })
);

export const blog_revisions = pgTable(
  'blog_revisions',
  {
    id: text('id').primaryKey(),
    post_id: text('post_id')
      .notNull()
      .references(() => blog_posts.id, { onDelete: 'cascade' }),
    title: text('title'),
    content_md: text('content_md'),
    saved_by: text('saved_by').references(() => users.id),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    postIdx: index('idx_blog_revisions_post').on(t.post_id, t.created_at),
  })
);

export const blog_images = pgTable(
  'blog_images',
  {
    id: text('id').primaryKey(),
    post_id: text('post_id').references(() => blog_posts.id, { onDelete: 'cascade' }),
    path: text('path').notNull(),
    alt: text('alt'),
    width: integer('width'),
    height: integer('height'),
    size_bytes: integer('size_bytes'),
    variant: text('variant'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    postIdx: index('idx_blog_images_post').on(t.post_id),
  })
);

// ============ 8. FORMS ============

/**
 * Submissões genéricas (contato, advisory-aplicacao). Payload completo em `data`.
 * Diagnóstico 6Ps tem tabela dedicada (`diagnostico_submissions`) por ter
 * estrutura previsível e ser linkado ao onboarding VSS no Sprint 2.
 */
export const form_submissions = pgTable(
  'form_submissions',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(), // contato · advisory_aplicacao
    data: jsonb('data').notNull(),
    user_id: text('user_id').references(() => users.id),
    email: text('email'),
    ip: text('ip'),
    user_agent: text('user_agent'),
    forwarded_to_n8n_at: timestamp('forwarded_to_n8n_at', { withTimezone: true }),
    notes_admin: text('notes_admin'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeIdx: index('idx_form_submissions_type').on(t.type),
    emailIdx: index('idx_form_submissions_email').on(t.email),
  })
);

/**
 * Diagnóstico 6Ps — estruturado e linkado a user quando ele compra VSS.
 * URL pública usa o ULID `id` (não-enumerable), sem token adicional.
 * Sprint 2: onboarding VSS pré-popula user_profile com os scores daqui.
 */
export const diagnostico_submissions = pgTable(
  'diagnostico_submissions',
  {
    id: text('id').primaryKey(), // ULID — vira `?id=...` na URL pública
    user_id: text('user_id').references(() => users.id), // null até cliente comprar VSS
    nome: text('nome').notNull(),
    email: text('email').notNull(),
    whatsapp: text('whatsapp'),
    empresa: text('empresa'),
    segmento: text('segmento'),
    faturamento_aprox: text('faturamento_aprox'),

    // Scores 6Ps (0-4 cada · total 0-24)
    score_posicionamento: integer('score_posicionamento').notNull().default(0),
    score_publico: integer('score_publico').notNull().default(0),
    score_produto: integer('score_produto').notNull().default(0),
    score_programas: integer('score_programas').notNull().default(0),
    score_processos: integer('score_processos').notNull().default(0),
    score_pessoas: integer('score_pessoas').notNull().default(0),
    score_total: integer('score_total').notNull().default(0),
    nivel_maturidade: text('nivel_maturidade'), // Caótico · Iniciante · ... · Otimizado

    // Payload bruto pra recálculo futuro se framework mudar
    raw_answers: jsonb('raw_answers').notNull().default({}),

    // Status entrega ao cliente
    email_sent_at: timestamp('email_sent_at', { withTimezone: true }),
    whatsapp_sent_at: timestamp('whatsapp_sent_at', { withTimezone: true }),
    forwarded_to_n8n_at: timestamp('forwarded_to_n8n_at', { withTimezone: true }),

    // CRM links (preenchidos no intake — opcionais pra retrocompat)
    contact_id: text('contact_id'),
    attribution_id: text('attribution_id'),

    ip: text('ip'),
    user_agent: text('user_agent'),
    notes_admin: text('notes_admin'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index('idx_diagnostico_email').on(t.email),
    userIdx: index('idx_diagnostico_user').on(t.user_id),
    createdIdx: index('idx_diagnostico_created').on(t.created_at),
    contactIdx: index('idx_diagnostico_contact').on(t.contact_id),
  })
);

// ============ 8b. ATTRIBUTION (marketing) ============

/**
 * Captura first-touch + last-touch de marketing pra qualquer lead.
 * FK opcional pra contacts (linkado via lead-intake).
 *
 * Captura:
 *   - UTM params (source/medium/campaign/term/content)
 *   - Click IDs (Google gclid, Meta fbclid, MS msclkid, TikTok ttclid)
 *   - Page context (referrer, first/last landing)
 *   - Device + geo (CF-IPCountry headers)
 *   - Meta browser cookies (_fbp, _fbc) — necessários pra CAPI matching
 */
export const lead_attribution = pgTable(
  'lead_attribution',
  {
    id: text('id').primaryKey(),
    contact_id: text('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),

    // UTM
    utm_source: text('utm_source'),
    utm_medium: text('utm_medium'),
    utm_campaign: text('utm_campaign'),
    utm_term: text('utm_term'),
    utm_content: text('utm_content'),

    // Click IDs
    gclid: text('gclid'),
    fbclid: text('fbclid'),
    msclkid: text('msclkid'),
    ttclid: text('ttclid'),

    // Page context
    referrer: text('referrer'),
    first_landing_page: text('first_landing_page'),
    last_landing_page: text('last_landing_page'),

    // Device
    device: text('device'), // mobile | tablet | desktop
    browser: text('browser'),
    os: text('os'),

    // Geo (Cloudflare CF-IPCountry / CF-Region / CF-IPCity headers)
    country: text('country'),
    region: text('region'),
    city: text('city'),

    // Meta CAPI matching
    fbp: text('fbp'),
    fbc: text('fbc'),

    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    contactIdx: index('idx_lead_attribution_contact').on(t.contact_id),
    gclidIdx: index('idx_lead_attribution_gclid').on(t.gclid),
    fbclidIdx: index('idx_lead_attribution_fbclid').on(t.fbclid),
  })
);

// ============ 8c. LEAD DOUBTS (popup "ainda tem dúvidas?") ============

/**
 * Captura passiva no rodapé das landings VSS/Advisory.
 * Lead frio com baixa intent — vira opportunity stage "Lead frio".
 */
export const lead_doubts = pgTable(
  'lead_doubts',
  {
    id: text('id').primaryKey(),
    nome: text('nome').notNull(),
    email: text('email').notNull(),
    whatsapp: text('whatsapp'),
    duvida: text('duvida').notNull(), // textarea livre

    // Contexto
    produto_interesse: text('produto_interesse').notNull(), // vss · advisory · ambos
    landing_page: text('landing_page'), // /vendas-sem-segredos · /advisory etc

    // FKs
    contact_id: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    attribution_id: text('attribution_id').references(() => lead_attribution.id, {
      onDelete: 'set null',
    }),

    // Admin tracking
    answered_at: timestamp('answered_at', { withTimezone: true }),
    notes_admin: text('notes_admin'),

    ip: text('ip'),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index('idx_lead_doubts_email').on(t.email),
    productIdx: index('idx_lead_doubts_product').on(t.produto_interesse),
    createdIdx: index('idx_lead_doubts_created').on(t.created_at),
  })
);

// ============ 8d. ADVISORY APPLICATIONS ============

/**
 * Aplicação Sprint/Conselho — fluxo qualificado pra triagem do Joel.
 * Sessão Avulsa NÃO usa esta tabela (compra direta via checkout).
 */
export const advisory_applications = pgTable(
  'advisory_applications',
  {
    id: text('id').primaryKey(),
    nome: text('nome').notNull(),
    email: text('email').notNull(),
    whatsapp: text('whatsapp').notNull(),
    cargo: text('cargo'),
    empresa: text('empresa').notNull(),
    site_empresa: text('site_empresa'),

    // Qualificação ICP
    faturamento_mensal_range: text('faturamento_mensal_range').notNull(),
    // Enum: '<100k' | '100-200k' | '200-500k' | '500k-1M' | '1M-5M' | '>5M'

    setor: text('setor').notNull(),
    tamanho_time: integer('tamanho_time'),
    anos_no_mercado: integer('anos_no_mercado'),

    // Pain + intent
    dor_principal_md: text('dor_principal_md').notNull(),
    urgencia: integer('urgencia').notNull(), // 1-5 (1=explorando, 5=apagando incêndio)
    timeline_esperada: text('timeline_esperada').notNull(), // '3m' | '6m' | '12m+'

    tentou_consultoria_antes: text('tentou_consultoria_antes'), // 'sim' | 'nao'
    qual_consultoria: text('qual_consultoria'),

    disponibilidade_semanal_horas: integer('disponibilidade_semanal_horas'),

    // Formato escolhido
    formato_interesse: text('formato_interesse').notNull(), // 'sprint' | 'conselho' | 'ambos'

    // FKs
    contact_id: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    attribution_id: text('attribution_id').references(() => lead_attribution.id, {
      onDelete: 'set null',
    }),

    // Triagem
    status: text('status').notNull().default('aguardando'),
    // 'aguardando' | 'em_triagem' | 'aprovado' | 'rejeitado' | 'aplicado'
    triaged_at: timestamp('triaged_at', { withTimezone: true }),
    triaged_by: text('triaged_by').references(() => users.id),
    rejection_reason: text('rejection_reason'),
    notes_admin: text('notes_admin'),

    ip: text('ip'),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index('idx_advisory_apps_email').on(t.email),
    statusIdx: index('idx_advisory_apps_status').on(t.status),
    formatoIdx: index('idx_advisory_apps_formato').on(t.formato_interesse),
    createdIdx: index('idx_advisory_apps_created').on(t.created_at),
  })
);

// ============ 9. ADMIN AUDIT ============

export const admin_audit = pgTable('admin_audit', {
  id: text('id').primaryKey(),
  admin_id: text('admin_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(),
  target_table: text('target_table'),
  target_id: text('target_id'),
  payload: jsonb('payload'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============ 10. CRM INTERNO ============
//
// Schema completo desde Sprint 1. UI (Kanban, dashboards) em Sprint 5+.
// Auto-criação no Sprint 1: form_submissions/diagnostico/purchases criam
// contacts + activities + opportunities automaticamente.
//
// Multi-team ready (`teams` + `team_members`) — Joel é admin único hoje,
// mas estrutura suporta colaboradores futuros sem refactor.

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const team_members = pgTable(
  'team_members',
  {
    team_id: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // admin · member
    joined_at: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.team_id, t.user_id] }),
    userIdx: index('idx_team_members_user').on(t.user_id),
  })
);

export const companies = pgTable(
  'companies',
  {
    id: text('id').primaryKey(),
    team_id: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    segmento: text('segmento'),
    porte: text('porte'), // micro · pequena · media · grande
    faturamento_aprox_cents: bigint('faturamento_aprox_cents', { mode: 'bigint' }),
    website: text('website'),
    cnpj: text('cnpj'),
    notes_md: text('notes_md'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    teamIdx: index('idx_companies_team').on(t.team_id),
    nameIdx: index('idx_companies_name').on(t.name),
  })
);

export const contacts = pgTable(
  'contacts',
  {
    id: text('id').primaryKey(),
    team_id: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    user_id: text('user_id').references(() => users.id), // null se ainda não virou user (lead)
    company_id: text('company_id').references(() => companies.id),
    owner_id: text('owner_id').references(() => users.id), // quem cuida (Joel)

    name: text('name').notNull(),
    email: text('email'),
    whatsapp: text('whatsapp'),
    phone: text('phone'),
    cargo: text('cargo'),

    // Lifecycle simples (não HubSpot-style)
    lifecycle_stage: text('lifecycle_stage').notNull().default('lead'), // lead · cliente · ex_cliente
    source: text('source'), // form_diagnostico · form_contato · form_advisory · purchase · manual · import
    produto_interesse: text('produto_interesse'), // vss · advisory · ambos
    tags: jsonb('tags').notNull().default([]),

    notes_md: text('notes_md'),
    first_touch_at: timestamp('first_touch_at', { withTimezone: true }).notNull().defaultNow(),
    last_touch_at: timestamp('last_touch_at', { withTimezone: true }).notNull().defaultNow(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    teamIdx: index('idx_contacts_team').on(t.team_id),
    emailIdx: index('idx_contacts_email').on(t.email),
    whatsappIdx: index('idx_contacts_whatsapp').on(t.whatsapp),
    lifecycleIdx: index('idx_contacts_lifecycle').on(t.lifecycle_stage),
    ownerIdx: index('idx_contacts_owner').on(t.owner_id),
    companyIdx: index('idx_contacts_company').on(t.company_id),
    // Email único por team (evita duplicado mas permite mesmo email em teams diferentes futuro)
    teamEmailUnique: uniqueIndex('uniq_contacts_team_email')
      .on(t.team_id, t.email)
      .where(sql`${t.email} IS NOT NULL`),
  })
);

export const pipelines = pgTable(
  'pipelines',
  {
    id: text('id').primaryKey(),
    team_id: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(), // ex: vss · advisory
    is_default: boolean('is_default').notNull().default(false),
    position: integer('position').notNull().default(0),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    teamSlugUnique: uniqueIndex('uniq_pipelines_team_slug').on(t.team_id, t.slug),
  })
);

export const stages = pgTable(
  'stages',
  {
    id: text('id').primaryKey(),
    pipeline_id: text('pipeline_id')
      .notNull()
      .references(() => pipelines.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    position: integer('position').notNull(),
    kind: text('kind').notNull().default('open'), // open · won · lost
    color: text('color'), // hex pra Kanban (ex: #C6FF00)
    probability: integer('probability'), // 0-100, % default de fechamento nessa stage
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pipelineIdx: index('idx_stages_pipeline').on(t.pipeline_id, t.position),
    pipelineSlugUnique: uniqueIndex('uniq_stages_pipeline_slug').on(t.pipeline_id, t.slug),
  })
);

export const opportunities = pgTable(
  'opportunities',
  {
    id: text('id').primaryKey(),
    team_id: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    contact_id: text('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    pipeline_id: text('pipeline_id')
      .notNull()
      .references(() => pipelines.id),
    stage_id: text('stage_id')
      .notNull()
      .references(() => stages.id),
    product_id: text('product_id').references(() => products.id), // qual produto VSS/Advisory
    owner_id: text('owner_id').references(() => users.id),

    title: text('title').notNull(),
    value_cents: bigint('value_cents', { mode: 'bigint' }),
    currency: text('currency').notNull().default('BRL'),
    status: text('status').notNull().default('open'), // open · won · lost

    // Pra Kanban: ordenação dentro da stage (decimal pra reorder fácil)
    kanban_position: numeric('kanban_position', { precision: 20, scale: 10 })
      .notNull()
      .default('0'),

    expected_close_at: timestamp('expected_close_at', { withTimezone: true }),
    actual_close_at: timestamp('actual_close_at', { withTimezone: true }),
    lost_reason: text('lost_reason'),

    // Link com compra real quando ganhar (não-circular: purchase NÃO referencia opportunity)
    purchase_id: text('purchase_id').references(() => purchases.id),

    notes_md: text('notes_md'),
    metadata: jsonb('metadata').notNull().default({}),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    teamIdx: index('idx_opportunities_team').on(t.team_id),
    contactIdx: index('idx_opportunities_contact').on(t.contact_id),
    stageKanbanIdx: index('idx_opportunities_stage_kanban').on(t.stage_id, t.kanban_position),
    statusIdx: index('idx_opportunities_status').on(t.status),
    ownerIdx: index('idx_opportunities_owner').on(t.owner_id),
  })
);

export const activities = pgTable(
  'activities',
  {
    id: text('id').primaryKey(),
    team_id: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    contact_id: text('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    opportunity_id: text('opportunity_id').references(() => opportunities.id, {
      onDelete: 'set null',
    }),
    owner_id: text('owner_id').references(() => users.id),

    type: text('type').notNull(), // note · task · call · email · whatsapp · meeting · form · payment · system
    direction: text('direction'), // inbound · outbound · internal (null pra type=note/task)
    subject: text('subject'),
    body_md: text('body_md'),

    // Tasks: scheduled_for + completed_at
    scheduled_for: timestamp('scheduled_for', { withTimezone: true }),
    completed_at: timestamp('completed_at', { withTimezone: true }),

    // Vincula a entidades de origem (form_submission, diagnostico, payment, magic_link, etc)
    metadata: jsonb('metadata').notNull().default({}),

    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    teamIdx: index('idx_activities_team').on(t.team_id),
    contactIdx: index('idx_activities_contact').on(t.contact_id, t.created_at),
    opportunityIdx: index('idx_activities_opportunity').on(t.opportunity_id, t.created_at),
    typeIdx: index('idx_activities_type').on(t.type),
    pendingTasksIdx: index('idx_activities_pending_tasks').on(t.owner_id, t.scheduled_for),
  })
);

// ============ TYPE EXPORTS ============

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof user_profiles.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Entitlement = typeof entitlements.$inferSelect;
export type BlogPost = typeof blog_posts.$inferSelect;
export type NewBlogPost = typeof blog_posts.$inferInsert;
export type BlogTag = typeof blog_tags.$inferSelect;
export type DiagnosticoSubmission = typeof diagnostico_submissions.$inferSelect;
export type NewDiagnosticoSubmission = typeof diagnostico_submissions.$inferInsert;

// Advisory + Agenda (Sprint 3)
export type AdvisorySession = typeof advisory_sessions.$inferSelect;
export type NewAdvisorySession = typeof advisory_sessions.$inferInsert;
export type AvailabilityWindow = typeof availability_windows.$inferSelect;
export type NewAvailabilityWindow = typeof availability_windows.$inferInsert;
export type AvailabilityOverride = typeof availability_overrides.$inferSelect;
export type NewAvailabilityOverride = typeof availability_overrides.$inferInsert;
export type CalendarAccount = typeof calendar_accounts.$inferSelect;
export type NewCalendarAccount = typeof calendar_accounts.$inferInsert;
export type CalendarEvent = typeof calendar_events.$inferSelect;
export type NewCalendarEvent = typeof calendar_events.$inferInsert;
export type SessionRescheduleRequest = typeof session_reschedule_requests.$inferSelect;
export type NewSessionRescheduleRequest = typeof session_reschedule_requests.$inferInsert;

// CRM
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof team_members.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Pipeline = typeof pipelines.$inferSelect;
export type NewPipeline = typeof pipelines.$inferInsert;
export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
