import { useState, useEffect, useRef } from 'react';
import type { Theme } from '../services/storage';
import { useI18n } from '../i18n/I18nContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { InfoModal } from './InfoModal';
import { AuthModal } from './auth/AuthModal';
import logoUrl from '../assets/logo_pokedex.webp';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenDeck: () => void;
  onOpenCards: () => void;
  onOpenPokedex: () => void;
}

// Barra superior: marca + explorar + cartas + deck + conta + tema/idioma.
export function Header({ theme, onToggleTheme, onOpenDeck, onOpenCards, onOpenPokedex }: HeaderProps) {
  const { t, lang, toggle: toggleLang } = useI18n();
  const { open, close } = useModal();
  const { enabled, user, signOut } = useAuth();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  // Menu compacto no celular: as ações de navegação colapsam num dropdown.
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setInstallEvent(null));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  // Fecha o menu ao tocar fora ou apertar Esc (só quando aberto).
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const install = () => {
    void installEvent?.prompt();
    setInstallEvent(null);
  };

  // Executa a ação e fecha o menu mobile (uma seleção por vez).
  const pick = (fn: () => void) => () => {
    fn();
    setMenuOpen(false);
  };

  return (
    <header className="topbar">
      <img className="brand-logo" src={logoUrl} alt="Pokédex" width="120" height="34" />
      <div className="topbar__controls" ref={navRef}>
        <nav
          id="topbar-nav"
          className={`topbar__nav${menuOpen ? ' is-open' : ''}`}
          aria-label={lang === 'pt' ? 'Navegação' : 'Navigation'}
        >
          <button className="deck-open" type="button" onClick={pick(onOpenPokedex)}>
            {lang === 'pt' ? '🔎 Explorar' : '🔎 Explore'}
          </button>
          <button className="deck-open" type="button" onClick={pick(onOpenCards)}>
            {lang === 'pt' ? '🃟 Cartas' : '🃟 Cards'}
          </button>
          <button className="deck-open" type="button" onClick={pick(onOpenDeck)}>
            🃏 Deck
          </button>
          {installEvent && (
            <button className="install-btn" type="button" onClick={pick(install)}>
              {t('install')}
            </button>
          )}
          <button
            className="info-btn topbar-info"
            type="button"
            aria-label={t('infoAria')}
            onClick={pick(() => open(<InfoModal />))}
          >
            ⓘ
          </button>
          {enabled &&
            (user ? (
              <button
                className="auth-btn"
                type="button"
                title={user.email ?? ''}
                onClick={pick(() => void signOut())}
              >
                👤 {lang === 'pt' ? 'Sair' : 'Sign out'}
              </button>
            ) : (
              <button
                className="auth-btn"
                type="button"
                onClick={pick(() => open(<AuthModal onDone={close} />))}
              >
                {lang === 'pt' ? 'Entrar' : 'Sign in'}
              </button>
            ))}
        </nav>
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
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          className="topbar__menu-btn"
          type="button"
          aria-label={lang === 'pt' ? 'Menu' : 'Menu'}
          aria-controls="topbar-nav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
