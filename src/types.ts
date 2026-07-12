// Tipos compartilhados para os dados da PokéAPI (apenas os campos usados).

export interface NamedResource {
  name: string;
  url: string;
}

export interface Sprites {
  front_default?: string | null;
  front_shiny?: string | null;
  other?: {
    'official-artwork'?: { front_default?: string | null; front_shiny?: string | null };
    dream_world?: { front_default?: string | null };
  };
  versions?: {
    'generation-v'?: {
      'black-white'?: {
        animated?: { front_default?: string | null; front_shiny?: string | null };
      };
    };
  };
}

export interface PokemonType {
  slot: number;
  type: NamedResource;
}

export interface PokemonStat {
  base_stat: number;
  stat: NamedResource;
}

export interface PokemonAbility {
  ability: NamedResource;
  is_hidden: boolean;
  slot: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  species: NamedResource;
  sprites: Sprites;
  cries?: { latest?: string | null };
}

export interface LocalizedEntry {
  language: NamedResource;
}

export interface Species {
  flavor_text_entries: (LocalizedEntry & { flavor_text: string })[];
  genera: (LocalizedEntry & { genus: string })[];
  evolution_chain: { url: string };
}

export interface EvolutionNode {
  species: NamedResource;
  evolves_to: EvolutionNode[];
}

export interface EvolutionChain {
  chain: EvolutionNode;
}

export interface DamageRelations {
  double_damage_from: NamedResource[];
  half_damage_from: NamedResource[];
  no_damage_from: NamedResource[];
}

export interface TypeData {
  damage_relations: DamageRelations;
  pokemon: { pokemon: NamedResource }[];
}

export interface AbilityData {
  names: (LocalizedEntry & { name: string })[];
}

/** Item leve {name, id} usado em evolução e no filtro. */
export interface RefItem {
  name: string;
  id: number;
}

export interface Weakness {
  name: string;
  multiplier: number;
}

export interface Favorite {
  id: number;
  name: string;
}

export type Lang = 'pt' | 'en';
