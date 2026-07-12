import type { Lang } from '../types';

// Cor oficial de cada tipo de Pokémon (usada em badges e no tema da tela).
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

// Tradução dos tipos para português (exibição nas badges).
export const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  electric: 'Elétrico',
  grass: 'Planta',
  ice: 'Gelo',
  fighting: 'Lutador',
  poison: 'Venenoso',
  ground: 'Terrestre',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Pedra',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
};

// Lista fixa dos tipos (para o filtro).
export const TYPE_NAMES = Object.keys(TYPE_COLORS);

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#777';
}

export function getTypeLabel(type: string, lang: Lang = 'pt'): string {
  if (lang === 'en') return type.charAt(0).toUpperCase() + type.slice(1);
  return TYPE_LABELS[type] ?? type;
}
