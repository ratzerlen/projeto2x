export type EntryResult = 'WIN' | 'RED';

export interface Entry {
  id: string;
  time: string; // HH:MM
  result: EntryResult;
  amount: number; // positive for win, negative for red
  note?: string;
  createdAt: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  entries: Entry[];
  discipline: {
    onlyPlanned: boolean;
    noRecovery: boolean;
    noIncrease: boolean;
    closedDay: boolean;
  };
  observation: string;
}

export type ThemeMode = 'green' | 'blue' | 'amber';

export interface Settings {
  projectName: string;
  initialBank: number;
  dailyGoal: number;
  theme: ThemeMode;
  startDate: string; // YYYY-MM-DD, day 1 of project
}

export interface StoreState {
  settings: Settings;
  days: Record<string, DayRecord>; // keyed by date
}
