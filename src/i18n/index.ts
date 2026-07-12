import type { Lang } from '../types';
import { translations, type Translation } from './translations';

// Internacionalização (PT-BR / EN). A PokéAPI não tem português, então o
// conteúdo textual da API usa espanhol como aproximação no modo PT.

const LANG_KEY = 'pokedex-lang';

let currentLang: Lang = 'pt';

export function getLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang | null) ?? 'pt';
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
}

export function initLang(): Lang {
  currentLang = getLang();
  return currentLang;
}

/** Texto da UI para a chave no idioma atual (tipado por chave). */
export function t<K extends keyof Translation>(key: K): Translation[K] {
  return translations[currentLang][key];
}

/** Idioma do conteúdo da API (PT → espanhol como aproximação). */
export function contentLang(): 'es' | 'en' {
  return currentLang === 'pt' ? 'es' : 'en';
}
