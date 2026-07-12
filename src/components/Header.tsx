import { useI18n } from '../i18n/I18nContext';
import { useTheme } from '../hooks/useTheme';

// Barra superior: marca + alternadores de idioma e tema.
export function Header() {
  const { lang, toggle: toggleLang } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <span className="brand">Pokédex</span>
      <div className="topbar__controls">
        <button
          className="lang-toggle"
          type="button"
          aria-label="Idioma / Language"
          onClick={toggleLang}
        >
          {lang === 'pt' ? 'PT' : 'EN'}
        </button>
        <button
          className="theme-toggle"
          type="button"
          aria-label="Tema escuro"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
