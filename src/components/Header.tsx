import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useTheme } from '../hooks/useTheme';
import { useModal } from '../context/ModalContext';
import { InfoModal } from './InfoModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

interface HeaderProps {
  onOpenDeck: () => void;
  onOpenCards: () => void;
}

// Barra superior: marca + cartas + deck + instalar (PWA) + sobre + idioma + tema.
export function Header({ onOpenDeck, onOpenCards }: HeaderProps) {
  const { t, lang, toggle: toggleLang } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const { open } = useModal();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setInstallEvent(null));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = () => {
    void installEvent?.prompt();
    setInstallEvent(null);
  };

  return (
    <header className="topbar">
      <span className="brand">Pokédex</span>
      <div className="topbar__controls">
        <button className="deck-open" type="button" onClick={onOpenCards}>
          {lang === 'pt' ? '🃟 Cartas' : '🃟 Cards'}
        </button>
        <button className="deck-open" type="button" onClick={onOpenDeck}>
          🃏 Deck
        </button>
        {installEvent && (
          <button className="install-btn" type="button" onClick={install}>
            {t('install')}
          </button>
        )}
        <button
          className="info-btn topbar-info"
          type="button"
          aria-label={t('infoAria')}
          onClick={() => open(<InfoModal />)}
        >
          ⓘ
        </button>
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
