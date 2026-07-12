import type { Favorite } from '../types';

// Persistência em localStorage: tema (claro/escuro) e Pokémon favoritos.

const THEME_KEY = 'pokedex-theme';
const FAVORITES_KEY = 'pokedex-favorites';

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'light';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function getFavorites(): Favorite[] {
  try {
    return (JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? 'null') as Favorite[] | null) ?? [];
  } catch {
    return [];
  }
}

function saveFavorites(list: Favorite[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
}

export function isFavorite(id: number): boolean {
  return getFavorites().some((favorite) => favorite.id === id);
}

/** Alterna um Pokémon nos favoritos e devolve a lista atualizada. */
export function toggleFavorite(pokemon: Favorite): Favorite[] {
  const list = getFavorites();
  const index = list.findIndex((favorite) => favorite.id === pokemon.id);

  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push({ id: pokemon.id, name: pokemon.name });
  }

  saveFavorites(list);
  return list;
}
