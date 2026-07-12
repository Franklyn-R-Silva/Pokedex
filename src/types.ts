// Tipos compartilhados para os dados da PokéAPI (apenas os campos usados).

export interface NamedResource {
  name: string;
  url: string;
}

export interface Sprites {
  front_default?: string | null;
  front_shiny?: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
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
  effort: number;
  stat: NamedResource;
}

export interface PokemonAbility {
  ability: NamedResource;
  is_hidden: boolean;
  slot: number;
}

export interface MoveVersionDetail {
  level_learned_at: number;
  move_learn_method: NamedResource;
  version_group: NamedResource;
}

export interface PokemonMove {
  move: NamedResource;
  version_group_details: MoveVersionDetail[];
}

export interface HeldItem {
  item: NamedResource;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  held_items: HeldItem[];
  forms: NamedResource[];
  location_area_encounters: string;
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
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  hatch_counter: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  growth_rate: NamedResource | null;
  egg_groups: NamedResource[];
  habitat: NamedResource | null;
  generation: NamedResource;
  varieties: { is_default: boolean; pokemon: NamedResource }[];
}

export interface EncounterLocation {
  location_area: NamedResource;
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: NamedResource;
  item: NamedResource | null;
  min_happiness: number | null;
  held_item: NamedResource | null;
}

export interface EvolutionNode {
  species: NamedResource;
  evolves_to: EvolutionNode[];
  evolution_details: EvolutionDetail[];
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

export interface EffectEntry {
  effect: string;
  short_effect: string;
  language: NamedResource;
}

export interface AbilityData {
  names: (LocalizedEntry & { name: string })[];
  effect_entries: EffectEntry[];
}

export interface MoveData {
  name: string;
  type: NamedResource;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damage_class: NamedResource;
  effect_entries: EffectEntry[];
}

/** Item leve {name, id} usado em evolução e no filtro. */
export interface RefItem {
  name: string;
  id: number;
  detail?: EvolutionDetail;
}

export interface Weakness {
  name: string;
  multiplier: number;
}

export interface Effectiveness {
  weaknesses: Weakness[];
  resistances: Weakness[];
  immunities: string[];
}

export interface Favorite {
  id: number;
  name: string;
}

/** Ataque de uma carta do TCG. */
export interface TcgAttack {
  name: string;
  cost: string[];
  damage: string;
  text: string;
}

/** Carta do TCG (Pokémon TCG API — api.pokemontcg.io). */
export interface TcgCard {
  id: string;
  name: string;
  small: string;
  large: string;
  rarity: string;
  setName: string;
  number: string;
  hp: string;
  types: string[];
  subtypes: string[];
  artist: string;
  flavorText: string;
  attacks: TcgAttack[];
  /** Preço de mercado (TCGplayer, USD) e tendência (Cardmarket, EUR). */
  priceUsd: number | null;
  priceEur: number | null;
  priceUrl: string;
  priceUpdated: string;
}

export type Lang = 'pt' | 'en';
