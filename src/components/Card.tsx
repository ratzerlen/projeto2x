import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`card glass ${className}`}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: 'default' | 'positive' | 'negative' | 'accent';
  sub?: string;
}

export function StatCard({ label, value, icon, tone = 'default', sub }: StatCardProps) {
  const toneClass =
    tone === 'positive'
      ? 'text-[var(--color-primary)]'
      : tone === 'negative'
        ? 'text-[var(--color-danger)]'
        : tone === 'accent'
          ? 'text-[var(--color-warning)]'
          : 'text-[var(--color-text)]';

  return (
    <Card className="p-4 sm:p-5 animate-fade-in relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[var(--color-text-dim)] font-medium truncate">
            {label}
          </p>
          <p className={`mt-2 text-xl sm:text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-[var(--color-text-mute)] truncate">{sub}</p>}
        </div>
        {icon && (
          <div
            className="shrink-0 w-9 h-9 rounded-xl grid place-items-center"
            style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
