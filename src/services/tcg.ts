// Cartas do TCG via Pokémon TCG API (api.pokemontcg.io), separada da PokéAPI.
// Busca por número da Pokédex nacional (casa com o id do app), traz conteúdo +
// preços de mercado embutidos e cacheia (memória + localStorage) para respeitar
// o limite gratuito da API.
import type { TcgCard, TcgAttack } from '../types';

const API = 'https://api.pokemontcg.io/v2/cards';
const STORE_KEY = 'pokedex-tcg';
const SELECT =
  'id,name,number,rarity,artist,flavorText,hp,supertype,evolvesFrom,legalities,types,subtypes,set,images,attacks,tcgplayer,cardmarket';
const memory = new Map<number, TcgCard[]>();

// Chave opcional: sem ela a API funciona com limite reduzido (1000/dia).
const API_KEY = import.meta.env.VITE_POKEMONTCG_KEY as string | undefined;

interface PriceBlock {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
}

interface ApiCard {
  id: string;
  name: string;
  number?: string;
  rarity?: string;
  artist?: string;
  flavorText?: string;
  hp?: string;
  supertype?: string;
  evolvesFrom?: string;
  legalities?: { standard?: string; expanded?: string; unlimited?: string };
  types?: string[];
  subtypes?: string[];
  set?: { name?: string };
  images?: { small?: string; large?: string };
  attacks?: TcgAttack[];
  tcgplayer?: { url?: string; updatedAt?: string; prices?: Record<string, PriceBlock> };
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: { trendPrice?: number; averageSellPrice?: number };
  };
}

// GET com retry em 429 (rate limit) — a API gratuita é restritiva sem chave.
async function fetchJson(url: string): Promise<Response> {
  const headers: Record<string, string> = {};
  if (API_KEY) headers['X-Api-Key'] = API_KEY;
  let res = await fetch(url, { headers });
  for (let attempt = 0; attempt < 3 && res.status === 429; attempt++) {
    await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    res = await fetch(url, { headers });
  }
  return res;
}

function loadStore(): Record<string, TcgCard[]> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Record<string, TcgCard[]>;
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, TcgCard[]>): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* cota cheia: ignora */
  }
}

// Melhor preço de mercado disponível (TCGplayer USD) entre as variantes.
function marketUsd(tp?: ApiCard['tcgplayer']): number | null {
  if (!tp?.prices) return null;
  const preferred = ['holofoil', 'normal', 'reverseHolofoil', 'unlimitedHolofoil'];
  for (const key of [...preferred, ...Object.keys(tp.prices)]) {
    const market = tp.prices[key]?.market;
    if (typeof market === 'number') return market;
  }
  return null;
}

function toCard(c: ApiCard): TcgCard {
  return {
    id: c.id,
    name: c.name,
    small: c.images!.small!,
    large: c.images?.large ?? c.images!.small!,
    rarity: c.rarity ?? '',
    setName: c.set?.name ?? '',
    number: c.number ?? '',
    hp: c.hp ?? '',
    supertype: c.supertype ?? '',
    evolvesFrom: c.evolvesFrom ?? '',
    legalStandard: c.legalities?.standard === 'Legal',
    legalExpanded: c.legalities?.expanded === 'Legal',
    types: c.types ?? [],
    subtypes: c.subtypes ?? [],
    artist: c.artist ?? '',
    flavorText: c.flavorText ?? '',
    attacks: c.attacks ?? [],
    priceUsd: marketUsd(c.tcgplayer),
    priceEur: c.cardmarket?.prices?.trendPrice ?? c.cardmarket?.prices?.averageSellPrice ?? null,
    priceUrl: c.tcgplayer?.url ?? c.cardmarket?.url ?? '',
    priceUpdated: c.tcgplayer?.updatedAt ?? c.cardmarket?.updatedAt ?? '',
  };
}

/** Cartas do Pokémon (por nº da Pokédex). Retorna [] em erro/sem resultado. */
export async function fetchCards(dexId: number): Promise<TcgCard[]> {
  if (memory.has(dexId)) return memory.get(dexId)!;

  const store = loadStore();
  const cached = store[String(dexId)];
  if (cached) {
    memory.set(dexId, cached);
    return cached;
  }

  try {
    const url = `${API}?q=nationalPokedexNumbers:${dexId}&orderBy=-set.releaseDate&pageSize=24&select=${SELECT}`;
    const headers: Record<string, string> = {};
    if (API_KEY) headers['X-Api-Key'] = API_KEY;

    const response = await fetch(url, { headers });
    if (!response.ok) return [];

    const json = (await response.json()) as { data?: ApiCard[] };
    const cards: TcgCard[] = (json.data ?? []).filter((c) => c.images?.small).map(toCard);

    memory.set(dexId, cards);
    store[String(dexId)] = cards;
    saveStore(store);
    return cards;
  } catch {
    return [];
  }
}

