import 'server-only';

/**
 * SHA-256 hex digest usando WebCrypto (compat Workers + Node 22+).
 *
 * Padrão Google Ads + Meta CAPI: lowercase + trim antes de hashear PII
 * (email, phone, first/last name).
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Normaliza PII textual antes do hash (lowercase + trim).
 * Retorna null se vazio.
 */
export function normalizePii(value: string | undefined | null): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return v.length > 0 ? v : null;
}

/**
 * Normaliza telefone: só dígitos. Padrão E.164 sem `+`.
 * Google e Meta esperam dígitos puros antes do hash.
 */
export function normalizePhoneDigits(value: string | undefined | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

/**
 * Hash PII textual (email/firstName/lastName). Retorna undefined se input vazio.
 */
export async function hashPii(value: string | undefined | null): Promise<string | undefined> {
  const normalized = normalizePii(value);
  if (!normalized) return undefined;
  return sha256Hex(normalized);
}

/**
 * Hash phone (só dígitos). Retorna undefined se input vazio.
 */
export async function hashPhone(value: string | undefined | null): Promise<string | undefined> {
  const normalized = normalizePhoneDigits(value);
  if (!normalized) return undefined;
  return sha256Hex(normalized);
}
