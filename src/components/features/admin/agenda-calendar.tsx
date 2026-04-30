'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Calendário visual unificado pra `/admin/agenda`.
 *
 * Recebe eventos serializados (datas como ISO) do server component pai e
 * gerencia navegação via search params (router.push).
 *
 * Views suportadas:
 *  - SEMANA (default): grid 7 cols × N horas (8h-22h por padrão)
 *  - DIA: 1 col × N horas (mais detalhe)
 *  - MÊS: grid 7×6 com lista resumida
 *
 * Cores por source seguem spec da Frente D:
 *  - advisory_session → fire
 *  - mentoria → acid
 *  - aula → cream
 *  - activity → cyan
 *  - external_google → cinza (neutro)
 *  - manual → fire dim
 */

export type AgendaRange = 'week' | 'month' | 'day';

export interface SerializedCalendarEvent {
  id: string;
  source: string;
  sourceId: string | null;
  title: string;
  descriptionMd: string | null;
  startsAt: string; // ISO
  endsAt: string;
  timezone: string;
  meetingUrl: string | null;
  location: string | null;
  attendees: unknown;
  googleEventId: string | null;
  syncStatus: string | null;
}

export interface AgendaCalendarProps {
  events: SerializedCalendarEvent[];
  range: AgendaRange;
  refDate: string; // 'YYYY-MM-DD'
  hasGoogleAccount: boolean;
}

interface SourceStyle {
  label: string;
  bg: string;
  border: string;
  text: string;
}

const SOURCE_STYLES: Record<string, SourceStyle> = {
  advisory_session: {
    label: 'Advisory',
    bg: 'bg-[rgba(255,59,15,0.18)]',
    border: 'border-fire',
    text: 'text-fire',
  },
  mentoria: {
    label: 'Mentoria',
    bg: 'bg-[rgba(198,255,0,0.18)]',
    border: 'border-acid',
    text: 'text-acid',
  },
  aula: {
    label: 'Aula',
    bg: 'bg-[rgba(245,241,232,0.12)]',
    border: 'border-cream',
    text: 'text-cream',
  },
  activity: {
    label: 'Atividade',
    bg: 'bg-[rgba(0,224,255,0.18)]',
    border: 'border-cyan',
    text: 'text-cyan',
  },
  external_google: {
    label: 'Google',
    bg: 'bg-[rgba(120,120,120,0.2)]',
    border: 'border-[#666]',
    text: 'text-fg-3',
  },
  manual: {
    label: 'Manual',
    bg: 'bg-[rgba(255,59,15,0.08)]',
    border: 'border-[var(--jb-fire-border)]',
    text: 'text-fire',
  },
};

function getStyleForSource(source: string): SourceStyle {
  return SOURCE_STYLES[source] ?? SOURCE_STYLES.manual!;
}

// === Helpers de data ===

function parseRefToDate(ref: string): Date {
  // ref no formato YYYY-MM-DD; usa 12:00 UTC pra evitar fronteira de TZ
  const [y, m, d] = ref.split('-').map((n) => parseInt(n, 10));
  const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
  return dt;
}

function formatRef(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date): Date {
  // Segunda-feira como início (pt-BR)
  const dow = d.getUTCDay(); // 0=dom, 1=seg
  const diff = dow === 0 ? -6 : 1 - dow;
  const start = new Date(d);
  start.setUTCDate(start.getUTCDate() + diff);
  return start;
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 12, 0, 0));
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

// === Formatters ===

