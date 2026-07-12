import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nProvider } from './i18n/I18nContext';
import { ModalProvider } from './context/ModalContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import './styles/index.css';

// Sem StrictMode: os módulos vanilla reaproveitados (setup*) manipulam o DOM
// de forma imperativa e não gostam do duplo-mount de efeitos do StrictMode.
createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <AuthProvider>
      <FavoritesProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </FavoritesProvider>
    </AuthProvider>
  </I18nProvider>,
);
