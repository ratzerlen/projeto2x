import type { DayRecord, Entry, StoreState } from '@/types';

export const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const weekdayBR = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long' });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export interface DayStats {
  wins: number;
  reds: number;
  total: number;
  profit: number;
  hitRate: number;
  finalBank: number;
}

export function dayStats(day: DayRecord | undefined, initialBank: number): DayStats {
  const entries = day?.entries ?? [];
  const wins = entries.filter((e) => e.result === 'WIN').length;
  const reds = entries.filter((e) => e.result === 'RED').length;
  const profit = entries.reduce((sum, e) => sum + e.amount, 0);
  const total = entries.length;
  const hitRate = total > 0 ? (wins / total) * 100 : 0;
  return {
    wins,
    reds,
    total,
    profit,
    hitRate,
    finalBank: initialBank + profit,
  };
}

/** Running bank at a specific entry index within a day, starting from the bank carried into that day. */
export function bankAtEntry(entries: Entry[], index: number, startBank: number): number {
  return startBank + entries.slice(0, index + 1).reduce((s, e) => s + e.amount, 0);
}

/** Bank carried into a given date = initial bank + profit of all earlier days that have entries. */
export function bankBeforeDate(state: StoreState, date: string): number {
  const dates = Object.keys(state.days)
    .filter((d) => d < date)
    .sort();
  let bank = state.settings.initialBank;
  for (const d of dates) {
    bank += dayStats(state.days[d], state.settings.initialBank).profit;
  }
  return bank;
}

/** Total profit across all days. */
export function totalProfit(state: StoreState): number {
  return Object.values(state.days).reduce(
    (sum, day) => sum + dayStats(day, state.settings.initialBank).profit,
    0,
  );
}

/** Current bank = initial + all profits. */
export function currentBank(state: StoreState): number {
  return state.settings.initialBank + totalProfit(state);
}

/** Day number of the project (1-based) for a given date. */
export function projectDayNumber(startDate: string, date: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const target = new Date(date + 'T00:00:00');
  const diff = Math.floor((target.getTime() - start.getTime()) / 86400000);
  return diff + 1;
}

export function allDaysSorted(state: StoreState): string[] {
  return Object.keys(state.days).sort();
}
