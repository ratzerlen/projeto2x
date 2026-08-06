import {
  CalendarDays,
  Wallet,
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  Percent,
  Trophy,
  Coins,
  Sun,
} from 'lucide-react';
import type { StoreState } from '@/types';
import { Card, StatCard } from '@/components/Card';
import { dayStats, formatBRL, formatDateBR, weekdayBR, todayISO, projectDayNumber, currentBank, totalProfit, bankBeforeDate } from '@/lib/calc';

interface DashboardProps {
  state: StoreState;
}

export function Dashboard({ state }: DashboardProps) {
  const date = todayISO();
  const day = state.days[date];
  const stats = dayStats(day, state.settings.initialBank);
  const s = state.settings;

  const curBank = currentBank(state);
  const totProfit = totalProfit(state);
  const dayNum = projectDayNumber(s.startDate, date);
  const goalPct = s.dailyGoal > 0 ? Math.min((stats.profit / s.dailyGoal) * 100, 100) : 0;
  const bankIntoDay = bankBeforeDate(state, date);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Data" value={formatDateBR(date)} icon={<CalendarDays size={18} />} sub={weekdayBR(date)} />
        <StatCard label="Dia do projeto" value={`Dia ${dayNum}`} icon={<Sun size={18} />} tone="accent" />
        <StatCard label="Banca inicial" value={formatBRL(s.initialBank)} icon={<Wallet size={18} />} />
        <StatCard label="Banca atual" value={formatBRL(curBank)} icon={<Coins size={18} />} tone="positive" />
        <StatCard
          label="Lucro do dia"
          value={`${stats.profit >= 0 ? '+' : ''}${formatBRL(stats.profit)}`}
          icon={<TrendingUp size={18} />}
          tone={stats.profit >= 0 ? 'positive' : 'negative'}
        />
        <StatCard label="Lucro total" value={`${totProfit >= 0 ? '+' : ''}${formatBRL(totProfit)}`} icon={<TrendingUp size={18} />} tone={totProfit >= 0 ? 'positive' : 'negative'} />
        <StatCard label="Meta do dia" value={formatBRL(s.dailyGoal)} icon={<Target size={18} />} tone="accent" />
        <StatCard label="WIN" value={String(stats.wins)} icon={<CheckCircle2 size={18} />} tone="positive" />
        <StatCard label="RED" value={String(stats.reds)} icon={<XCircle size={18} />} tone="negative" />
        <StatCard label="Taxa de acerto" value={`${stats.hitRate.toFixed(0)}%`} icon={<Percent size={18} />} />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Target size={18} style={{ color: 'var(--color-primary)' }} /> Progresso da meta de hoje
          </h3>
          <span className="text-sm tabular-nums text-[var(--color-text-dim)]">
            {formatBRL(stats.profit)} / {formatBRL(s.dailyGoal)}
          </span>
        </div>
        <div className="h-3 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${goalPct}%`,
              background: goalPct >= 100 ? 'var(--color-primary)' : 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary))',
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-mute)]">
          {goalPct >= 100 ? 'Meta do dia atingida! Parabéns.' : `${goalPct.toFixed(0)}% da meta concluída`}
        </p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-[var(--color-text)]">
            <Trophy size={18} style={{ color: 'var(--color-primary)' }} /> Resumo de hoje
          </h3>
          <div className="space-y-2 text-sm">
            <Row label="Vitórias" value={`${stats.wins}`} tone="positive" />
            <Row label="Derrotas" value={`${stats.reds}`} tone="negative" />
            <Row label="Taxa de acerto" value={`${stats.hitRate.toFixed(0)}%`} />
            <Row label="Lucro" value={`${stats.profit >= 0 ? '+' : ''}${formatBRL(stats.profit)}`} tone={stats.profit >= 0 ? 'positive' : 'negative'} />
            <Row label="Banca atual" value={formatBRL(stats.finalBank)} />
            <Row label="Banca ao iniciar o dia" value={formatBRL(bankIntoDay)} />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-[var(--color-text)]">
            <Wallet size={18} style={{ color: 'var(--color-primary)' }} /> Visão geral
          </h3>
          <div className="space-y-2 text-sm">
            <Row label="Banca inicial" value={formatBRL(s.initialBank)} />
            <Row label="Banca atual" value={formatBRL(curBank)} tone="positive" />
            <Row label="Lucro total acumulado" value={`${totProfit >= 0 ? '+' : ''}${formatBRL(totProfit)}`} tone={totProfit >= 0 ? 'positive' : 'negative'} />
            <Row label="Meta diária" value={formatBRL(s.dailyGoal)} />
            <Row label="Dias registrados" value={String(Object.keys(state.days).length)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'positive' | 'negative' }) {
  const c = tone === 'positive' ? 'text-[var(--color-primary)]' : tone === 'negative' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[var(--color-text-dim)]">{label}</span>
      <span className={`font-semibold tabular-nums ${c}`}>{value}</span>
    </div>
  );
}
