import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import type { StoreState } from '@/types';
import { dayStats, formatBRL, formatDateBR, weekdayBR } from '@/lib/calc';

interface CalendarProps {
  state: StoreState;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function Calendar({ state }: CalendarProps) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const firstDay = new Date(view.y, view.m, 1);
  const lastDay = new Date(view.y, view.m + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(iso);
  }

  const prev = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const next = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const monthLabel = firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const selDay = selected ? state.days[selected] : undefined;
  const selStats = selected ? dayStats(selDay, state.settings.initialBank) : null;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prev} className="w-9 h-9 grid place-items-center rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition">
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-semibold capitalize text-[var(--color-text)]">{monthLabel}</h3>
          <button onClick={next} className="w-9 h-9 grid place-items-center rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="text-center text-xs text-[var(--color-text-mute)] py-1 font-medium">{w}</div>
          ))}
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const day = state.days[iso];
            const stats = day ? dayStats(day, state.settings.initialBank) : null;
            const dayNum = Number(iso.slice(8));
            const isToday = iso === new Date().toISOString().slice(0, 10);
            return (
              <button
                key={i}
                onClick={() => setSelected(iso)}
                className={`aspect-square rounded-lg p-1.5 sm:p-2 flex flex-col items-center justify-center border transition relative ${
                  isToday
                    ? 'border-[var(--color-primary)]'
                    : 'border-[var(--color-border)]'
                } ${day ? 'bg-[var(--color-surface-2)] hover:border-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-2)]'}`}
              >
                <span className={`text-sm ${day ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-mute)]'}`}>{dayNum}</span>
                {stats && (
                  <span className={`text-[10px] sm:text-xs font-semibold tabular-nums ${stats.profit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]'}`}>
                    {stats.profit >= 0 ? '+' : ''}{stats.profit > 0 ? '+' : ''}{Math.abs(stats.profit) >= 1000 ? `${(stats.profit / 1000).toFixed(1)}k` : formatBRL(stats.profit).replace('R$', '').trim()}
                  </span>
                )}
                {stats && stats.total > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? formatDateBR(selected) : ''}>
        {selected && selStats ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-dim)] capitalize">{weekdayBR(selected)}</p>
            <div className="grid grid-cols-2 gap-3">
              <Box label="Vitórias" value={`${selStats.wins}`} tone="positive" />
              <Box label="Derrotas" value={`${selStats.reds}`} tone="negative" />
              <Box label="Taxa de acerto" value={`${selStats.hitRate.toFixed(0)}%`} />
              <Box label="Entradas" value={`${selStats.total}`} />
              <Box label="Lucro" value={`${selStats.profit >= 0 ? '+' : ''}${formatBRL(selStats.profit)}`} tone={selStats.profit >= 0 ? 'positive' : 'negative'} />
              <Box label="Banca final" value={formatBRL(selStats.finalBank)} tone="positive" />
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Entradas</h4>
              <div className="space-y-1.5">
                {[...selDay!.entries].sort((a, b) => a.time.localeCompare(b.time)).map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-[var(--color-surface-2)]">
                    <span className="font-mono text-[var(--color-text-dim)] text-xs w-12">{e.time}</span>
                    <span className={e.result === 'WIN' ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]'}>
                      {e.result === 'WIN' ? <Check size={14} className="inline" /> : <X size={14} className="inline" />} {e.result}
                    </span>
                    <span className={`flex-1 text-right tabular-nums ${e.amount >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]'}`}>
                      {e.amount >= 0 ? '+' : ''}{formatBRL(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selDay!.observation && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Observações</h4>
                <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{selDay!.observation}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-mute)] py-6 text-center">Nenhum registro para este dia.</p>
        )}
      </Modal>
    </div>
  );
}

function Box({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'positive' | 'negative' }) {
  const c = tone === 'positive' ? 'text-[var(--color-primary)]' : tone === 'negative' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]';
  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
      <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">{label}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${c}`}>{value}</p>
    </div>
  );
}
