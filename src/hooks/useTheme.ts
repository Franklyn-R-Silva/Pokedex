import { useState, useEffect, useCallback } from 'react';
import { getTheme, setTheme as persist } from '../services/storage';
import type { Theme } from '../services/storage';

// Tema claro/escuro: mantém a classe .dark no <html> e persiste no localStorage.
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      persist(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
