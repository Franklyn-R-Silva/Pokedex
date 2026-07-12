import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Favorite } from '../types';
import { getFavorites, toggleFavorite as toggleStore } from '../services/storage';

interface FavoritesValue {
  favorites: Favorite[];
  toggle: (fav: Favorite) => void;
  isFav: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

// Favoritos compartilhados entre o painel e o botão do card (localStorage).
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>(() => getFavorites());

  const toggle = useCallback((fav: Favorite) => setFavorites(toggleStore(fav)), []);
  const isFav = useCallback((id: number) => favorites.some((f) => f.id === id), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFav }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  return ctx;
}