export interface CardSearch {
  name?: string;
  supertype?: string;
  subtype?: string;
  type?: string;
  rarity?: string;
  orderBy?: string;
  page?: number;
  pageSize?: number;
}

const searchCache = new Map<string, { cards: TcgCard[]; totalCount: number }>();

/** Busca cartas por nome/supertipo/subtipo/tipo (para o construtor de deck).
 *  Cacheada em memória por consulta — importação/repetição ficam instantâneas. */
export async function searchCards(
  opts: CardSearch,
): Promise<{ cards: TcgCard[]; totalCount: number }> {
  const parts: string[] = [];
  if (opts.name?.trim()) parts.push(`name:${opts.name.trim().replace(/[^\w\s-]/g, '')}*`);
  if (opts.supertype) parts.push(`supertype:"${opts.supertype}"`);
  if (opts.subtype) parts.push(`subtypes:"${opts.subtype}"`);
  if (opts.type) parts.push(`types:${opts.type}`);
  if (opts.rarity) parts.push(`rarity:"${opts.rarity}"`);
  const query = parts.join(' ') || 'supertype:Pokémon';
  const orderBy = opts.orderBy ?? '-set.releaseDate';
  const pageSize = opts.pageSize ?? 24;

  const cacheKey = `${query}#${orderBy}#${opts.page ?? 1}#${pageSize}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url =
      `${API}?q=${encodeURIComponent(query)}&orderBy=${encodeURIComponent(orderBy)}` +
      `&page=${opts.page ?? 1}&pageSize=${pageSize}&select=${SELECT}`;
    const headers: Record<string, string> = {};
    if (API_KEY) headers['X-Api-Key'] = API_KEY;

    const response = await fetch(url, { headers });
    if (!response.ok) return { cards: [], totalCount: 0 };

    const json = (await response.json()) as { data?: ApiCard[]; totalCount?: number };
    const cards = (json.data ?? []).filter((c) => c.images?.small).map(toCard);
    const result = { cards, totalCount: json.totalCount ?? cards.length };
    if (cards.length > 0) searchCache.set(cacheKey, result);
    return result;
  } catch {
    return { cards: [], totalCount: 0 };
  }
}

const BYNAME_STORE = 'pokedex-tcg-byname';
let bynameMem: Map<string, TcgCard> | null = null;

function loadByName(): Map<string, TcgCard> {
  if (bynameMem) return bynameMem;
  try {
    const obj = JSON.parse(localStorage.getItem(BYNAME_STORE) ?? '{}') as Record<string, TcgCard>;
    bynameMem = new Map(Object.entries(obj));
  } catch {
    bynameMem = new Map();
  }
  return bynameMem;
}

function saveByName(map: Map<string, TcgCard>): void {
  try {
    localStorage.setItem(BYNAME_STORE, JSON.stringify(Object.fromEntries(map)));
  } catch {
    /* cota cheia: ignora */
  }
}

/** Busca cartas por nome devolvendo um mapa nome→melhor carta (match exato
 *  preferido). Cache **por carta** (memória + localStorage): staples repetidos
 *  entre decks são buscados uma única vez, então só os nomes ainda ausentes vão
 *  à API (em lotes). Reimportar um deck ou carregar outro que compartilhe cartas
 *  fica instantâneo (0 requests). Ver prefetchCardsByNames para aquecer tudo. */
export async function fetchCardsByNames(names: string[]): Promise<Map<string, TcgCard>> {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const cache = loadByName();
  const result = new Map<string, TcgCard>();
  const missing: string[] = [];

  for (const name of unique) {
    const nl = name.toLowerCase();
    const hit = cache.get(nl);
    if (hit) result.set(nl, hit);
    else missing.push(name);
  }
  if (missing.length === 0) return result;

  // Chave do truncamento: um nome com muitas edições enche o pageSize (250) e
  // "engole" os demais do lote OR. Energia Básica é o pior caso (centenas de
  // reprints), então busca-se cada uma sozinha; o resto (≤ ~30 edições/nome)
  // vai em OR de lotes pequenos (6 → no máx. ~180 resultados, sem truncar).
  const before = result.size;
  const basics = missing.filter((n) => BASIC_ENERGY.test(n));
  const others = missing.filter((n) => !BASIC_ENERGY.test(n));

  // Energias básicas — individuais, com concorrência leve.
  const POOL = 4;
  for (let i = 0; i < basics.length; i += POOL) {
    const batch = basics.slice(i, i + POOL);
    const cards = await Promise.all(batch.map((n) => fetchOneByName(n)));
    batch.forEach((name, j) => {
      const card = cards[j];
      if (card) {
        result.set(name.toLowerCase(), card);
        cache.set(name.toLowerCase(), card);
      }
    });
  }

  // Demais nomes — OR em lotes pequenos (à prova de truncamento).
  const CHUNK = 6;
  for (let i = 0; i < others.length; i += CHUNK) {
    const chunk = others.slice(i, i + CHUNK);
    if (i > 0) await new Promise((r) => setTimeout(r, 100));
    let cards: TcgCard[] = [];
    try {
      const q = chunk.map((n) => `name:"${n.replace(/"/g, '')}"`).join(' OR ');
      const url = `${API}?q=${encodeURIComponent(q)}&orderBy=-set.releaseDate&pageSize=250&select=${SELECT}`;
      const res = await fetchJson(url);
      if (res.ok) {
        const json = (await res.json()) as { data?: ApiCard[] };
        cards = (json.data ?? []).filter((c) => c.images?.small).map(toCard);
      }
    } catch {
      /* lote falhou: nomes ficam sem resolver */
    }
    for (const name of chunk) {
      const nl = name.toLowerCase();
      const exact = cards.find((c) => c.name.toLowerCase() === nl);
      const partial = exact ?? cards.find((c) => c.name.toLowerCase().startsWith(nl));
      if (partial) {
        result.set(nl, partial);
        cache.set(nl, partial);
      }
    }
  }

  if (result.size > before) saveByName(cache);
  return result;
}

