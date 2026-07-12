const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

// Total de Pokémon disponíveis na PokéAPI (usado para limitar a navegação).
export const MAX_POKEMON = 1025;

const NAMES_KEY = 'pokedex-names';

// Caches em memória para evitar refetch ao navegar/repetir buscas.
const cache = new Map();
const speciesCache = new Map();
const typeCache = new Map();
const abilityCache = new Map();

// Extrai o id numérico de uma URL de recurso da PokéAPI (ex.: .../pokemon-species/25/).
function extractIdFromUrl(url) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

/**
 * Busca um Pokémon pelo nome ou número.
 * @param {string|number} idOrName
 * @returns {Promise<object|null>} dados do Pokémon, ou null se não encontrado.
 * @throws em caso de falha de rede (para ser tratado por quem chama).
 */
export async function fetchPokemon(idOrName) {
  const key = String(idOrName).toLowerCase();
  if (cache.has(key)) {
    return cache.get(key);
  }

  const response = await fetch(`${BASE_URL}/${key}`);

  if (!response.ok) {
    return null; // 404 e afins: Pokémon inexistente.
  }

  const data = await response.json();
  // Memoriza por nome e por id para acertar em ambas as formas de busca.
  cache.set(String(data.name), data);
  cache.set(String(data.id), data);
  return data;
}

/**
 * Carrega a lista completa de nomes (para o autocomplete). Guarda em
 * localStorage para não rebaixar os 1025 nomes a cada visita.
 * @returns {Promise<string[]>}
 */
