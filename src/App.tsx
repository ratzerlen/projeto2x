import { useState } from 'react';
import { LayoutDashboard, ClipboardList, BarChart3, CalendarDays, History, Settings as SettingsIcon, Plane } from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/lib/theme';
import { Dashboard } from '@/pages/Dashboard';
import { Painel } from '@/pages/Painel';
import { Statistics } from '@/pages/Statistics';
import { Calendar } from '@/pages/Calendar';
import { History as HistoryPage } from '@/pages/History';
import { Settings } from '@/pages/Settings';
import { todayISO } from '@/lib/calc';

type Tab = 'dashboard' | 'painel' | 'stats' | 'calendar' | 'history' | 'settings';

const NAV: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'painel', label: 'Painel', icon: ClipboardList },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { id: 'calendar', label: 'Calendário', icon: CalendarDays },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'settings', label: 'Configurações', icon: SettingsIcon },
];

function App() {
  const store = useStore();
  useTheme(store.state.settings.theme);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const openDay = (d: string) => {
    setSelectedDate(d);
    setTab('painel');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-[var(--color-primary)] text-black">
              <Plane size={20} />
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-[var(--color-text)] text-base sm:text-lg">{store.state.settings.projectName}</h1>
              <p className="text-[11px] text-[var(--color-text-mute)] hidden sm:block">Painel de Gerenciamento de Banca</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  tab === n.id
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <n.icon size={16} /> {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-24 md:pb-7">
        {tab === 'dashboard' && <Dashboard state={store.state} />}
        {tab === 'painel' && <Painel store={store} date={selectedDate} onDateChange={setSelectedDate} />}
        {tab === 'stats' && <Statistics state={store.state} />}
        {tab === 'calendar' && <Calendar state={store.state} />}
        {tab === 'history' && <HistoryPage store={store} onOpenDay={openDay} />}
        {tab === 'settings' && <Settings store={store} />}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="grid grid-cols-6">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                tab === n.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-mute)]'
              }`}
            >
              <n.icon size={20} />
              {n.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
