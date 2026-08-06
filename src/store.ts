import { useEffect, useState, useCallback } from 'react';
import type { StoreState, DayRecord, Entry, Settings } from '@/types';

const STORAGE_KEY = 'projeto-2x:v1';

const today = () => new Date().toISOString().slice(0, 10);

const defaultState: StoreState = {
  settings: {
    projectName: 'Projeto 2X',
    initialBank: 100,
    dailyGoal: 20,
    theme: 'green',
    startDate: today(),
  },
  days: {},
};

function load(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as StoreState;
    return {
      settings: { ...defaultState.settings, ...parsed.settings },
      days: parsed.days ?? {},
    };
  } catch {
    return defaultState;
  }
}

function ensureDay(days: StoreState['days'], date: string): DayRecord {
  if (!days[date]) {
    days[date] = {
      date,
      entries: [],
      discipline: {
        onlyPlanned: false,
        noRecovery: false,
        noIncrease: false,
        closedDay: false,
      },
      observation: '',
    };
  }
  return days[date];
}

export function useStore() {
  const [state, setState] = useState<StoreState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const addEntry = useCallback((date: string, entry: Omit<Entry, 'id' | 'createdAt'>) => {
    setState((s) => {
      const days = { ...s.days };
      const day = ensureDay(days, date);
      days[date] = {
        ...day,
        entries: [...day.entries, { ...entry, id: crypto.randomUUID(), createdAt: Date.now() }],
      };
      return { ...s, days };
    });
  }, []);

  const updateEntry = useCallback((date: string, id: string, patch: Partial<Entry>) => {
    setState((s) => {
      const days = { ...s.days };
      const day = days[date];
      if (!day) return s;
      days[date] = {
        ...day,
        entries: day.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      };
      return { ...s, days };
    });
  }, []);

  const deleteEntry = useCallback((date: string, id: string) => {
    setState((s) => {
      const days = { ...s.days };
      const day = days[date];
      if (!day) return s;
      days[date] = { ...day, entries: day.entries.filter((e) => e.id !== id) };
      return { ...s, days };
    });
  }, []);

  const setDiscipline = useCallback((date: string, patch: Partial<DayRecord['discipline']>) => {
    setState((s) => {
      const days = { ...s.days };
      const day = ensureDay(days, date);
      days[date] = { ...day, discipline: { ...day.discipline, ...patch } };
      return { ...s, days };
    });
  }, []);

  const setObservation = useCallback((date: string, observation: string) => {
    setState((s) => {
      const days = { ...s.days };
      const day = ensureDay(days, date);
      days[date] = { ...day, observation };
      return { ...s, days };
    });
  }, []);

  const deleteDay = useCallback((date: string) => {
    setState((s) => {
      const days = { ...s.days };
      delete days[date];
      return { ...s, days };
    });
  }, []);

  return {
    state,
    updateSettings,
    addEntry,
    updateEntry,
    deleteEntry,
    setDiscipline,
    setObservation,
    deleteDay,
  };
}

export type Store = ReturnType<typeof useStore>;
