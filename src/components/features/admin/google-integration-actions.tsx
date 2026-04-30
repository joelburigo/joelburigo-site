'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui';

/**
 * Botões de "Sincronizar agora" e "Desconectar" usados em
 * `/admin/integrations/google` quando há conta Google ativa.
 */
export function GoogleIntegrationActions() {
  const router = useRouter();
  const [syncing, setSyncing] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);

  async function onSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/calendar/sync', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        added?: number;
        updated?: number;
        deleted?: number;
        async?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'Falha ao sincronizar');
        return;
      }
      if (data.async) {
        toast.info('Sync iniciado em background');
      } else {
        toast.success(
          `Sync OK — +${data.added ?? 0} / Δ${data.updated ?? 0} / -${data.deleted ?? 0}`
        );
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede');
    } finally {
      setSyncing(false);
    }
  }

  async function onDisconnect() {
    if (disconnecting) return;
    if (!confirm('Desconectar o Google Calendar? Eventos já sincronizados ficam no DB.')) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch('/api/admin/calendar/disconnect', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'Falha ao desconectar');
        return;
      }
      toast.success('Conta desconectada');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede');
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outlineAcid"
        size="sm"
        onClick={onSync}
        disabled={syncing}
        className="font-mono text-[11px] tracking-[0.22em]"
      >
        {syncing ? 'Sincronizando...' : 'Sincronizar agora →'}
      </Button>
      <Button
        type="button"
        variant="outlineFire"
        size="sm"
        onClick={onDisconnect}
        disabled={disconnecting}
        className="font-mono text-[11px] tracking-[0.22em]"
      >
        {disconnecting ? 'Desconectando...' : 'Desconectar'}
      </Button>
    </div>
  );
}
