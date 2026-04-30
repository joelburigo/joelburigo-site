'use client';

import { useEffect } from 'react';
import type { PublicEnv } from '@/lib/public-env';
import { PUBLIC_ENV_WINDOW_KEY } from '@/lib/public-env';

/**
 * Hidrata `window.__JB_ENV` no client sem usar `<script>` no React tree
 * (React 19 emite warning pra qualquer <script> dentro do tree).
 *
 * Server passa o objeto montado via prop. useEffect roda 1x no mount,
 * idempotente. Trade-off: env só fica disponível APÓS hydrate — todos
 * os consumers (analytics, GTM init, Turnstile) também rodam pós-hydrate
 * então não tem race condition prática.
 */
export function PublicEnvHydrator({ env }: { env: PublicEnv }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[PUBLIC_ENV_WINDOW_KEY] = env;
  }, [env]);
  return null;
}
