const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

// Total de Pokémon disponíveis na PokéAPI (usado para limitar a navegação).
export const MAX_POKEMON = 1025;

// Cache em memória para evitar refetch ao navegar entre Pokémon já vistos.
const cache = new Map();

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
 * Carrega a lista completa de nomes de Pokémon (para o autocomplete da busca).
 * @returns {Promise<string[]>}
 */
export async function fetchAllPokemonNames() {
  try {
    const response = await fetch(`${BASE_URL}?limit=${MAX_POKEMON}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results.map((pokemon) => pokemon.name);
  } catch {
    return [];
  }
}

/**
 * Resolve a melhor imagem disponível para o Pokémon.
 * O sprite animado (black-white) só existe até a Geração V, então usamos
 * uma cadeia de fallback para não deixar imagem quebrada nas gerações novas.
 * @param {object} data
 * @returns {string} URL da imagem.
 */
export function getPokemonSprite(data) {
  const sprites = data.sprites ?? {};

  const animated = sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
  const officialArtwork = sprites.other?.['official-artwork']?.front_default;
  const dreamWorld = sprites.other?.dream_world?.front_default;

  return animated || officialArtwork || dreamWorld || sprites.front_default || '';
}

/**
 * Imagem estática (PNG) de melhor qualidade: artwork oficial, com fallbacks.
 * @param {object} data
 * @returns {string}
 */
export function getStaticImage(data) {
  const sprites = data.sprites ?? {};
  return (
    sprites.other?.['official-artwork']?.front_default ||
    sprites.other?.dream_world?.front_default ||
    sprites.front_default ||
    ''
  );
}

/**
 * GIF animado (Gen V black-white). Retorna '' quando não existe (Gen VI+).
 * @param {object} data
 * @returns {string}
 */
export function getAnimatedGif(data) {
  const sprites = data.sprites ?? {};
  return sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || '';
}

/**
 * Monta a URL do artwork oficial a partir do id (sem requisição extra).
 * @param {number} id
 * @returns {string}
 */
export function getArtworkById(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Extrai o id numérico de uma URL de recurso da PokéAPI (ex.: .../pokemon-species/25/).
function extractIdFromUrl(url) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

/**
 * Busca a cadeia de evolução de um Pokémon.
 * Fluxo: species -> evolution_chain -> percorre a árvore (inclui ramificações).
 * @param {string} speciesUrl URL da espécie (data.species.url).
 * @returns {Promise<Array<{name: string, id: number}>>}
 */
export async function fetchEvolutionChain(speciesUrl) {
  try {
    const speciesResponse = await fetch(speciesUrl);
    if (!speciesResponse.ok) return [];
    const species = await speciesResponse.json();

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
