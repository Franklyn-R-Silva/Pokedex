import type {
  Pokemon,
  Species,
  TypeData,
  EvolutionChain,
  EvolutionNode,
  EncounterLocation,
  RefItem,
  Effectiveness,
  PokemonType,
} from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

// Total de Pokémon disponíveis na PokéAPI (usado para limitar a navegação).
export const MAX_POKEMON = 1025;

const NAMES_KEY = 'pokedex-names';

// Caches em memória para evitar refetch ao navegar/repetir buscas.
const cache = new Map<string, Pokemon>();
const speciesCache = new Map<string, Species>();
const typeCache = new Map<string, TypeData>();

function extractIdFromUrl(url: string): number | null {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

/** Busca um Pokémon pelo nome ou número (null em 404; lança em falha de rede). */
export async function fetchPokemon(idOrName: string | number): Promise<Pokemon | null> {
  const key = String(idOrName).toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL}/${key}`);
  if (!response.ok) return null;

  const data = (await response.json()) as Pokemon;
  cache.set(String(data.name), data);
  cache.set(String(data.id), data);
  return data;
}

/** Lista completa de nomes (para o autocomplete), com cache em localStorage. */
export async function fetchAllPokemonNames(): Promise<string[]> {
  try {
    const cachedNames = localStorage.getItem(NAMES_KEY);
    if (cachedNames) return JSON.parse(cachedNames) as string[];
  } catch {
    /* localStorage indisponível: segue para o fetch */
  }

  try {
    const response = await fetch(`${BASE_URL}?limit=${MAX_POKEMON}`);
    if (!response.ok) return [];
    const data = (await response.json()) as { results: { name: string }[] };
    const names = data.results.map((pokemon) => pokemon.name);
    try {
      localStorage.setItem(NAMES_KEY, JSON.stringify(names));
    } catch {
      /* ignora falha ao gravar cache */
    }
    return names;
  } catch {
    return [];
  }
}

/** Dados de espécie (com cache). */
export async function fetchSpecies(url: string): Promise<Species | null> {
  const cached = speciesCache.get(url);
  if (cached) return cached;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as Species;
    speciesCache.set(url, data);
    return data;
  } catch {
    return null;
  }
}

/** Descrição (flavor text) no idioma pedido, com fallback para inglês. */
export function getFlavorText(species: Species | null, lang = 'en'): string {
  const entries = species?.flavor_text_entries ?? [];
  const entry =
    entries.find((e) => e.language.name === lang) || entries.find((e) => e.language.name === 'en');
  return entry ? entry.flavor_text.replace(/[\n\f\r]/g, ' ') : '';
}

/** Categoria/genus no idioma pedido, com fallback para inglês. */
export function getGenus(species: Species | null, lang = 'en'): string {
  const entries = species?.genera ?? [];
  const entry =
    entries.find((e) => e.language.name === lang) || entries.find((e) => e.language.name === 'en');
  return entry ? entry.genus : '';
}

/** Cadeia de evolução (BFS, inclui ramificações como a do Eevee). */
export async function fetchEvolutionChain(speciesUrl: string): Promise<RefItem[]> {
  try {
    const species = await fetchSpecies(speciesUrl);
    if (!species) return [];

    const evoResponse = await fetch(species.evolution_chain.url);
    if (!evoResponse.ok) return [];
    const evolution = (await evoResponse.json()) as EvolutionChain;

    const chain: RefItem[] = [];
    const queue: EvolutionNode[] = [evolution.chain];
    while (queue.length > 0) {
      const node = queue.shift() as EvolutionNode;
      const id = extractIdFromUrl(node.species.url);
      if (id) chain.push({ name: node.species.name, id, detail: node.evolution_details[0] });
      node.evolves_to.forEach((next) => queue.push(next));
    }
    return chain;
  } catch {
    return [];
  }
}

async function fetchType(url: string): Promise<TypeData | null> {
  const cached = typeCache.get(url);
  if (cached) return cached;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as TypeData;
  typeCache.set(url, data);
  return data;
}

/** Efetividade de tipo: fraquezas (>1), resistências (0<m<1) e imunidades (0). */
export async function fetchEffectiveness(types: PokemonType[]): Promise<Effectiveness> {
  const empty: Effectiveness = { weaknesses: [], resistances: [], immunities: [] };
  try {
    const multipliers: Record<string, number> = {};
    for (const { type } of types) {
      const typeData = await fetchType(type.url);
      if (!typeData) continue;
      const relations = typeData.damage_relations;
      relations.double_damage_from.forEach((tp) => {
        multipliers[tp.name] = (multipliers[tp.name] ?? 1) * 2;
      });
      relations.half_damage_from.forEach((tp) => {
        multipliers[tp.name] = (multipliers[tp.name] ?? 1) * 0.5;
      });
      relations.no_damage_from.forEach((tp) => {
        multipliers[tp.name] = (multipliers[tp.name] ?? 1) * 0;
      });
    }
    const entries = Object.entries(multipliers);
    return {
      weaknesses: entries
        .filter(([, m]) => m > 1)
        .sort((a, b) => b[1] - a[1])
        .map(([name, multiplier]) => ({ name, multiplier })),
      resistances: entries
        .filter(([, m]) => m > 0 && m < 1)
        .sort((a, b) => a[1] - b[1])
        .map(([name, multiplier]) => ({ name, multiplier })),
      immunities: entries.filter(([, m]) => m === 0).map(([name]) => name),
    };
  } catch {
    return empty;
  }
}

/** Locais onde o Pokémon é encontrado (nomes das áreas, sem duplicatas). */
export async function fetchEncounters(url: string): Promise<string[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = (await response.json()) as EncounterLocation[];
    return [...new Set(data.map((e) => e.location_area.name))];
  } catch {
    return [];
  }
}

/** Lista os Pokémon de um tipo. */
export async function fetchByType(typeName: string): Promise<RefItem[]> {
  const data = await fetchType(`https://pokeapi.co/api/v2/type/${typeName}`);
  if (!data) return [];
  return data.pokemon
    .map((p) => ({ name: p.pokemon.name, id: extractIdFromUrl(p.pokemon.url) }))
    .filter((p): p is RefItem => p.id !== null && p.id <= MAX_POKEMON);
}

/** Lista as espécies de uma geração (ordenadas por id). */
export async function fetchByGeneration(genId: number | string): Promise<RefItem[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
    if (!response.ok) return [];
    const data = (await response.json()) as { pokemon_species: { name: string; url: string }[] };
    return data.pokemon_species
      .map((s) => ({ name: s.name, id: extractIdFromUrl(s.url) }))
      .filter((s): s is RefItem => s.id !== null)
      .sort((a, b) => a.id - b.id);
  } catch {
    return [];
  }
}
