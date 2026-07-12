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
  sortByNumber: string;
  sortByName: string;
  loadMore: string;
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
  resistances: string;
  immunities: string;
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
  moveSearch: string;
  moveNoResults: string;
  noLocations: string;
  forms: string;
  evYield: string;
  infoAria: string;
  infoTitle: string;
  infoData: string;
  infoTranslate: string;
  infoShortcut: string;
  install: string;
  teamTitle: string;
  teamPlaceholder: string;
  teamWeaknesses: string;
  teamEmpty: string;
  battleButton: string;
  battleTitle: string;
  battlePickYou: string;
  battlePickFoe: string;
  battleNeedTwo: string;
  battleYourTurn: string;
  battleSuper: string;
  battleWeak: string;
  battleImmune: string;
  battleFainted: string;
  battleWins: string;
  battleAgain: string;
  battleSwap: string;
  battleYou: string;
  battleFoe: string;
  cards: string;
  cardsNone: string;
  cardsHint: string;
  quizTitle: string;
  quizNext: string;
  quizScore: string;
  movePower: string;
  moveAccuracy: string;
  movePp: string;
  moveCategory: string;
  physical: string;
  special: string;
  status: string;
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
    sortByNumber: 'Nº',
    sortByName: 'A–Z',
    loadMore: 'Carregar mais',
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
    resistances: 'Resistências',
    immunities: 'Imunidades',
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
    moveSearch: 'Filtrar golpes…',
    moveNoResults: 'Nenhum golpe encontrado',
    noLocations: 'Indisponível na natureza',
    forms: 'Formas',
    evYield: 'Rende EV',
    infoAria: 'Sobre o projeto',
    infoTitle: 'Sobre esta Pokédex',
    infoData: 'Dados fornecidos pela PokéAPI.',
    infoTranslate: 'Os textos em português são traduzidos automaticamente (a PokéAPI não tem PT).',
    infoShortcut: 'Dica: tecle "/" para buscar e ←/→ para navegar.',
    install: '⬇ Instalar',
    teamTitle: '🛡️ Meu time',
    teamPlaceholder: 'Adicionar ao time',
    teamWeaknesses: 'Fraquezas do time',
    teamEmpty: 'Monte um time de até 6',
    battleButton: '⚔️ Batalhar',
    battleTitle: '⚔️ Batalha',
    battlePickYou: 'Escolha o seu Pokémon',
    battlePickFoe: 'Escolha o oponente',
    battleNeedTwo: 'Adicione ao menos 2 Pokémon ao time para batalhar.',
    battleYourTurn: 'Escolha um ataque',
    battleSuper: 'Super eficaz!',
    battleWeak: 'Pouco eficaz…',
    battleImmune: 'Não teve efeito.',
    battleFainted: 'desmaiou!',
    battleWins: 'venceu!',
    battleAgain: 'Jogar de novo',
    battleSwap: 'Trocar Pokémon',
    battleYou: 'Você',
    battleFoe: 'Oponente',
    cards: 'Cartas',
    cardsNone: 'Nenhuma carta encontrada para este Pokémon.',
    cardsHint: 'Cartas do TCG · clique para ampliar',
    quizTitle: '❓ Quem é esse Pokémon?',
    quizNext: 'Próximo',
    quizScore: 'Placar',
    movePower: 'Poder',
    moveAccuracy: 'Precisão',
    movePp: 'PP',
    moveCategory: 'Categoria',
    physical: 'Físico',
    special: 'Especial',
    status: 'Status',
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
    sortByNumber: '#',
    sortByName: 'A–Z',
    loadMore: 'Load more',
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
    resistances: 'Resistances',
    immunities: 'Immunities',
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
    moveSearch: 'Filter moves…',
    moveNoResults: 'No moves found',
    noLocations: 'Not found in the wild',
    forms: 'Forms',
    evYield: 'EV yield',
    infoAria: 'About the project',
    infoTitle: 'About this Pokédex',
    infoData: 'Data provided by the PokéAPI.',
    infoTranslate: 'Portuguese text is machine-translated (the PokéAPI has no PT).',
    infoShortcut: 'Tip: press "/" to search and ←/→ to navigate.',
    install: '⬇ Install',
    teamTitle: '🛡️ My team',
    teamPlaceholder: 'Add to team',
    teamWeaknesses: 'Team weaknesses',
    teamEmpty: 'Build a team of up to 6',
    battleButton: '⚔️ Battle',
    battleTitle: '⚔️ Battle',
    battlePickYou: 'Choose your Pokémon',
    battlePickFoe: 'Choose the opponent',
    battleNeedTwo: 'Add at least 2 Pokémon to your team to battle.',
    battleYourTurn: 'Choose an attack',
    battleSuper: 'Super effective!',
    battleWeak: 'Not very effective…',
    battleImmune: 'It had no effect.',
    battleFainted: 'fainted!',
    battleWins: 'wins!',
    battleAgain: 'Play again',
    battleSwap: 'Change Pokémon',
    battleYou: 'You',
    battleFoe: 'Opponent',
    cards: 'Cards',
    cardsNone: 'No cards found for this Pokémon.',
    cardsHint: 'TCG cards · click to enlarge',
    quizTitle: "❓ Who's that Pokémon?",
    quizNext: 'Next',
    quizScore: 'Score',
    movePower: 'Power',
    moveAccuracy: 'Accuracy',
    movePp: 'PP',
    moveCategory: 'Category',
    physical: 'Physical',
    special: 'Special',
    status: 'Status',
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