export async function fetchAllPokemonNames() {
  try {
    const cached = localStorage.getItem(NAMES_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    /* localStorage indisponível: segue para o fetch */
  }

  try {
    const response = await fetch(`${BASE_URL}?limit=${MAX_POKEMON}`);
    if (!response.ok) return [];
    const data = await response.json();
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

/**
 * Busca (com cache) os dados de espécie de um Pokémon.
 * @param {string} url  data.species.url
 * @returns {Promise<object|null>}
 */
export async function fetchSpecies(url) {
  if (speciesCache.has(url)) return speciesCache.get(url);
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    speciesCache.set(url, data);
    return data;
  } catch {
    return null;
  }
}

/** Descrição (flavor text) no idioma pedido, com fallback para inglês. */
export function getFlavorText(species, lang = 'en') {
  const entries = species?.flavor_text_entries ?? [];
  const entry =
    entries.find((e) => e.language.name === lang) || entries.find((e) => e.language.name === 'en');
  return entry ? entry.flavor_text.replace(/[\n\f\r]/g, ' ') : '';
}

/** Categoria/genus no idioma pedido, com fallback para inglês. */
export function getGenus(species, lang = 'en') {
  const entries = species?.genera ?? [];
  const entry =
    entries.find((e) => e.language.name === lang) || entries.find((e) => e.language.name === 'en');
  return entry ? entry.genus : '';
}

/**
 * Nome localizado de uma habilidade. Para 'en' usa o slug (a UI capitaliza);
 * para outros idiomas busca o endpoint da habilidade (com cache).
 * @param {{ability: {name: string, url: string}}} ability
 * @param {string} lang
 * @returns {Promise<string>}
 */
export async function getAbilityName(ability, lang) {
  const slug = ability.ability.name.replace(/-/g, ' ');
  if (lang === 'en') return slug;

  const { url } = ability.ability;
  const cacheKey = `${url}|${lang}`;
  if (abilityCache.has(cacheKey)) return abilityCache.get(cacheKey);

  try {
    const response = await fetch(url);
    if (!response.ok) return slug;
    const data = await response.json();
    const entry =
      data.names.find((n) => n.language.name === lang) ||
      data.names.find((n) => n.language.name === 'en');
    const name = entry ? entry.name : slug;
    abilityCache.set(cacheKey, name);
    return name;
  } catch {
    return slug;
  }
}

/**
 * Resolve a melhor imagem disponível para o Pokémon (normal ou shiny).
 * O sprite animado (black-white) só existe até a Geração V, então usamos
 * uma cadeia de fallback para não deixar imagem quebrada nas gerações novas.
 * @param {object} data
 * @param {boolean} [shiny=false]
 * @returns {string} URL da imagem.
 */
export function getPokemonSprite(data, shiny = false) {
  const sprites = data.sprites ?? {};
  const animated = sprites.versions?.['generation-v']?.['black-white']?.animated;
  const artwork = sprites.other?.['official-artwork'];

  if (shiny) {
    return animated?.front_shiny || artwork?.front_shiny || sprites.front_shiny || '';
  }

  return (
    animated?.front_default ||
    artwork?.front_default ||
    sprites.other?.dream_world?.front_default ||
    sprites.front_default ||
    ''
  );
}

/**
 * Imagem estática (PNG) de melhor qualidade: artwork oficial, com fallbacks.
 * @param {object} data
 * @param {boolean} [shiny=false]
 * @returns {string}
 */
export function getStaticImage(data, shiny = false) {
  const sprites = data.sprites ?? {};
  const artwork = sprites.other?.['official-artwork'];
  if (shiny) {
    return artwork?.front_shiny || sprites.front_shiny || '';
  }
  return (
    artwork?.front_default ||
    sprites.other?.dream_world?.front_default ||
    sprites.front_default ||
    ''
  );
}

/**
 * GIF animado (Gen V black-white). Retorna '' quando não existe (Gen VI+).
 * @param {object} data
 * @param {boolean} [shiny=false]
 * @returns {string}
 */
export function getAnimatedGif(data, shiny = false) {
  const animated = data.sprites?.versions?.['generation-v']?.['black-white']?.animated;
  return (shiny ? animated?.front_shiny : animated?.front_default) || '';
}

/**
 * Monta a URL do artwork oficial a partir do id (sem requisição extra).
 * @param {number} id
 * @returns {string}
 */
export function getArtworkById(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/**
 * Busca a cadeia de evolução de um Pokémon.
 * Fluxo: species -> evolution_chain -> percorre a árvore (inclui ramificações).
 * @param {string} speciesUrl URL da espécie (data.species.url).
 * @returns {Promise<Array<{name: string, id: number}>>}
 */
export async function fetchEvolutionChain(speciesUrl) {
  try {
    const species = await fetchSpecies(speciesUrl);
    if (!species) return [];

    const evoResponse = await fetch(species.evolution_chain.url);
    if (!evoResponse.ok) return [];
    const evolution = await evoResponse.json();

    const chain = [];
    const queue = [evolution.chain];
    while (queue.length > 0) {
      const node = queue.shift();
      chain.push({ name: node.species.name, id: extractIdFromUrl(node.species.url) });
      node.evolves_to.forEach((next) => queue.push(next));
    }
    return chain;
  } catch {
    return [];
  }
}

async function fetchType(url) {
  if (typeCache.has(url)) return typeCache.get(url);
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  typeCache.set(url, data);
  return data;
}

/**
 * Calcula as fraquezas combinando as relações de dano dos tipos do Pokémon.
 * @param {Array<{type: {name: string, url: string}}>} types  data.types
 * @returns {Promise<Array<{name: string, multiplier: number}>>} tipos com multiplicador > 1.
 */
export async function fetchWeaknesses(types) {
  try {
    const multipliers = {};
    for (const { type } of types) {
      const typeData = await fetchType(type.url);
      if (!typeData) continue;
      const relations = typeData.damage_relations;
      relations.double_damage_from.forEach((t) => {
        multipliers[t.name] = (multipliers[t.name] ?? 1) * 2;
      });
      relations.half_damage_from.forEach((t) => {
        multipliers[t.name] = (multipliers[t.name] ?? 1) * 0.5;
      });
      relations.no_damage_from.forEach((t) => {
        multipliers[t.name] = (multipliers[t.name] ?? 1) * 0;
      });
    }
    return Object.entries(multipliers)
      .filter(([, m]) => m > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([name, multiplier]) => ({ name, multiplier }));
  } catch {
    return [];
  }
}

/**
 * Lista os Pokémon de um tipo.
 * @param {string} typeName
 * @returns {Promise<Array<{name: string, id: number}>>}
 */
export async function fetchByType(typeName) {
  const data = await fetchType(`https://pokeapi.co/api/v2/type/${typeName}`);
  if (!data) return [];
  return data.pokemon
    .map((p) => ({ name: p.pokemon.name, id: extractIdFromUrl(p.pokemon.url) }))
    .filter((p) => p.id && p.id <= MAX_POKEMON);
}

/**
 * Lista as espécies de uma geração (ordenadas por id).
 * @param {number|string} genId
 * @returns {Promise<Array<{name: string, id: number}>>}
 */
export async function fetchByGeneration(genId) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.pokemon_species
      .map((s) => ({ name: s.name, id: extractIdFromUrl(s.url) }))
      .filter((s) => s.id)
      .sort((a, b) => a.id - b.id);
  } catch {
    return [];
  }
}
