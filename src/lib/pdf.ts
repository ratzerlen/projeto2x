import type { StoreState, DayRecord } from '@/types';
import { dayStats, formatBRL, formatDateBR, weekdayBR } from '@/lib/calc';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function exportDayPDF(state: StoreState, date: string) {
  const day = state.days[date];
  if (!day) return;
  const stats = dayStats(day, state.settings.initialBank);
  const s = state.settings;

  const rows = day.entries
    .map((e, i) => {
      const bank =
        s.initialBank +
        day.entries.slice(0, i + 1).reduce((sum, x) => sum + x.amount, 0);
      return `<tr>
        <td>${esc(e.time)}</td>
        <td class="${e.result === 'WIN' ? 'win' : 'red'}">${e.result === 'WIN' ? '✅ WIN' : '❌ RED'}</td>
        <td class="${e.amount >= 0 ? 'win' : 'red'}">${e.amount >= 0 ? '+' : ''}${formatBRL(e.amount)}</td>
        <td>${formatBRL(bank)}</td>
        <td>${esc(e.note ?? '')}</td>
      </tr>`;
    })
    .join('');

  const disc = [
    ['Fiz apenas as entradas programadas', day.discipline.onlyPlanned],
    ['Não tentei recuperar perdas', day.discipline.noRecovery],
    ['Não aumentei o valor da entrada', day.discipline.noIncrease],
    ['Encerrei o dia conforme o plano', day.discipline.closedDay],
  ]
    .map(
      ([label, ok]) =>
        `<li>${ok ? '✅' : '⬜'} ${esc(label as string)}</li>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(s.projectName)} - ${formatDateBR(date)}</title>
  <style>
    * { font-family: 'Helvetica Neue', Arial, sans-serif; }
    body { background: #0a0c0a; color: #f1f5f0; padding: 32px; margin: 0; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 26px; font-weight: 800; color: #22c55e; }
    .date { color: #9aa89a; font-size: 14px; }
    .grid { display:grid; grid-template-columns: repeat(4,1fr); gap:12px; margin-bottom:24px; }
    .stat { background:#131713; border:1px solid #2a322a; border-radius:12px; padding:14px; }
    .stat .l { font-size:11px; text-transform:uppercase; color:#9aa89a; letter-spacing:1px; }
    .stat .v { font-size:20px; font-weight:700; margin-top:6px; }
    .win { color:#22c55e; }
    .red { color:#ef4444; }
    table { width:100%; border-collapse:collapse; margin-bottom:24px; }
    th { text-align:left; font-size:11px; text-transform:uppercase; color:#9aa89a; border-bottom:1px solid #2a322a; padding:10px 8px; }
    td { padding:10px 8px; border-bottom:1px solid #1b211b; font-size:14px; }
    .section { background:#131713; border:1px solid #2a322a; border-radius:12px; padding:18px; margin-bottom:16px; }
    .section h3 { margin:0 0 12px; font-size:15px; color:#22c55e; }
    ul { list-style:none; padding:0; margin:0; }
    li { padding:6px 0; font-size:14px; }
    .obs { white-space:pre-wrap; font-size:14px; color:#cfd8cf; }
    .footer { margin-top:24px; text-align:center; color:#5f6b5f; font-size:12px; }
  </style></head><body>
    <div class="header">
      <div>
        <div class="title">${esc(s.projectName)}</div>
        <div class="date">${formatDateBR(date)} · ${esc(weekdayBR(date))}</div>
      </div>
      <div style="text-align:right">
        <div class="date">Banca Inicial</div>
        <div style="font-size:18px;font-weight:700">${formatBRL(s.initialBank)}</div>
      </div>
    </div>
    <div class="grid">
      <div class="stat"><div class="l">Vitórias</div><div class="v win">${stats.wins}</div></div>
      <div class="stat"><div class="l">Derrotas</div><div class="v red">${stats.reds}</div></div>
      <div class="stat"><div class="l">Taxa de acerto</div><div class="v">${stats.hitRate.toFixed(0)}%</div></div>
      <div class="stat"><div class="l">Lucro do dia</div><div class="v ${stats.profit >= 0 ? 'win' : 'red'}">${stats.profit >= 0 ? '+' : ''}${formatBRL(stats.profit)}</div></div>
    </div>
    <div class="grid">
      <div class="stat"><div class="l">Entradas</div><div class="v">${stats.total}</div></div>
      <div class="stat"><div class="l">Banca atual</div><div class="v">${formatBRL(stats.finalBank)}</div></div>
      <div class="stat"><div class="l">Meta do dia</div><div class="v">${formatBRL(s.dailyGoal)}</div></div>
      <div class="stat"><div class="l">Status</div><div class="v ${stats.profit >= s.dailyGoal ? 'win' : 'red'}">${stats.profit >= s.dailyGoal ? 'Meta atingida' : 'Em andamento'}</div></div>
    </div>
    <div class="section">
      <h3>Entradas</h3>
      <table>
        <thead><tr><th>Horário</th><th>Resultado</th><th>Valor</th><th>Banca</th><th>Observação</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#5f6b5f">Nenhuma entrada</td></tr>'}</tbody>
      </table>
    </div>
    <div class="section">
      <h3>Disciplina</h3>
      <ul>${disc}</ul>
    </div>
    ${day.observation ? `<div class="section"><h3>Observações</h3><div class="obs">${esc(day.observation)}</div></div>` : ''}
    <div class="footer">${esc(s.projectName)} · Gerado em ${new Date().toLocaleString('pt-BR')}</div>
  </body></html>`;

  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 400);
}
