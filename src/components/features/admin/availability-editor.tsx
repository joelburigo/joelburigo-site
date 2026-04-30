'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Editor de disponibilidade (`/admin/disponibilidade`).
 *
 * Duas seções:
 *  - Janelas semanais: matriz weekday × HH:MM start/end
 *  - Exceções pontuais: blocks/extras com starts_at/ends_at
 */

export interface SerializedWindow {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
  active: boolean;
}

export interface SerializedOverride {
  id: string;
  startsAt: string; // ISO
  endsAt: string;
  kind: 'block' | 'extra';
  reason: string | null;
}

const WEEKDAY_LABELS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

const DEFAULT_TZ = 'America/Sao_Paulo';

interface Props {
  initialWindows: SerializedWindow[];
  initialOverrides: SerializedOverride[];
}

export function AvailabilityEditor({ initialWindows, initialOverrides }: Props) {
  const router = useRouter();
  const [windows, setWindows] = React.useState(initialWindows);
  const [overrides, setOverrides] = React.useState(initialOverrides);

  // === Form janela nova ===
  const [windowForm, setWindowForm] = React.useState({
    weekday: '1',
    startTime: '09:00',
    endTime: '18:00',
    timezone: DEFAULT_TZ,
  });
  const [savingWindow, setSavingWindow] = React.useState(false);

  // === Form override novo ===
  const [overrideForm, setOverrideForm] = React.useState({
    kind: 'block' as 'block' | 'extra',
    startsAt: '', // datetime-local
    endsAt: '',
    reason: '',
  });
  const [savingOverride, setSavingOverride] = React.useState(false);

  async function addWindow(e: React.FormEvent) {
    e.preventDefault();
    if (savingWindow) return;
    setSavingWindow(true);
    try {
      const res = await fetch('/api/admin/availability/windows', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          weekday: parseInt(windowForm.weekday, 10),
          startTime: windowForm.startTime,
          endTime: windowForm.endTime,
          timezone: windowForm.timezone,
          active: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        window?: SerializedWindow;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'Falha ao criar janela');
        return;
      }
      if (data.window) {
        setWindows((prev) => [...prev, normalizeWindow(data.window!)]);
      }
      toast.success('Janela criada');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede');
    } finally {
      setSavingWindow(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const res = await fetch(`/api/admin/availability/windows/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        toast.error('Falha ao atualizar janela');
        return;
      }
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, active } : w)));
      toast.success(active ? 'Janela ativada' : 'Janela desativada');
      router.refresh();
    } catch {
      toast.error('Erro de rede');
    }
  }

  async function deleteWindow(id: string) {
    if (!confirm('Apagar essa janela?')) return;
    try {
      const res = await fetch(`/api/admin/availability/windows/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Falha ao apagar janela');
        return;
      }
      setWindows((prev) => prev.filter((w) => w.id !== id));
      toast.success('Janela removida');
      router.refresh();
    } catch {
      toast.error('Erro de rede');
    }
  }

  async function addOverride(e: React.FormEvent) {
    e.preventDefault();
    if (savingOverride) return;
    if (!overrideForm.startsAt || !overrideForm.endsAt) {
      toast.error('Defina início e fim');
      return;
    }
    setSavingOverride(true);
    try {
      const res = await fetch('/api/admin/availability/overrides', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          startsAt: new Date(overrideForm.startsAt).toISOString(),
          endsAt: new Date(overrideForm.endsAt).toISOString(),
          kind: overrideForm.kind,
          reason: overrideForm.reason || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        override?: SerializedOverride;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'Falha ao criar exceção');
        return;
      }
      if (data.override) {
        setOverrides((prev) =>
          [...prev, normalizeOverride(data.override!)].sort((a, b) =>
            a.startsAt.localeCompare(b.startsAt)
          )
        );
      }
      setOverrideForm({ kind: 'block', startsAt: '', endsAt: '', reason: '' });
      toast.success('Exceção criada');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede');
    } finally {
      setSavingOverride(false);
    }
  }

  async function deleteOverride(id: string) {
    if (!confirm('Apagar essa exceção?')) return;
    try {
      const res = await fetch(`/api/admin/availability/overrides/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Falha ao apagar exceção');
        return;
      }
      setOverrides((prev) => prev.filter((o) => o.id !== id));
      toast.success('Exceção removida');
      router.refresh();
    } catch {
      toast.error('Erro de rede');
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* === SECTION JANELAS === */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1 border-l-2 border-fire pl-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-fire uppercase">
            // janelas_semanais
          </span>
          <h2 className="heading-3 text-cream">Janelas recorrentes</h2>
          <p className="body-sm text-fg-3">
            Slots de disponibilidade que se repetem todas as semanas no fuso configurado.
          </p>
        </header>

        <div className="border border-[var(--jb-hair)]">
          <table className="w-full text-left">
            <thead className="bg-ink-2">
              <tr>
                <Th>Dia</Th>
                <Th>Início</Th>
                <Th>Fim</Th>
                <Th>Fuso</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {windows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center font-mono text-[11px] tracking-[0.22em] text-fg-3 uppercase"
                  >
                    // sem janelas configuradas
                  </td>
                </tr>
              )}
              {windows.map((w) => (
                <tr key={w.id} className="border-t border-[var(--jb-hair)]">
                  <Td>{WEEKDAY_LABELS.find((l) => l.value === w.weekday)?.label ?? w.weekday}</Td>
                  <Td className="font-mono text-cream">{w.startTime}</Td>
                  <Td className="font-mono text-cream">{w.endTime}</Td>
                  <Td className="font-mono text-fg-2">{w.timezone}</Td>
                  <Td>
                    <span
                      className={cn(
                        'border-l-2 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase',
                        w.active
                          ? 'border-acid bg-acid/10 text-acid'
                          : 'border-fg-3 bg-cream/5 text-fg-3'
                      )}
                    >
                      {w.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(w.id, !w.active)}
                        className="font-mono text-[10px] tracking-[0.22em] text-fg-2 uppercase hover:text-acid"
                      >
                        {w.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWindow(w.id)}
                        className="font-mono text-[10px] tracking-[0.22em] text-fg-2 uppercase hover:text-fire"
                      >
                        Apagar
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form: nova janela */}
        <form
          onSubmit={addWindow}
          className="bg-ink-2 border border-[var(--jb-hair)] p-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_120px_1fr_auto]"
        >
          <div>
            <Label htmlFor="weekday">Dia da semana</Label>
            <select
              id="weekday"
              value={windowForm.weekday}
              onChange={(e) => setWindowForm({ ...windowForm, weekday: e.target.value })}
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            >
              {WEEKDAY_LABELS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="start">Início</Label>
            <input
              id="start"
              type="time"
              value={windowForm.startTime}
              onChange={(e) => setWindowForm({ ...windowForm, startTime: e.target.value })}
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            />
          </div>
          <div>
            <Label htmlFor="end">Fim</Label>
            <input
              id="end"
              type="time"
              value={windowForm.endTime}
              onChange={(e) => setWindowForm({ ...windowForm, endTime: e.target.value })}
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            />
          </div>
          <div>
            <Label htmlFor="tz">Fuso (IANA)</Label>
            <input
              id="tz"
              value={windowForm.timezone}
              onChange={(e) => setWindowForm({ ...windowForm, timezone: e.target.value })}
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" size="sm" disabled={savingWindow}>
              {savingWindow ? 'Salvando...' : 'Adicionar →'}
            </Button>
          </div>
        </form>
      </section>

      {/* === SECTION OVERRIDES === */}
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1 border-l-2 border-acid pl-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-acid uppercase">
            // exceções_pontuais
          </span>
          <h2 className="heading-3 text-cream">Bloqueios e aberturas extras</h2>
          <p className="body-sm text-fg-3">
            Bloqueia horários que normalmente são livres (`block`) ou abre slots fora das janelas
            (`extra`).
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          {overrides.length === 0 && (
            <div className="md:col-span-2 border border-[var(--jb-hair)] p-6 text-center font-mono text-[11px] tracking-[0.22em] text-fg-3 uppercase">
              // sem exceções nos próximos 30d
            </div>
          )}
          {overrides.map((o) => (
            <div
              key={o.id}
              className={cn(
                'flex flex-col gap-2 border-l-2 bg-ink-2 p-4',
                o.kind === 'block' ? 'border-fire' : 'border-acid'
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-mono text-[10px] tracking-[0.22em] uppercase',
                    o.kind === 'block' ? 'text-fire' : 'text-acid'
                  )}
                >
                  // {o.kind === 'block' ? 'bloqueio' : 'extra'}
                </span>
                <button
                  type="button"
                  onClick={() => deleteOverride(o.id)}
                  className="font-mono text-[10px] tracking-[0.22em] text-fg-2 uppercase hover:text-fire"
                >
                  Apagar
                </button>
              </div>
              <div className="font-mono text-sm text-cream">
                {fmt(o.startsAt)} → {fmt(o.endsAt)}
              </div>
              {o.reason && <div className="text-sm text-fg-2">{o.reason}</div>}
            </div>
          ))}
        </div>

        {/* Form: nova exceção */}
        <form
          onSubmit={addOverride}
          className="bg-ink-2 border border-[var(--jb-hair)] p-4 grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr_1fr_2fr_auto]"
        >
          <div>
            <Label htmlFor="kind">Tipo</Label>
            <select
              id="kind"
              value={overrideForm.kind}
              onChange={(e) =>
                setOverrideForm({ ...overrideForm, kind: e.target.value as 'block' | 'extra' })
              }
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            >
              <option value="block">Bloqueio</option>
              <option value="extra">Extra</option>
            </select>
          </div>
          <div>
            <Label htmlFor="o-start">Início</Label>
            <input
              id="o-start"
              type="datetime-local"
              value={overrideForm.startsAt}
              onChange={(e) => setOverrideForm({ ...overrideForm, startsAt: e.target.value })}
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            />
          </div>
          <div>
            <Label htmlFor="o-end">Fim</Label>
            <input
              id="o-end"
              type="datetime-local"
              value={overrideForm.endsAt}
              onChange={(e) => setOverrideForm({ ...overrideForm, endsAt: e.target.value })}
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            />
          </div>
          <div>
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <input
              id="reason"
              type="text"
              value={overrideForm.reason}
              onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
              placeholder="ex: viagem, feriado"
              className="w-full bg-ink border border-[var(--jb-hair)] px-3 py-2 font-mono text-sm text-cream"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" size="sm" disabled={savingOverride}>
              {savingOverride ? 'Salvando...' : 'Adicionar →'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase mb-1"
    >
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('px-4 py-3 text-sm text-cream', className)}>{children}</td>;
}

function fmt(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function normalizeWindow(w: SerializedWindow | Record<string, unknown>): SerializedWindow {
  // API retorna campos snake_case; normaliza pra camelCase quando vier raw
  const obj = w as Record<string, unknown>;
  return {
    id: String(obj.id),
    weekday: Number(obj.weekday),
    startTime: String(obj.startTime ?? obj.start_time ?? ''),
    endTime: String(obj.endTime ?? obj.end_time ?? ''),
    timezone: String(obj.timezone ?? DEFAULT_TZ),
    active: Boolean(obj.active),
  };
}

function normalizeOverride(o: SerializedOverride | Record<string, unknown>): SerializedOverride {
  const obj = o as Record<string, unknown>;
  return {
    id: String(obj.id),
    startsAt: String(obj.startsAt ?? obj.starts_at ?? ''),
    endsAt: String(obj.endsAt ?? obj.ends_at ?? ''),
    kind: (obj.kind as 'block' | 'extra') ?? 'block',
    reason: (obj.reason as string | null) ?? null,
  };
}