const BASIC_ENERGY =
  /^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy|Dragon) Energy$/i;

/** Resolve UM nome → melhor carta (match exato preferido, edição mais recente). */
async function fetchOneByName(name: string): Promise<TcgCard | null> {
  const nl = name.toLowerCase();
  try {
    const q = `name:"${name.replace(/"/g, '')}"`;
    const url = `${API}?q=${encodeURIComponent(q)}&orderBy=-set.releaseDate&pageSize=6&select=${SELECT}`;
    const res = await fetchJson(url);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: ApiCard[] };
    const cards = (json.data ?? []).filter((c) => c.images?.small).map(toCard);
    const exact = cards.find((c) => c.name.toLowerCase() === nl);
    return exact ?? cards.find((c) => c.name.toLowerCase().startsWith(nl)) ?? null;
  } catch {
    return null;
  }
}

/** Aquecimento em background: garante que todas as cartas dos nomes informados
 *  estejam no cache por-carta, para que importações futuras sejam instantâneas. */
export async function prefetchCardsByNames(names: string[]): Promise<void> {
  await fetchCardsByNames(names);
}

/** Rarezas "brilhantes" que recebem o efeito holográfico no hover. */
export function isHolo(rarity: string): boolean {
  return /rare|holo|ex|gx|vmax|vstar|\bv\b|full art|rainbow|secret|shiny|amazing|radiant/i.test(
    rarity,
  );
}

/** Faixa de raridade → tier para colorir o badge (common/uncommon/rare/ultra/secret). */
export function rarityTier(rarity: string): string {
  const r = rarity.toLowerCase();
  if (/rainbow|secret|gold|hyper/.test(r)) return 'secret';
  if (/ultra|vmax|vstar|full art|\bgx\b|\bex\b|\bv\b|amazing|radiant|illustration/.test(r))
    return 'ultra';
  if (/holo|rare/.test(r)) return 'rare';
  if (/uncommon/.test(r)) return 'uncommon';
  return 'common';
}

/** Formata um preço em USD/EUR (Intl). */
export function formatPrice(value: number, currency: 'USD' | 'EUR'): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'de-DE', {
    style: 'currency',
    currency,
  }).format(value);
}
