import 'server-only';
import { env } from '@/env';
import { hashPhone, hashPii } from './_utils';

/**
 * Google Ads — Enhanced Conversions for Leads (server-side).
 *
 * Fluxo:
 *  1. Refresh access token via OAuth (cache 50min em memória).
 *  2. POST customers/{id}:uploadClickConversions — payload com gclid OU
 *     user_identifiers (email/phone hashed) pra Enhanced Conversions for Leads.
 *  3. Sem credenciais → no-op com warn (nunca quebra request principal).
 *
 * Doc: https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
 *      https://developers.google.com/google-ads/api/docs/conversions/enhanced-conversions/leads
 *
 * Decisão Workers: SDK `google-ads-api` é ~5MB+ e usa gRPC — incompat com CF
 * Workers. REST fetch direto é a única opção viável.
 */

const GOOGLE_ADS_API_VERSION = 'v17';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface GoogleAdsLeadConversion {
  /** Resource name completo: `customers/{id}/conversionActions/{id}` */
  conversionAction: string;
  gclid?: string;
  // Enhanced Conversions for Leads — hasheados (sha256) em runtime
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  /** ISO 8601 UTC. Default = now. Google exige formato `YYYY-MM-DD HH:MM:SS+00:00` */
  conversionDateTime?: string;
  conversionValue?: number;
  /** Default 'BRL' */
  currencyCode?: string;
  orderId?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let tokenCache: CachedToken | null = null;
const TOKEN_TTL_MS = 50 * 60 * 1000; // 50min (token vive 1h)

interface GoogleAdsCreds {
  customerId: string;
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  loginCustomerId?: string;
}

function readCreds(): GoogleAdsCreds | null {
  const customerId = env.GOOGLE_ADS_CUSTOMER_ID;
  const developerToken = env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const clientId = env.GOOGLE_ADS_OAUTH_CLIENT_ID;
  const clientSecret = env.GOOGLE_ADS_OAUTH_CLIENT_SECRET;
  const refreshToken = env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!customerId || !developerToken || !clientId || !clientSecret || !refreshToken) {
    return null;
  }

  return {
    customerId,
    developerToken,
    clientId,
    clientSecret,
    refreshToken,
    loginCustomerId: env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  };
}

async function getAccessToken(creds: GoogleAdsCreds): Promise<string | null> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: creds.refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[google-ads] falha refresh token', res.status, text);
    return null;
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    console.error('[google-ads] resposta OAuth sem access_token', json);
    return null;
  }

  tokenCache = {
    accessToken: json.access_token,
    expiresAt: now + TOKEN_TTL_MS,
  };
  return json.access_token;
}

/**
 * Formata ISO datetime pro padrão Google Ads:
 * `YYYY-MM-DD HH:MM:SS+00:00`
 */
function formatConversionDateTime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mi = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}+00:00`;
}

interface UserIdentifier {
  hashedEmail?: string;
  hashedPhoneNumber?: string;
  addressInfo?: {
    hashedFirstName?: string;
    hashedLastName?: string;
  };
}

export async function sendGoogleAdsConversion(
  input: GoogleAdsLeadConversion,
): Promise<{ ok: boolean; error?: string }> {
  const creds = readCreds();
  if (!creds) {
    console.warn('[google-ads] credenciais incompletas, evento ignorado');
    return { ok: false, error: 'missing_credentials' };
  }

  if (!input.conversionAction) {
    console.warn('[google-ads] conversionAction obrigatório, evento ignorado');
    return { ok: false, error: 'missing_conversion_action' };
  }

  const accessToken = await getAccessToken(creds);
  if (!accessToken) {
    return { ok: false, error: 'oauth_failed' };
  }

  const [hashedEmail, hashedPhone, hashedFirstName, hashedLastName] = await Promise.all([
    hashPii(input.email),
    hashPhone(input.phone),
    hashPii(input.firstName),
    hashPii(input.lastName),
  ]);

  const userIdentifiers: UserIdentifier[] = [];
  if (hashedEmail) userIdentifiers.push({ hashedEmail });
  if (hashedPhone) userIdentifiers.push({ hashedPhoneNumber: hashedPhone });
  if (hashedFirstName || hashedLastName) {
    userIdentifiers.push({
      addressInfo: {
        ...(hashedFirstName ? { hashedFirstName } : {}),
        ...(hashedLastName ? { hashedLastName } : {}),
      },
    });
  }

  // Precisa de gclid OU pelo menos um user_identifier (Enhanced Conversions for Leads).
  if (!input.gclid && userIdentifiers.length === 0) {
    console.warn('[google-ads] sem gclid nem user_identifiers, evento ignorado');
    return { ok: false, error: 'missing_match_keys' };
  }

  const conversion: Record<string, unknown> = {
    conversionAction: input.conversionAction,
    conversionDateTime: formatConversionDateTime(input.conversionDateTime),
  };

  if (input.gclid) conversion.gclid = input.gclid;
  if (userIdentifiers.length > 0) conversion.userIdentifiers = userIdentifiers;
  if (typeof input.conversionValue === 'number') {
    conversion.conversionValue = input.conversionValue;
    conversion.currencyCode = input.currencyCode ?? 'BRL';
  }
  if (input.orderId) conversion.orderId = input.orderId;

  const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${creds.customerId}:uploadClickConversions`;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    authorization: `Bearer ${accessToken}`,
    'developer-token': creds.developerToken,
  };
  if (creds.loginCustomerId) {
    headers['login-customer-id'] = creds.loginCustomerId;
  }

  const body = {
    conversions: [conversion],
    partialFailure: true,
    validateOnly: false,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[google-ads] upload falhou', res.status, text);
    return { ok: false, error: `http_${res.status}` };
  }

  const json = (await res.json().catch(() => ({}))) as {
    partialFailureError?: { message?: string };
    results?: unknown[];
  };

  if (json.partialFailureError?.message) {
    console.error('[google-ads] partial failure', json.partialFailureError);
    return { ok: false, error: 'partial_failure' };
  }

  return { ok: true };
}
