import { useMemo } from 'react';
import { LineChart, BarChart, DonutChart } from '@/components/Charts';
import { Card } from '@/components/Card';
import type { StoreState } from '@/types';
import { dayStats, formatBRL, formatDateBR, allDaysSorted } from '@/lib/calc';

interface StatsProps {
  state: StoreState;
}

export function Statistics({ state }: StatsProps) {
  const days = allDaysSorted(state);

  const bankEvolution = useMemo(() => {
    let bank = state.settings.initialBank;
    return days.map((d) => {
      const s = dayStats(state.days[d], state.settings.initialBank);
      bank += s.profit;
      return { label: d.slice(5), value: Math.round(bank * 100) / 100 };
    });
  }, [days, state]);

  const profitByDay = useMemo(
    () => days.map((d) => ({ label: d.slice(5), value: Math.round(dayStats(state.days[d], state.settings.initialBank).profit * 100) / 100 })),
    [days, state],
  );

  const hitRateByDay = useMemo(
    () =>
      days.map((d) => ({
        label: d.slice(5),
        value: Math.round(dayStats(state.days[d], state.settings.initialBank).hitRate * 100) / 100,
      })),
    [days, state],
  );

  const totalWins = days.reduce((s, d) => s + dayStats(state.days[d], state.settings.initialBank).wins, 0);
  const totalReds = days.reduce((s, d) => s + dayStats(state.days[d], state.settings.initialBank).reds, 0);

  if (days.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-[var(--color-text-mute)]">Nenhum dado registrado ainda. Adicione entradas para ver as estatísticas.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4 text-[var(--color-text)]">Evolução da banca</h3>
          <LineChart data={bankEvolution} format={(n) => formatBRL(n)} />
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4 text-[var(--color-text)]">WIN x RED</h3>
          <div className="py-4 grid place-items-center">
            <DonutChart wins={totalWins} reds={totalReds} />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4 text-[var(--color-text)]">Lucro por dia</h3>
        <BarChart data={profitByDay} format={(n) => formatBRL(n)} />
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4 text-[var(--color-text)]">Taxa de acerto diária (%)</h3>
        <LineChart data={hitRateByDay} format={(n) => `${n.toFixed(0)}%`} />
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4 text-[var(--color-text)]">Detalhe por dia</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-dim)] border-b border-[var(--color-border)]">
                <th className="py-2 pr-4 font-medium">Data</th>
                <th className="py-2 px-4 font-medium">WIN</th>
                <th className="py-2 px-4 font-medium">RED</th>
                <th className="py-2 px-4 font-medium">Acerto</th>
                <th className="py-2 px-4 font-medium">Lucro</th>
                <th className="py-2 pl-4 font-medium text-right">Banca final</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const s = dayStats(state.days[d], state.settings.initialBank);
                return (
                  <tr key={d} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2.5 pr-4 text-[var(--color-text)]">{formatDateBR(d)}</td>
                    <td className="py-2.5 px-4 text-[var(--color-primary)] tabular-nums">{s.wins}</td>
                    <td className="py-2.5 px-4 text-[var(--color-danger)] tabular-nums">{s.reds}</td>
                    <td className="py-2.5 px-4 text-[var(--color-text-dim)] tabular-nums">{s.hitRate.toFixed(0)}%</td>
                    <td className={`py-2.5 px-4 tabular-nums ${s.profit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]'}`}>
                      {s.profit >= 0 ? '+' : ''}{formatBRL(s.profit)}
                    </td>
                    <td className="py-2.5 pl-4 text-right text-[var(--color-text)] tabular-nums">{formatBRL(s.finalBank)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
