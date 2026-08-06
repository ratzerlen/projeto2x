import { useEffect } from 'react';
import type { ThemeMode } from '@/types';

const themes: Record<ThemeMode, { primary: string; primaryDark: string; soft: string }> = {
  green: { primary: '#22c55e', primaryDark: '#16a34a', soft: '#22c55e22' },
  blue: { primary: '#3b82f6', primaryDark: '#2563eb', soft: '#3b82f622' },
  amber: { primary: '#f59e0b', primaryDark: '#d97706', soft: '#f59e0b22' },
};

export function useTheme(theme: ThemeMode) {
  useEffect(() => {
    const t = themes[theme] ?? themes.green;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', t.primary);
    root.style.setProperty('--color-primary-dark', t.primaryDark);
    root.style.setProperty('--color-primary-soft', t.soft);
  }, [theme]);
}
