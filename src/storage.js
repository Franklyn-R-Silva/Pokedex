// Persistência em localStorage: tema (claro/escuro) e Pokémon favoritos.

const THEME_KEY = 'pokedex-theme';
const FAVORITES_KEY = 'pokedex-favorites';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) ?? 'light';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
}

export function isFavorite(id) {
  return getFavorites().some((favorite) => favorite.id === id);
}

/**
 * Alterna um Pokémon nos favoritos.
 * @param {{id: number, name: string}} pokemon
 * @returns {Array<{id: number, name: string}>} lista atualizada.
 */
export function toggleFavorite(pokemon) {
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
