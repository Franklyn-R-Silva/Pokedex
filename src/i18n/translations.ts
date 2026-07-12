import type { Lang } from '../types';

export type StatKey = 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';

export type StatMap = Record<StatKey, string>;

export interface Translation {
  random: string;
  shiny: string;
  cry: string;
  share: string;
  copied: string;
  weaknesses: string;
  stats: string;
  abilities: string;
  evolution: string;
  height: string;
  weight: string;
  favorite: string;
  favorited: string;
  favoritesTitle: string;
  noFavorites: string;
  loading: string;
  notFound: string;
  connError: string;
  noEvolutions: string;
  none: string;
  searchPlaceholder: string;
  themeDark: string;
  themeLight: string;
  noGif: string;
  hiddenAbility: string;
  removeFavorite: string;
  exploreTitle: string;
  allTypes: string;
  allGens: string;
  noResults: string;
  compareTitle: string;
  comparePlaceholder: string;
  compareAddAria: string;
  compareHint: string;
  compareRemoveAria: string;
  total: string;
  filterTypeLabel: string;
  filterGenLabel: string;
  filterByType: string;
  statsLegendAria: string;
  about: string;
  heldItems: string;
  moves: string;
  locations: string;
  baseExp: string;
  captureRate: string;
  happiness: string;
  growth: string;
  gender: string;
  eggGroups: string;
  hatch: string;
  generation: string;
  habitat: string;
  genderless: string;
  legendary: string;
  mythical: string;
  baby: string;
  moveLevel: string;
  moveMachine: string;
  moveEgg: string;
  moveTutor: string;
  showMoves: string;
  noLocations: string;
  statLabels: StatMap;
  statNames: StatMap;
}

export const translations: Record<Lang, Translation> = {
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
    comparePlaceholder: 'Adicionar Pokémon',
    compareAddAria: 'Adicionar Pokémon',
    compareHint: 'Adicione pelo menos 2 Pokémon (até 4).',
    compareRemoveAria: 'Remover',
    total: 'Total',
    filterTypeLabel: 'Tipo',
    filterGenLabel: 'Geração',
    filterByType: 'Filtrar por este tipo',
    statsLegendAria: 'O que significa cada atributo',
    about: 'Sobre',
    heldItems: 'Itens segurados',
    moves: 'Golpes',
    locations: 'Onde encontrar',
    baseExp: 'XP base',
    captureRate: 'Captura',
    happiness: 'Felicidade',
    growth: 'Crescimento',
    gender: 'Gênero',
    eggGroups: 'Grupos de ovo',
    hatch: 'Ciclos de choco',
    generation: 'Geração',
    habitat: 'Habitat',
    genderless: 'Sem gênero',
    legendary: 'Lendário',
    mythical: 'Mítico',
    baby: 'Bebê',
    moveLevel: 'Por nível',
    moveMachine: 'MT/MO',
    moveEgg: 'Ovo',
    moveTutor: 'Tutor',
    showMoves: 'Ver golpes',
    noLocations: 'Indisponível na natureza',
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
    comparePlaceholder: 'Add Pokémon',
    compareAddAria: 'Add Pokémon',
    compareHint: 'Add at least 2 Pokémon (up to 4).',
    compareRemoveAria: 'Remove',
    total: 'Total',
    filterTypeLabel: 'Type',
    filterGenLabel: 'Generation',
    filterByType: 'Filter by this type',
    statsLegendAria: 'What each stat means',
    about: 'About',
    heldItems: 'Held items',
    moves: 'Moves',
    locations: 'Where to find',
    baseExp: 'Base XP',
    captureRate: 'Capture',
    happiness: 'Happiness',
    growth: 'Growth',
    gender: 'Gender',
    eggGroups: 'Egg groups',
    hatch: 'Hatch cycles',
    generation: 'Generation',
    habitat: 'Habitat',
    genderless: 'Genderless',
    legendary: 'Legendary',
    mythical: 'Mythical',
    baby: 'Baby',
    moveLevel: 'By level',
    moveMachine: 'TM/HM',
    moveEgg: 'Egg',
    moveTutor: 'Tutor',
    showMoves: 'Show moves',
    noLocations: 'Not found in the wild',
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
