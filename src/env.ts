import { z } from 'zod';

/**
 * Validação de env vars em tempo de boot.
 * Server-only. Import em layout.tsx ou route handler lança se config inválida.
 *
 * Convenção: vars opcionais aceitam string vazia (`VAR=`) ou ausência total —
 * ambas viram `undefined`. Isso permite manter slots vazios no `.env` sem
 * comentar/descomentar a cada Sprint.
 */

const empty = z.literal('').transform(() => undefined);
const optionalString = z.string().min(1).optional().or(empty);
const optionalUrl = z.string().url().optional().or(empty);
const optionalEmail = z.string().email().optional().or(empty);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4321),
  PUBLIC_SITE_URL: optionalUrl.transform((v) => v ?? 'http://localhost:4321'),

  DATABASE_URL: optionalString,

  CRON_SECRET: optionalString,

  LLM_PROVIDER: z.enum(['openai', 'anthropic']).default('openai'),
  LLM_MODEL_CHAT: z.string().default('gpt-5.2'),
  LLM_MODEL_PREMIUM: z.string().default('gpt-5.2'),
  LLM_MODEL_IMAGE: z.string().default('gpt-image-2'),

  OPENAI_API_KEY: optionalString,
  ANTHROPIC_API_KEY: optionalString,

  MP_ACCESS_TOKEN: optionalString,
  MP_PUBLIC_KEY: optionalString,
  MP_WEBHOOK_SECRET: optionalString,

  STRIPE_SECRET_KEY: optionalString,
  STRIPE_PUBLIC_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,

  CF_ACCOUNT_ID: optionalString,
  CF_API_TOKEN: optionalString,
  CF_STREAM_CUSTOMER_CODE: optionalString,
  R2_BUCKET: z.string().default('joelburigo-artifacts'),
  R2_PUBLIC_URL: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  TURNSTILE_SITE_KEY: optionalString,
  TURNSTILE_SECRET_KEY: optionalString,

  BREVO_API_KEY: optionalString,
  EMAIL_FROM_TRANSACTIONAL: optionalEmail.transform(
    (v) => v ?? 'nao-responda@joelburigo.com.br'
  ),
  EMAIL_FROM_PERSONAL: optionalEmail.transform((v) => v ?? 'joel@joelburigo.com.br'),
  EMAIL_FROM_NAME: z.string().default('Joel Burigo'),

  N8N_WEBHOOK_URL: optionalUrl,

  // WhatsApp via EvolutionAPI (self-hosted no growth-infra)
  EVOLUTION_API_URL: optionalUrl,
  EVOLUTION_API_KEY: optionalString,
  EVOLUTION_INSTANCE: z.string().default('joelburigo'),

  // Google Calendar OAuth — Sprint 3 (sync 2-vias para /admin/agenda)
  GOOGLE_OAUTH_CLIENT_ID: optionalString,
  GOOGLE_OAUTH_CLIENT_SECRET: optionalString,
  GOOGLE_OAUTH_REDIRECT_URI: optionalUrl,
  GOOGLE_PRIMARY_CALENDAR_ID: z.string().default('primary'),
  // Token aleatório validado nos push notifications do Google (X-Goog-Channel-Token)
  GOOGLE_WEBHOOK_TOKEN: optionalString,

  // Sessão (mínimo 16 chars quando preenchido)
  JWT_SECRET: z.string().min(16).optional().or(empty),

  PUBLIC_GTM_ID: optionalString,
  PUBLIC_META_PIXEL_ID: optionalString,
  GA4_MEASUREMENT_ID: optionalString,
  GA4_API_SECRET: optionalString,
  META_CAPI_ACCESS_TOKEN: optionalString,

  // Conversões server-side: Google Ads (Enhanced Conversions for Leads / Purchase)
  GOOGLE_ADS_CUSTOMER_ID: optionalString,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: optionalString,
  GOOGLE_ADS_DEVELOPER_TOKEN: optionalString,
  GOOGLE_ADS_OAUTH_CLIENT_ID: optionalString,
  GOOGLE_ADS_OAUTH_CLIENT_SECRET: optionalString,
  GOOGLE_ADS_REFRESH_TOKEN: optionalString,
  /** Resource name: `customers/{id}/conversionActions/{id}` */
  GOOGLE_ADS_CONVERSION_ACTION_LEAD: optionalString,
  GOOGLE_ADS_CONVERSION_ACTION_PURCHASE: optionalString,

  // Conversões server-side: Meta CAPI
  META_PIXEL_ID: optionalString,
  /** Quando setado, anexa `test_event_code` ao payload (modo testing no Events Manager) */
  META_CAPI_TEST_EVENT_CODE: optionalString,

  SENTRY_DSN: optionalString,

  // Legado: gerador de audio dos posts blog (scripts/generate-audio-posts.mjs)
  ELEVENLABS_API_KEY: optionalString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Env inválido:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Env validation failed');
}

export const env = parsed.data;
export type Env = typeof env;
