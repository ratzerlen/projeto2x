import { useState } from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import type { StoreState } from '@/types';
import type { Store } from '@/store';
import { dayStats, formatBRL, formatDateBR, weekdayBR, allDaysSorted } from '@/lib/calc';

interface HistoryProps {
  store: Store;
  onOpenDay: (date: string) => void;
}

export function History({ store, onOpenDay }: HistoryProps) {
  const { state } = store;
  const days = allDaysSorted(state).reverse();
  const [confirm, setConfirm] = useState<string | null>(null);

  if (days.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-[var(--color-text-mute)]">Nenhum dia registrado ainda.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[var(--color-text-dim)] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <th className="py-3 px-4 font-medium">Data</th>
                <th className="py-3 px-4 font-medium">Entradas</th>
                <th className="py-3 px-4 font-medium">WIN</th>
                <th className="py-3 px-4 font-medium">RED</th>
                <th className="py-3 px-4 font-medium">Acerto</th>
                <th className="py-3 px-4 font-medium">Lucro</th>
                <th className="py-3 px-4 font-medium">Prejuízo</th>
                <th className="py-3 px-4 font-medium">Banca final</th>
                <th className="py-3 px-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const s = dayStats(state.days[d], state.settings.initialBank);
                const loss = s.profit < 0 ? Math.abs(s.profit) : 0;
                return (
                  <tr key={d} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition">
                    <td className="py-3 px-4">
                      <button onClick={() => onOpenDay(d)} className="text-left">
                        <span className="text-[var(--color-text)] font-medium">{formatDateBR(d)}</span>
                        <span className="block text-xs text-[var(--color-text-mute)] capitalize">{weekdayBR(d)}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-dim)] tabular-nums">{s.total}</td>
                    <td className="py-3 px-4 text-[var(--color-primary)] tabular-nums">{s.wins}</td>
                    <td className="py-3 px-4 text-[var(--color-danger)] tabular-nums">{s.reds}</td>
                    <td className="py-3 px-4 text-[var(--color-text-dim)] tabular-nums">{s.hitRate.toFixed(0)}%</td>
                    <td className={`py-3 px-4 tabular-nums ${s.profit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-mute)]'}`}>
                      {s.profit >= 0 ? `+${formatBRL(s.profit)}` : '-'}
                    </td>
                    <td className={`py-3 px-4 tabular-nums ${loss > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-mute)]'}`}>
                      {loss > 0 ? `-${formatBRL(loss)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text)] tabular-nums">{formatBRL(s.finalBank)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenDay(d)}
                          className="w-8 h-8 grid place-items-center rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button
                          onClick={() => setConfirm(d)}
                          className="w-8 h-8 grid place-items-center rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Excluir dia?">
        <p className="text-sm text-[var(--color-text-dim)] mb-5">
          Todas as entradas e observações de {confirm ? formatDateBR(confirm) : ''} serão removidas. Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirm(null)}
            className="flex-1 py-3 rounded-xl font-semibold border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-text-dim)] transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (confirm) store.deleteDay(confirm);
              setConfirm(null);
            }}
            className="flex-1 py-3 rounded-xl font-semibold bg-[var(--color-danger)] text-white hover:opacity-90 transition"
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
}
