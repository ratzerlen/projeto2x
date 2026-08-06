import { useMemo } from 'react';
import { formatBRL } from '@/lib/calc';

interface Point {
  label: string;
  value: number;
}

interface LineChartProps {
  data: Point[];
  height?: number;
  format?: (n: number) => string;
  color?: string;
}

export function LineChart({ data, height = 200, format = (n) => String(n), color }: LineChartProps) {
  const stroke = color ?? 'var(--color-primary)';
  const width = 600;
  const padX = 36;
  const padY = 24;

  const { path, area, points, min, max, labels } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', area: '', points: [] as { x: number; y: number; v: number; l: string }[], min: 0, max: 0, labels: [] as string[] };
    }
    const vals = data.map((d) => d.value);
    let mn = Math.min(...vals);
    let mx = Math.max(...vals);
    if (mn === mx) {
      mn = mn - 1;
      mx = mx + 1;
    }
    const range = mx - mn;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    const pts = data.map((d, i) => {
      const x = padX + i * step;
      const y = padY + innerH - ((d.value - mn) / range) * innerH;
      return { x, y, v: d.value, l: d.label };
    });

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${height - padY} L ${pts[0].x.toFixed(1)} ${height - padY} Z`;

    return { path: linePath, area: areaPath, points: pts, min: mn, max: mx, labels: data.map((d) => d.label) };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="h-[200px] grid place-items-center text-sm text-[var(--color-text-mute)]">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => {
          const y = padY + (height - padY * 2) * t;
          const val = max - (max - min) * t;
          return (
            <g key={t}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 4" />
              <text x={4} y={y + 3} fontSize="9" fill="var(--color-text-mute)">
                {format(val)}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#lineFill)" />
        <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={stroke} stroke="var(--color-bg)" strokeWidth="2" />
            <text x={p.x} y={height - 6} fontSize="9" fill="var(--color-text-mute)" textAnchor="middle">
              {p.l}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: Point[];
  height?: number;
  format?: (n: number) => string;
}

export function BarChart({ data, height = 200, format = (n) => String(n) }: BarChartProps) {
  const width = 600;
  const padX = 36;
  const padY = 24;

  if (data.length === 0) {
    return (
      <div className="h-[200px] grid place-items-center text-sm text-[var(--color-text-mute)]">
        Sem dados para exibir
      </div>
    );
  }

  const vals = data.map((d) => d.value);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const barW = data.length > 1 ? Math.min(innerW / data.length - 8, 48) : innerW * 0.5;
  const gap = (innerW - barW * data.length) / Math.max(data.length - 1, 1);
  const zeroY = padY + innerH - ((0 - min) / range) * innerH;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <line x1={padX} y1={zeroY} x2={width - padX} y2={zeroY} stroke="var(--color-border)" strokeWidth="1" />
        {data.map((d, i) => {
          const x = padX + i * (barW + gap);
          const v = d.value;
          const y = v >= 0 ? padY + innerH - ((v - min) / range) * innerH : zeroY;
          const h = Math.abs(((v) / range) * innerH);
          const fill = v >= 0 ? 'var(--color-primary)' : 'var(--color-danger)';
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={Math.max(h, 1)} rx="4" fill={fill} opacity="0.9" />
              <text x={x + barW / 2} y={height - 6} fontSize="9" fill="var(--color-text-mute)" textAnchor="middle">
                {d.label}
              </text>
              <text x={x + barW / 2} y={y - 4} fontSize="9" fill="var(--color-text-dim)" textAnchor="middle">
                {format(v)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface DonutProps {
  wins: number;
  reds: number;
}

export function DonutChart({ wins, reds }: DonutProps) {
  const total = wins + reds;
  const r = 70;
  const c = 2 * Math.PI * r;
  const winPct = total > 0 ? wins / total : 0;
  const redPct = total > 0 ? reds / total : 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" className="w-40 h-40 -rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="18" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="18"
          strokeDasharray={`${c * winPct} ${c}`}
          strokeLinecap="round"
        />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="var(--color-danger)"
          strokeWidth="18"
          strokeDasharray={`${c * redPct} ${c}`}
          strokeDashoffset={`${-c * winPct}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
          <span className="text-sm text-[var(--color-text-dim)]">WIN: {wins}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--color-danger)]" />
          <span className="text-sm text-[var(--color-text-dim)]">RED: {reds}</span>
        </div>
        <p className="text-2xl font-bold tabular-nums text-[var(--color-text)]">
          {total > 0 ? Math.round((wins / total) * 100) : 0}%
        </p>
      </div>
    </div>
  );
}

export { formatBRL };