const WEEKDAY_LABELS_SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function localTimeLabel(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function localDateLabel(d: Date): string {
  return `${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]?.slice(0, 3) ?? ''}`;
}

// === Hooks ===

function useEventsByDay(events: SerializedCalendarEvent[]): Map<string, SerializedCalendarEvent[]> {
  return React.useMemo(() => {
    const map = new Map<string, SerializedCalendarEvent[]>();
    for (const e of events) {
      const d = new Date(e.startsAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);
}

// === Componente ===

export function AgendaCalendar({ events, range, refDate, hasGoogleAccount }: AgendaCalendarProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = React.useState<SerializedCalendarEvent | null>(null);

  const refAsDate = React.useMemo(() => parseRefToDate(refDate), [refDate]);

  function navigate(newRange: AgendaRange, newRef: Date) {
    const params = new URLSearchParams();
    params.set('range', newRange);
    params.set('ref', formatRef(newRef));
    router.push(`/admin/agenda?${params.toString()}`);
  }

  function goToday() {
    navigate(range, new Date());
  }

  function goPrev() {
    if (range === 'week') navigate('week', addDays(refAsDate, -7));
    else if (range === 'day') navigate('day', addDays(refAsDate, -1));
    else {
      const d = new Date(refAsDate);
      d.setUTCMonth(d.getUTCMonth() - 1);
      navigate('month', d);
    }
  }

  function goNext() {
    if (range === 'week') navigate('week', addDays(refAsDate, 7));
    else if (range === 'day') navigate('day', addDays(refAsDate, 1));
    else {
      const d = new Date(refAsDate);
      d.setUTCMonth(d.getUTCMonth() + 1);
      navigate('month', d);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Toolbar
        range={range}
        refAsDate={refAsDate}
        hasGoogleAccount={hasGoogleAccount}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onRangeChange={(r) => navigate(r, refAsDate)}
      />

      {range === 'week' && (
        <WeekView
          events={events}
          refAsDate={refAsDate}
          onSelectEvent={setSelectedEvent}
        />
      )}
      {range === 'day' && (
        <DayView
          events={events}
          refAsDate={refAsDate}
          onSelectEvent={setSelectedEvent}
        />
      )}
      {range === 'month' && (
        <MonthView
          events={events}
          refAsDate={refAsDate}
          onSelectEvent={setSelectedEvent}
        />
      )}

      <Legend />

      <Sheet
        open={selectedEvent !== null}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          {selectedEvent && <EventDetail event={selectedEvent} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Toolbar({
  range,
  refAsDate,
  hasGoogleAccount,
  onPrev,
  onNext,
  onToday,
  onRangeChange,
}: {
  range: AgendaRange;
  refAsDate: Date;
  hasGoogleAccount: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onRangeChange: (r: AgendaRange) => void;
}) {
  const periodLabel = (() => {
    if (range === 'month') {
      return `${MONTH_LABELS[refAsDate.getUTCMonth()]} ${refAsDate.getUTCFullYear()}`;
    }
    if (range === 'day') {
      return `${WEEKDAY_LABELS_SHORT[(refAsDate.getUTCDay() + 6) % 7]} · ${localDateLabel(refAsDate)} ${refAsDate.getUTCFullYear()}`;
    }
    const start = startOfWeek(refAsDate);
    const end = addDays(start, 6);
    return `${localDateLabel(start)} – ${localDateLabel(end)} ${end.getUTCFullYear()}`;
  })();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--jb-hair)] pb-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToday}
          className="border border-[var(--jb-hair-strong)] bg-transparent px-4 py-2 font-mono text-[11px] tracking-[0.22em] text-cream uppercase transition-colors hover:border-acid hover:text-acid"
        >
          Hoje
        </button>
        <div className="flex">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Anterior"
            className="border border-[var(--jb-hair-strong)] border-r-0 bg-transparent p-2 text-cream transition-colors hover:border-acid hover:text-acid"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Próximo"
            className="border border-[var(--jb-hair-strong)] bg-transparent p-2 text-cream transition-colors hover:border-acid hover:text-acid"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="font-display text-lg uppercase tracking-wider text-cream">
          {periodLabel}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex" role="tablist" aria-label="Visualização">
          {(['day', 'week', 'month'] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              onClick={() => onRangeChange(r)}
              className={cn(
                'border px-3 py-2 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors',
                r !== 'day' && 'border-l-0',
                range === r
                  ? 'border-fire bg-fire/10 text-fire'
                  : 'border-[var(--jb-hair-strong)] text-cream hover:border-acid hover:text-acid'
              )}
            >
              {r === 'day' ? 'Dia' : r === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>

        {!hasGoogleAccount && (
          <ButtonLink
            href="/admin/integrations/google"
            variant="outlineFire"
            size="sm"
            className="font-mono text-[11px] tracking-[0.22em]"
          >
            Conectar Google →
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

// === Week view ===

const WEEK_HOUR_START = 8;
const WEEK_HOUR_END = 22; // exclusive
const WEEK_HOUR_HEIGHT = 56; // px por hora

function WeekView({
  events,
  refAsDate,
  onSelectEvent,
}: {
  events: SerializedCalendarEvent[];
  refAsDate: Date;
  onSelectEvent: (e: SerializedCalendarEvent) => void;
}) {
  const start = React.useMemo(() => startOfWeek(refAsDate), [refAsDate]);
  const days = React.useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 7; i++) arr.push(addDays(start, i));
    return arr;
  }, [start]);

  const eventsByDay = useEventsByDay(events);
  const today = new Date();

  function eventsForDay(d: Date) {
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const list = eventsByDay.get(key) ?? [];
    return list.sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] border border-[var(--jb-hair)]">
        {/* Header dos dias */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[var(--jb-hair)]">
          <div className="bg-ink-2 p-2 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
            UTC
          </div>
          {days.map((d) => {
            const isToday = isSameUTCDay(
              d,
              new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12))
            );
            return (
              <div
                key={d.toISOString()}
                className={cn(
                  'p-2 text-center border-l border-[var(--jb-hair)]',
                  isToday ? 'bg-fire/10' : 'bg-ink-2'
                )}
              >
                <div className="font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
                  {WEEKDAY_LABELS_SHORT[(d.getUTCDay() + 6) % 7]}
                </div>
                <div
                  className={cn(
                    'mt-1 font-display text-xl',
                    isToday ? 'text-fire' : 'text-cream'
                  )}
                >
                  {d.getUTCDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Body: horas + eventos posicionados */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Hour labels */}
          <div>
            {Array.from({ length: WEEK_HOUR_END - WEEK_HOUR_START }, (_, i) => (
              <div
                key={i}
                style={{ height: WEEK_HOUR_HEIGHT }}
                className="bg-ink-2 border-t border-[var(--jb-hair)] p-1 font-mono text-[10px] tracking-[0.18em] text-fg-3"
              >
                {String(WEEK_HOUR_START + i).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map((d) => {
            const dayEvents = eventsForDay(d);
            return (
              <div
                key={d.toISOString()}
                className="relative border-l border-[var(--jb-hair)]"
                style={{
                  height: (WEEK_HOUR_END - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT,
                }}
              >
                {/* Hour grid lines */}
                {Array.from({ length: WEEK_HOUR_END - WEEK_HOUR_START }, (_, i) => (
                  <div
                    key={i}
                    className="border-t border-[var(--jb-hair)]"
                    style={{ height: WEEK_HOUR_HEIGHT }}
                  />
                ))}

                {/* Eventos posicionados */}
                {dayEvents.map((e) => {
                  const start = new Date(e.startsAt);
                  const end = new Date(e.endsAt);
                  const startHour = start.getHours() + start.getMinutes() / 60;
                  const endHour = end.getHours() + end.getMinutes() / 60;
                  // clamp ao [WEEK_HOUR_START, WEEK_HOUR_END]
                  const top = Math.max(0, (startHour - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT);
                  const bottom = Math.min(
                    (WEEK_HOUR_END - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT,
                    (endHour - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT
                  );
                  const height = Math.max(20, bottom - top);
                  const style = getStyleForSource(e.source);
                  // Eventos fora do range visível: render como pill no topo (00:00-08:00) ou bottom
                  const isOutOfRange = startHour < WEEK_HOUR_START || startHour >= WEEK_HOUR_END;

                  if (isOutOfRange) return null;

                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onSelectEvent(e)}
                      style={{ top, height }}
                      className={cn(
                        'absolute inset-x-1 z-10 cursor-pointer overflow-hidden border-l-2 px-2 py-1 text-left transition-all',
                        style.bg,
                        style.border,
                        'hover:z-20 hover:shadow-[2px_2px_0_var(--jb-hair-strong)]'
                      )}
                    >
                      <div
                        className={cn(
                          'truncate font-mono text-[10px] tracking-[0.12em] uppercase',
                          style.text
                        )}
                      >
                        {localTimeLabel(e.startsAt)} {style.label}
                      </div>
                      <div className="truncate text-[12px] text-cream">{e.title}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === Day view ===

function DayView({
  events,
  refAsDate,
  onSelectEvent,
}: {
  events: SerializedCalendarEvent[];
  refAsDate: Date;
  onSelectEvent: (e: SerializedCalendarEvent) => void;
}) {
  const eventsByDay = useEventsByDay(events);
  const key = `${refAsDate.getUTCFullYear()}-${String(refAsDate.getUTCMonth() + 1).padStart(2, '0')}-${String(refAsDate.getUTCDate()).padStart(2, '0')}`;
  const dayEvents = (eventsByDay.get(key) ?? []).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <div className="border border-[var(--jb-hair)]">
      <div className="border-b border-[var(--jb-hair)] bg-ink-2 p-3 font-mono text-[11px] tracking-[0.22em] text-fg-3 uppercase">
        {WEEKDAY_LABELS_SHORT[(refAsDate.getUTCDay() + 6) % 7]} ·{' '}
        {localDateLabel(refAsDate)} {refAsDate.getUTCFullYear()}
      </div>
      <div className="grid grid-cols-[80px_1fr]">
        <div>
          {Array.from({ length: WEEK_HOUR_END - WEEK_HOUR_START }, (_, i) => (
            <div
              key={i}
              style={{ height: WEEK_HOUR_HEIGHT }}
              className="border-t border-[var(--jb-hair)] bg-ink-2 p-2 font-mono text-[10px] tracking-[0.18em] text-fg-3"
            >
              {String(WEEK_HOUR_START + i).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div
          className="relative border-l border-[var(--jb-hair)]"
          style={{ height: (WEEK_HOUR_END - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT }}
        >
          {Array.from({ length: WEEK_HOUR_END - WEEK_HOUR_START }, (_, i) => (
            <div
              key={i}
              className="border-t border-[var(--jb-hair)]"
              style={{ height: WEEK_HOUR_HEIGHT }}
            />
          ))}
          {dayEvents.map((e) => {
            const start = new Date(e.startsAt);
            const end = new Date(e.endsAt);
            const startHour = start.getHours() + start.getMinutes() / 60;
            const endHour = end.getHours() + end.getMinutes() / 60;
            const top = Math.max(0, (startHour - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT);
            const bottom = Math.min(
              (WEEK_HOUR_END - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT,
              (endHour - WEEK_HOUR_START) * WEEK_HOUR_HEIGHT
            );
            const height = Math.max(28, bottom - top);
            const style = getStyleForSource(e.source);
            if (startHour < WEEK_HOUR_START || startHour >= WEEK_HOUR_END) return null;

            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onSelectEvent(e)}
                style={{ top, height }}
                className={cn(
                  'absolute inset-x-2 z-10 cursor-pointer overflow-hidden border-l-2 px-3 py-2 text-left transition-all',
                  style.bg,
                  style.border,
                  'hover:z-20 hover:shadow-[3px_3px_0_var(--jb-hair-strong)]'
                )}
              >
                <div
                  className={cn(
                    'truncate font-mono text-[10px] tracking-[0.12em] uppercase',
                    style.text
                  )}
                >
                  {localTimeLabel(e.startsAt)} – {localTimeLabel(e.endsAt)} · {style.label}
                </div>
                <div className="truncate text-sm text-cream">{e.title}</div>
              </button>
            );
          })}
          {dayEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.22em] text-fg-3 uppercase">
              // sem eventos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// === Month view ===

function MonthView({
  events,
  refAsDate,
  onSelectEvent,
}: {
  events: SerializedCalendarEvent[];
  refAsDate: Date;
  onSelectEvent: (e: SerializedCalendarEvent) => void;
}) {
  const monthStart = startOfMonth(refAsDate);
  const gridStart = startOfWeek(monthStart);
  const eventsByDay = useEventsByDay(events);
  const today = new Date();

  // 6 semanas * 7 dias = 42 cells (suficiente pro pior mês)
  const cells = React.useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) arr.push(addDays(gridStart, i));
    return arr;
  }, [gridStart]);

  return (
    <div className="border border-[var(--jb-hair)]">
      <div className="grid grid-cols-7 border-b border-[var(--jb-hair)] bg-ink-2">
        {WEEKDAY_LABELS_SHORT.map((w) => (
          <div
            key={w}
            className="border-r border-[var(--jb-hair)] p-2 text-center font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase last:border-r-0"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d) => {
          const inMonth = d.getUTCMonth() === refAsDate.getUTCMonth();
          const isToday = isSameUTCDay(
            d,
            new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12))
          );
          const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
          const dayEvents = (eventsByDay.get(key) ?? []).sort(
            (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
          );

          return (
            <div
              key={d.toISOString()}
              className={cn(
                'border-r border-b border-[var(--jb-hair)] p-2 last:border-r-0',
                inMonth ? 'bg-ink' : 'bg-ink-2',
                'min-h-[110px]'
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-display text-sm',
                    isToday ? 'text-fire' : inMonth ? 'text-cream' : 'text-fg-3'
                  )}
                >
                  {d.getUTCDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="font-mono text-[10px] tracking-[0.18em] text-fg-3">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {dayEvents.slice(0, 3).map((e) => {
                  const style = getStyleForSource(e.source);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onSelectEvent(e)}
                      className={cn(
                        'block w-full overflow-hidden border-l-2 px-1 py-0.5 text-left text-[11px] truncate cursor-pointer transition-colors',
                        style.bg,
                        style.border,
                        'hover:bg-cream/10'
                      )}
                    >
                      <span className={cn('font-mono text-[9px] tracking-[0.12em] uppercase mr-1', style.text)}>
                        {localTimeLabel(e.startsAt)}
                      </span>
                      <span className="text-cream">{e.title}</span>
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="font-mono text-[10px] text-fg-3">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--jb-hair)] pt-4">
      <span className="font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
        // origem:
      </span>
      {Object.entries(SOURCE_STYLES).map(([key, s]) => (
        <span key={key} className="flex items-center gap-1.5">
          <span className={cn('inline-block h-3 w-3 border-l-2', s.border, s.bg)} aria-hidden />
          <span className="font-mono text-[10px] tracking-[0.18em] text-fg-3 uppercase">
            {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}

function EventDetail({ event }: { event: SerializedCalendarEvent }) {
  const style = getStyleForSource(event.source);
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);

  const dateLabel = `${WEEKDAY_LABELS_SHORT[(start.getDay() + 6) % 7]}, ${start.getDate()} ${MONTH_LABELS[start.getMonth()]?.slice(0, 3) ?? ''} ${start.getFullYear()}`;
  const timeLabel = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} – ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

  const attendees = Array.isArray(event.attendees)
    ? (event.attendees as Array<{ email: string; name?: string }>)
    : [];

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-col gap-2">
        <span
          className={cn(
            'inline-flex w-fit border-l-2 px-2 py-1 font-mono text-[10px] tracking-[0.22em] uppercase',
            style.bg,
            style.border,
            style.text
          )}
        >
          // {style.label}
        </span>
        <SheetTitle className="text-cream">{event.title}</SheetTitle>
        <SheetDescription>
          {dateLabel} · {timeLabel} ({event.timezone})
        </SheetDescription>
      </div>

      {event.descriptionMd && (
        <div className="border border-[var(--jb-hair)] p-3">
          <div className="mb-1 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
            // descrição
          </div>
          <p className="whitespace-pre-wrap text-sm text-cream">{event.descriptionMd}</p>
        </div>
      )}

      {event.meetingUrl && (
        <div>
          <div className="mb-1 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
            // meeting
          </div>
          <a
            href={event.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm text-acid underline-offset-2 hover:underline"
          >
            {event.meetingUrl}
          </a>
        </div>
      )}

      {event.location && (
        <div>
          <div className="mb-1 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
            // local
          </div>
          <p className="text-sm text-cream">{event.location}</p>
        </div>
      )}

      {attendees.length > 0 && (
        <div>
          <div className="mb-1 font-mono text-[10px] tracking-[0.22em] text-fg-3 uppercase">
            // participantes
          </div>
          <ul className="flex flex-col gap-1 text-sm text-cream">
            {attendees.map((a) => (
              <li key={a.email}>
                {a.name ? `${a.name} · ` : ''}
                <span className="font-mono text-fg-2">{a.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-[var(--jb-hair)] pt-3 font-mono text-[10px] tracking-[0.18em] text-fg-3">
        <div>// id: {event.id}</div>
        {event.googleEventId && <div>// google: {event.googleEventId}</div>}
        {event.syncStatus && <div>// sync: {event.syncStatus}</div>}
      </div>
    </div>
  );
}
