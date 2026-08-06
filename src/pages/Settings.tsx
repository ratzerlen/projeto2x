import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Card } from '@/components/Card';
import type { Store } from '@/store';
import type { ThemeMode } from '@/types';
import { formatBRL } from '@/lib/calc';

interface SettingsProps {
  store: Store;
}

const THEMES: { id: ThemeMode; label: string; color: string }[] = [
  { id: 'green', label: 'Verde', color: '#22c55e' },
  { id: 'blue', label: 'Azul', color: '#3b82f6' },
  { id: 'amber', label: 'Âmbar', color: '#f59e0b' },
];

export function Settings({ store }: SettingsProps) {
  const { state } = store;
  const s = state.settings;
  const [name, setName] = useState(s.projectName);
  const [bank, setBank] = useState(String(s.initialBank));
  const [goal, setGoal] = useState(String(s.dailyGoal));
  const [startDate, setStartDate] = useState(s.startDate);
  const [theme, setTheme] = useState<ThemeMode>(s.theme);
  const [saved, setSaved] = useState(false);

  const save = () => {
    store.updateSettings({
      projectName: name.trim() || 'Projeto 2X',
      initialBank: Math.max(0, parseFloat(bank.replace(',', '.')) || 0),
      dailyGoal: Math.max(0, parseFloat(goal.replace(',', '.')) || 0),
      startDate,
      theme,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="p-5 sm:p-6 space-y-5">
        <h3 className="font-semibold text-[var(--color-text)]">Configurações do projeto</h3>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Nome do projeto</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Banca inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Meta diária (R$)</label>
            <input
              type="number"
              step="0.01"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Data de início do projeto (Dia 1)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Tema</label>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition ${
                  theme === t.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-text)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                <span className="w-4 h-4 rounded-full" style={{ background: t.color }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)] transition active:scale-[0.98]"
        >
          {saved ? <><Check size={20} /> Salvo!</> : <><Save size={20} /> Salvar configurações</>}
        </button>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3 text-[var(--color-text)]">Resumo atual</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Banca inicial" value={formatBRL(s.initialBank)} />
          <Info label="Meta diária" value={formatBRL(s.dailyGoal)} />
          <Info label="Dias registrados" value={String(Object.keys(state.days).length)} />
          <Info label="Tema ativo" value={THEMES.find((t) => t.id === s.theme)?.label ?? 'Verde'} />
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
      <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">{label}</p>
      <p className="mt-1 font-semibold text-[var(--color-text)] tabular-nums">{value}</p>
    </div>
  );
}
