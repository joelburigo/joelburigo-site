import 'server-only';
import { env } from '@/env';
import { hashPhone, hashPii } from './_utils';

/**
 * Meta Conversion API (server-side events).
 *
 * Doc: https://developers.facebook.com/docs/marketing-api/conversions-api
 *
 * Sem META_PIXEL_ID ou META_CAPI_ACCESS_TOKEN → no-op com warn.
 *
 * Dedup: client-side Pixel + server-side event compartilham `event_id`.
 */

const META_API_VERSION = 'v22.0';

export type MetaEventName = 'Lead' | 'Purchase' | 'CompleteRegistration' | 'InitiateCheckout';

export interface MetaCapiUserData {
  email?: string;
  phone?: string;
  /** First name */
  fn?: string;
  /** Last name */
  ln?: string;
  /** Browser cookie `_fbp` */
  fbp?: string;
  /** Click cookie `_fbc` (formato `fb.1.<ts>.<fbclid>`) */
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  /** ID interno (ex: contact_id) — Meta hashea internamente */
  external_id?: string;
}

export interface MetaCapiCustomData {
  /** Default 'BRL' */
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
}

export interface MetaCapiEvent {
  event_name: MetaEventName;
  /** Dedup id — igual ao client-side Pixel event */
  event_id: string;
  /** Unix seconds. Default = now */
  event_time?: number;
  event_source_url?: string;
  user_data: MetaCapiUserData;
  custom_data?: MetaCapiCustomData;
  action_source?:
    | 'website'
    | 'email'
    | 'phone_call'
    | 'chat'
    | 'physical_store'
    | 'system_generated'
    | 'other';
}

interface HashedUserData {
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  external_id?: string[];
}

async function buildHashedUserData(ud: MetaCapiUserData): Promise<HashedUserData> {
  const [em, ph, fn, ln, externalId] = await Promise.all([
    hashPii(ud.email),
    hashPhone(ud.phone),
    hashPii(ud.fn),
    hashPii(ud.ln),
    hashPii(ud.external_id),
  ]);

  const out: HashedUserData = {};
  if (em) out.em = [em];
  if (ph) out.ph = [ph];
  if (fn) out.fn = [fn];
  if (ln) out.ln = [ln];
  if (externalId) out.external_id = [externalId];
  if (ud.fbp) out.fbp = ud.fbp;
  if (ud.fbc) out.fbc = ud.fbc;
  if (ud.client_ip_address) out.client_ip_address = ud.client_ip_address;
  if (ud.client_user_agent) out.client_user_agent = ud.client_user_agent;
  return out;
}

export async function sendMetaCAPI(
  event: MetaCapiEvent,
): Promise<{ ok: boolean; error?: string }> {
  const pixelId = env.META_PIXEL_ID;
  const accessToken = env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[meta-capi] credenciais incompletas, evento ignorado');
    return { ok: false, error: 'missing_credentials' };
  }

  const userData = await buildHashedUserData(event.user_data);

  const customData: MetaCapiCustomData | undefined = event.custom_data
    ? {
        currency: event.custom_data.currency ?? 'BRL',
        ...(typeof event.custom_data.value === 'number'
          ? { value: event.custom_data.value }
          : {}),
        ...(event.custom_data.content_ids
          ? { content_ids: event.custom_data.content_ids }
          : {}),
        ...(event.custom_data.content_name
          ? { content_name: event.custom_data.content_name }
          : {}),
        ...(event.custom_data.content_category
          ? { content_category: event.custom_data.content_category }
          : {}),
      }
    : undefined;

  const eventPayload: Record<string, unknown> = {
    event_name: event.event_name,
    event_id: event.event_id,
    event_time: event.event_time ?? Math.floor(Date.now() / 1000),
    action_source: event.action_source ?? 'website',
    user_data: userData,
  };
  if (event.event_source_url) eventPayload.event_source_url = event.event_source_url;
  if (customData) eventPayload.custom_data = customData;

  const body: Record<string, unknown> = {
    data: [eventPayload],
    access_token: accessToken,
  };

  const testCode = env.META_CAPI_TEST_EVENT_CODE;
  if (testCode) {
    body.test_event_code = testCode;
  }

  const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[meta-capi] envio falhou', res.status, text);
    return { ok: false, error: `http_${res.status}` };
  }

  const json = (await res.json().catch(() => ({}))) as {
    events_received?: number;
    messages?: string[];
    fbtrace_id?: string;
  };

  if (typeof json.events_received === 'number' && json.events_received < 1) {
    console.error('[meta-capi] events_received=0', json);
    return { ok: false, error: 'no_events_received' };
  }

  return { ok: true };
}
