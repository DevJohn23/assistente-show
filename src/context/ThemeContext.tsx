'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';
interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: ThemePreference) => void;
}
const STORAGE_KEY = 'assistente_show_theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const theme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') setPreference(saved);
    } catch { /* Preferences remain usable when browser storage is unavailable. */ }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSystemTheme(media.matches ? 'dark' : 'light');
    sync();
    media.addEventListener('change', sync);
    setMounted(true);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
    try { localStorage.setItem(STORAGE_KEY, preference); } catch { /* Optional persistence. */ }
  }, [theme, preference, mounted]);

  return <ThemeContext.Provider value={{ theme, preference, setTheme: setPreference,
    toggleTheme: () => setPreference(theme === 'dark' ? 'light' : 'dark') }}>
    {children}
  </ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
};
