// Internacionalização (PT-BR / EN) para o texto da interface.
//
// A PokéAPI não oferece português para descrição, genus, habilidades e tipos.
// Estratégia: a interface e os tipos têm tradução real em PT; o conteúdo textual
// da API (descrição/genus/habilidades) usa espanhol como aproximação no modo PT.

const LANG_KEY = 'pokedex-lang';

export const translations = {
  pt: {
    random: '🎲 Aleatório',
    shiny: '✨ Shiny',
    cry: '🔊 Som',
    share: '🔗 Compartilhar',
    copied: '✅ Copiado!',
    weaknesses: 'Fraquezas',
    stats: 'Stats',
    abilities: 'Habilidades',
    evolution: 'Evolução',
    height: 'Altura',
    weight: 'Peso',
    favorite: '☆ Favoritar',
    favorited: '★ Favoritado',
    favoritesTitle: '⭐ Favoritos',
    noFavorites: 'Nenhum favorito ainda',
    loading: 'Carregando...',
    notFound: 'Não encontrado :c',
    connError: 'Erro de conexão :c',
    noEvolutions: 'Sem evoluções',
    none: 'Nenhuma',
    searchPlaceholder: 'Nome ou número',
    themeDark: 'Tema escuro',
    themeLight: 'Tema claro',
    noGif: 'Sem GIF animado para este Pokémon',
    hiddenAbility: 'Habilidade oculta',
    removeFavorite: 'Remover dos favoritos',
    exploreTitle: '🔎 Explorar',
    allTypes: 'Todos os tipos',
    allGens: 'Todas as gerações',
    noResults: 'Nada encontrado',
    compareTitle: '⚔️ Comparar',
    compareButton: 'Comparar',
    comparePlaceholderA: '1º Pokémon',
    comparePlaceholderB: '2º Pokémon',
    total: 'Total',
    filterTypeLabel: 'Tipo',
    filterGenLabel: 'Geração',
    statsLegendAria: 'O que significa cada atributo',
    statLabels: {
      hp: 'HP',
      attack: 'ATQ',
      defense: 'DEF',
      'special-attack': 'AT.E',
      'special-defense': 'DF.E',
      speed: 'VEL',
    },
    statNames: {
      hp: 'Vida',
      attack: 'Ataque',
      defense: 'Defesa',
      'special-attack': 'Ataque Especial',
      'special-defense': 'Defesa Especial',
      speed: 'Velocidade',
    },
  },
  en: {
    random: '🎲 Random',
    shiny: '✨ Shiny',
    cry: '🔊 Cry',
    share: '🔗 Share',
    copied: '✅ Copied!',
    weaknesses: 'Weaknesses',
    stats: 'Stats',
    abilities: 'Abilities',
    evolution: 'Evolution',
    height: 'Height',
    weight: 'Weight',
    favorite: '☆ Favorite',
    favorited: '★ Favorited',
    favoritesTitle: '⭐ Favorites',
    noFavorites: 'No favorites yet',
    loading: 'Loading...',
    notFound: 'Not found :c',
    connError: 'Connection error :c',
    noEvolutions: 'No evolutions',
    none: 'None',
    searchPlaceholder: 'Name or number',
    themeDark: 'Dark theme',
    themeLight: 'Light theme',
    noGif: 'No animated GIF for this Pokémon',
    hiddenAbility: 'Hidden ability',
    removeFavorite: 'Remove from favorites',
    exploreTitle: '🔎 Explore',
    allTypes: 'All types',
    allGens: 'All generations',
    noResults: 'Nothing found',
    compareTitle: '⚔️ Compare',
    compareButton: 'Compare',
    comparePlaceholderA: '1st Pokémon',
    comparePlaceholderB: '2nd Pokémon',
    total: 'Total',
    filterTypeLabel: 'Type',
    filterGenLabel: 'Generation',
    statsLegendAria: 'What each stat means',
    statLabels: {
      hp: 'HP',
      attack: 'ATK',
      defense: 'DEF',
      'special-attack': 'SpA',
      'special-defense': 'SpD',
      speed: 'Spe',
    },
    statNames: {
      hp: 'Hit Points',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Special Attack',
      'special-defense': 'Special Defense',
      speed: 'Speed',
    },
  },
};

let currentLang = 'pt';

export function getLang() {
  return localStorage.getItem(LANG_KEY) ?? 'pt';
}

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
}

export function initLang() {
  currentLang = getLang();
  return currentLang;
}

/** Texto da UI para a chave no idioma atual. */
export function t(key) {
  return translations[currentLang][key];
}

/**
 * Idioma para o conteúdo textual da API (descrição/genus/habilidades).
 * PT não existe na PokéAPI, então usamos espanhol como aproximação.
 */
export function contentLang() {
  return currentLang === 'pt' ? 'es' : 'en';
}
