import { useState } from 'react';
import { Pencil, Trash2, Plus, FileDown, Check, X, ClipboardList, NotebookPen } from 'lucide-react';
import type { Store } from '@/store';
import type { Entry } from '@/types';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { EntryForm, EditEntryModal } from '@/components/EntryForm';
import { dayStats, formatBRL, formatDateBR, weekdayBR, todayISO, bankBeforeDate } from '@/lib/calc';
import { exportDayPDF } from '@/lib/pdf';

interface PainelProps {
  store: Store;
  date: string;
  onDateChange: (d: string) => void;
}

export function Painel({ store, date, onDateChange }: PainelProps) {
  const { state } = store;
  const day = state.days[date];
  const stats = dayStats(day, state.settings.initialBank);
  const bankIntoDay = bankBeforeDate(state, date);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = [...(day?.entries ?? [])].sort((a, b) => a.time.localeCompare(b.time) || a.createdAt - b.createdAt);

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-1.5">
              Dia selecionado
            </label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition"
            />
            <p className="mt-1 text-xs text-[var(--color-text-mute)]">{formatDateBR(date)} · {weekdayBR(date)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFormOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)] transition active:scale-[0.98]"
            >
              <Plus size={18} /> <span className="sm:hidden">Entrada</span><span className="hidden sm:inline">Adicionar Entrada</span>
            </button>
            <button
              onClick={() => exportDayPDF(state, date)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-primary)] transition"
            >
              <FileDown size={18} /> <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-[var(--color-text)]">
            <ClipboardList size={18} style={{ color: 'var(--color-primary)' }} /> Resumo do dia
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Mini label="Vitórias" value={`${stats.wins}`} tone="positive" />
            <Mini label="Derrotas" value={`${stats.reds}`} tone="negative" />
            <Mini label="Taxa de acerto" value={`${stats.hitRate.toFixed(0)}%`} />
            <Mini label="Entradas" value={`${stats.total}`} />
            <Mini label="Lucro" value={`${stats.profit >= 0 ? '+' : ''}${formatBRL(stats.profit)}`} tone={stats.profit >= 0 ? 'positive' : 'negative'} />
            <Mini label="Banca atual" value={formatBRL(stats.finalBank)} tone="positive" />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-[var(--color-text)]">
            <Check size={18} style={{ color: 'var(--color-primary)' }} /> Disciplina
          </h3>
          <div className="space-y-2.5">
            <Check2 label="Fiz apenas as entradas programadas" checked={day?.discipline.onlyPlanned ?? false} onChange={(v) => store.setDiscipline(date, { onlyPlanned: v })} />
            <Check2 label="Não tentei recuperar perdas" checked={day?.discipline.noRecovery ?? false} onChange={(v) => store.setDiscipline(date, { noRecovery: v })} />
            <Check2 label="Não aumentei o valor da entrada" checked={day?.discipline.noIncrease ?? false} onChange={(v) => store.setDiscipline(date, { noIncrease: v })} />
            <Check2 label="Encerrei o dia conforme o plano" checked={day?.discipline.closedDay ?? false} onChange={(v) => store.setDiscipline(date, { closedDay: v })} />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-[var(--color-text)]">
          <NotebookPen size={18} style={{ color: 'var(--color-primary)' }} /> Observações do dia
        </h3>
        <textarea
          value={day?.observation ?? ''}
          onChange={(e) => store.setObservation(date, e.target.value)}
          rows={4}
          placeholder="Escreva qualquer observação sobre o dia..."
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition resize-none"
        />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-[var(--color-text)]">
            <ClipboardList size={18} style={{ color: 'var(--color-primary)' }} /> Histórico de entradas
          </h3>
          <span className="text-xs text-[var(--color-text-mute)]">{stats.total} registro(s)</span>
        </div>

        {sorted.length === 0 ? (
          <div className="py-10 text-center text-[var(--color-text-mute)]">
            <p className="text-sm">Nenhuma entrada registrada para este dia.</p>
            <button
              onClick={() => setFormOpen(true)}
              className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
            >
              Adicionar primeira entrada
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((e, i) => {
              const bank = bankIntoDay + sorted.slice(0, i + 1).reduce((s, x) => s + x.amount, 0);
              return (
                <div
                  key={e.id}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition animate-fade-in"
                >
                  <div className="text-sm font-mono text-[var(--color-text-dim)] w-12 shrink-0 tabular-nums">{e.time}</div>
                  <div
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      e.result === 'WIN'
                        ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                        : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                    }`}
                  >
                    {e.result === 'WIN' ? <Check size={14} /> : <X size={14} />} {e.result}
                  </div>
                  <div className={`flex-1 min-w-0 font-semibold tabular-nums text-sm ${e.amount >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]'}`}>
                    {e.amount >= 0 ? '+' : ''}{formatBRL(e.amount)}
                  </div>
                  <div className="hidden sm:block text-xs text-[var(--color-text-mute)] tabular-nums">
                    Banca: {formatBRL(bank)}
                  </div>
                  {e.note && (
                    <div className="hidden md:block text-xs text-[var(--color-text-mute)] truncate max-w-32" title={e.note}>
                      {e.note}
                    </div>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditing(e)}
                      className="w-8 h-8 grid place-items-center rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(e.id)}
                      className="w-8 h-8 grid place-items-center rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Nova entrada">
        <EntryForm
          onAdd={(entry) => {
            store.addEntry(date, entry);
            setFormOpen(false);
          }}
        />
      </Modal>

      <EditEntryModal
        open={!!editing}
        entry={editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (editing) store.updateEntry(date, editing.id, patch);
        }}
      />

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir entrada?">
        <p className="text-sm text-[var(--color-text-dim)] mb-5">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmDelete(null)}
            className="flex-1 py-3 rounded-xl font-semibold border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-text-dim)] transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (confirmDelete) store.deleteEntry(date, confirmDelete);
              setConfirmDelete(null);
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

function Mini({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'positive' | 'negative' }) {
  const c = tone === 'positive' ? 'text-[var(--color-primary)]' : tone === 'negative' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]';
  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
      <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">{label}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${c}`}>{value}</p>
    </div>
  );
}

function Check2({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full text-left p-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition group"
    >
      <span
        className={`w-5 h-5 rounded-md border-2 grid place-items-center shrink-0 transition ${
          checked
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
            : 'border-[var(--color-border)] group-hover:border-[var(--color-text-dim)]'
        }`}
      >
        {checked && <Check size={13} className="text-black" />}
      </span>
      <span className={`text-sm ${checked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'}`}>{label}</span>
    </button>
  );
}
