import { useEffect, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import type { Entry, EntryResult } from '@/types';
import { Modal } from '@/components/Modal';

interface EntryFormProps {
  onAdd: (entry: Omit<Entry, 'id' | 'createdAt'>) => void;
  defaultTime?: string;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function EntryForm({ onAdd, defaultTime }: EntryFormProps) {
  const [time, setTime] = useState(defaultTime ?? nowTime());
  const [result, setResult] = useState<EntryResult>('WIN');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    onAdd({
      time,
      result,
      amount: result === 'WIN' ? Math.abs(value) : -Math.abs(value),
      note: note.trim() || undefined,
    });
    setAmount('');
    setNote('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
          Horário
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
          Resultado
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setResult('WIN')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition ${
              result === 'WIN'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            <Check size={18} /> WIN
          </button>
          <button
            type="button"
            onClick={() => setResult('RED')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition ${
              result === 'RED'
                ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            <X size={18} /> RED
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
          Valor {result === 'WIN' ? 'ganho' : 'perdido'} (R$)
        </label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition tabular-nums"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
          Observação
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Opcional..."
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition resize-none"
        />
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <button
        onClick={submit}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)] transition active:scale-[0.98]"
      >
        <Plus size={20} /> Adicionar Entrada
      </button>
    </div>
  );
}

interface EditEntryModalProps {
  open: boolean;
  onClose: () => void;
  entry: Entry | null;
  onSave: (patch: Partial<Entry>) => void;
}

export function EditEntryModal({ open, onClose, entry, onSave }: EditEntryModalProps) {
  const [time, setTime] = useState('');
  const [result, setResult] = useState<EntryResult>('WIN');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open && entry) {
      setTime(entry.time);
      setResult(entry.result);
      setAmount(String(Math.abs(entry.amount).toFixed(2)));
      setNote(entry.note ?? '');
    }
  }, [open, entry]);

  const save = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value <= 0) return;
    onSave({
      time,
      result,
      amount: result === 'WIN' ? Math.abs(value) : -Math.abs(value),
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar Entrada">
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
            Horário
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setResult('WIN')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition ${
              result === 'WIN'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)]'
            }`}
          >
            <Check size={18} /> WIN
          </button>
          <button
            type="button"
            onClick={() => setResult('RED')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition ${
              result === 'RED'
                ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)]'
            }`}
          >
            <X size={18} /> RED
          </button>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition tabular-nums"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
            Observação
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition resize-none"
          />
        </div>
        <button
          onClick={save}
          className="w-full py-3.5 rounded-xl font-semibold bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)] transition active:scale-[0.98]"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
}
