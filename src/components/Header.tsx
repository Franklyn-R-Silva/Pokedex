import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useTheme } from '../hooks/useTheme';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { InfoModal } from './InfoModal';
import { AuthModal } from './auth/AuthModal';

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
  const { open, close } = useModal();
  const { enabled, user, signOut } = useAuth();
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
        {enabled &&
          (user ? (
            <button
              className="auth-btn"
              type="button"
              title={user.email ?? ''}
              onClick={() => void signOut()}
            >
              👤 {lang === 'pt' ? 'Sair' : 'Sign out'}
            </button>
          ) : (
            <button
              className="auth-btn"
              type="button"
              onClick={() => open(<AuthModal onDone={close} />)}
            >
              {lang === 'pt' ? 'Entrar' : 'Sign in'}
            </button>
          ))}
      </div>
    </header>
  );
}
