import 'server-only';
import { ulid } from 'ulid';
import { env } from '@/env';
import {
  sendGoogleAdsConversion,
  type GoogleAdsLeadConversion,
} from './google-ads';
import {
  sendMetaCAPI,
  type MetaCapiEvent,
  type MetaEventName,
} from './meta-capi';

export {
  sendGoogleAdsConversion,
  type GoogleAdsLeadConversion,
} from './google-ads';
export {
  sendMetaCAPI,
  type MetaCapiEvent,
  type MetaEventName,
} from './meta-capi';

export type ConversionSource =
  | 'lead_diagnostico'
  | 'lead_doubts'
  | 'lead_advisory'
  | 'purchase_vss'
  | 'purchase_advisory'
  | 'opportunity_won';

export interface FireConversionInput {
  source: ConversionSource;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gclid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  external_id?: string;
  value?: number;
  order_id?: string;
  event_source_url?: string;
  client_ip?: string;
  client_user_agent?: string;
}

export interface FireConversionResult {
  google: { ok: boolean; error?: string };
  meta: { ok: boolean; error?: string };
}

interface SourceMapping {
  metaEvent: MetaEventName;
  googleAction: string | undefined;
  isPurchase: boolean;
}

function mapSource(source: ConversionSource): SourceMapping {
  switch (source) {
    case 'purchase_vss':
    case 'purchase_advisory':
      return {
        metaEvent: 'Purchase',
        googleAction: env.GOOGLE_ADS_CONVERSION_ACTION_PURCHASE,
        isPurchase: true,
      };
    case 'opportunity_won':
      // Won = receita confirmada; trata como Purchase pra ROAS.
      return {
        metaEvent: 'Purchase',
        googleAction: env.GOOGLE_ADS_CONVERSION_ACTION_PURCHASE,
        isPurchase: true,
      };
    case 'lead_diagnostico':
    case 'lead_doubts':
    case 'lead_advisory':
    default:
      return {
        metaEvent: 'Lead',
        googleAction: env.GOOGLE_ADS_CONVERSION_ACTION_LEAD,
        isPurchase: false,
      };
  }
}

/**
 * Constrói `_fbc` a partir de `fbclid` quando o cookie original não foi capturado.
 * Formato Meta: `fb.1.<unix_ms>.<fbclid>`.
 */
function buildFbc(fbc: string | undefined, fbclid: string | undefined): string | undefined {
  if (fbc) return fbc;
  if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;
  return undefined;
}

/**
 * Dispara conversão server-side em paralelo no Google Ads + Meta CAPI.
 *
 * - Nunca lança: sempre retorna `{ google, meta }`.
 * - Sem credenciais → no-op com warn (ver services individuais).
 * - `event_id` (ULID) gerado aqui pra dedup com Pixel client-side.
 */
export async function fireConversion(
  input: FireConversionInput,
): Promise<FireConversionResult> {
  const mapping = mapSource(input.source);
  const eventId = ulid();

  const googlePayload: GoogleAdsLeadConversion | null = mapping.googleAction
    ? {
        conversionAction: mapping.googleAction,
        gclid: input.gclid,
        email: input.email,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        conversionValue: input.value,
        currencyCode: 'BRL',
        orderId: input.order_id,
      }
    : null;

  const metaEvent: MetaCapiEvent = {
    event_name: mapping.metaEvent,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: input.event_source_url,
    action_source: 'website',
    user_data: {
      email: input.email,
      phone: input.phone,
      fn: input.firstName,
      ln: input.lastName,
      fbp: input.fbp,
      fbc: buildFbc(input.fbc, input.fbclid),
      client_ip_address: input.client_ip,
      client_user_agent: input.client_user_agent,
      external_id: input.external_id,
    },
    ...(typeof input.value === 'number' || input.order_id
      ? {
          custom_data: {
            currency: 'BRL',
            ...(typeof input.value === 'number' ? { value: input.value } : {}),
            ...(input.order_id ? { content_ids: [input.order_id] } : {}),
          },
        }
      : {}),
  };

  const googlePromise: Promise<{ ok: boolean; error?: string }> = googlePayload
    ? sendGoogleAdsConversion(googlePayload).catch((err: unknown) => {
        console.error('[conversions] google-ads throw', err);
        return { ok: false, error: 'exception' };
      })
    : Promise.resolve({ ok: false, error: 'missing_conversion_action' });

  const metaPromise = sendMetaCAPI(metaEvent).catch((err: unknown) => {
    console.error('[conversions] meta-capi throw', err);
    return { ok: false, error: 'exception' };
  });

  const [google, meta] = await Promise.all([googlePromise, metaPromise]);

  if (!googlePayload) {
    console.warn(
      `[conversions] sem GOOGLE_ADS_CONVERSION_ACTION_${mapping.isPurchase ? 'PURCHASE' : 'LEAD'}, google ignorado`,
    );
  }

  return { google, meta };
}
