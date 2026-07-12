import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Lang } from '../types';
import { getLang, setLang as setLangModule, initLang, t } from './index';

interface I18nValue {
  lang: Lang;
  t: typeof t;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => initLang());

  const setLang = useCallback((next: Lang) => {
    setLangModule(next);
    setLangState(next);
    document.documentElement.lang = next === 'pt' ? 'pt-br' : 'en';
  }, []);

  const toggle = useCallback(() => setLang(getLang() === 'pt' ? 'en' : 'pt'), [setLang]);

  return (
    <I18nContext.Provider value={{ lang, t, setLang, toggle }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n deve ser usado dentro de I18nProvider');
  return ctx;
}
