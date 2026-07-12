// Cartas do TCG via Pokémon TCG API (api.pokemontcg.io), separada da PokéAPI.
// Busca por número da Pokédex nacional (casa com o id do app) e cacheia o
// resultado (memória + localStorage) para respeitar o limite gratuito da API.
import type { TcgCard } from '../types';

const API = 'https://api.pokemontcg.io/v2/cards';
const STORE_KEY = 'pokedex-tcg';
const memory = new Map<number, TcgCard[]>();

// Chave opcional: sem ela a API funciona com limite reduzido (1000/dia).
const API_KEY = import.meta.env.VITE_POKEMONTCG_KEY as string | undefined;

interface ApiCard {
  id: string;
  name: string;
  rarity?: string;
  set?: { name?: string };
  images?: { small?: string; large?: string };
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
    const url =
      `${API}?q=nationalPokedexNumbers:${dexId}` +
      `&orderBy=-set.releaseDate&pageSize=24&select=id,name,rarity,set,images`;
    const headers: Record<string, string> = {};
    if (API_KEY) headers['X-Api-Key'] = API_KEY;

    const response = await fetch(url, { headers });
    if (!response.ok) return [];

    const json = (await response.json()) as { data?: ApiCard[] };
    const cards: TcgCard[] = (json.data ?? [])
      .filter((c) => c.images?.small)
      .map((c) => ({
        id: c.id,
        name: c.name,
        small: c.images!.small!,
        large: c.images?.large ?? c.images!.small!,
        rarity: c.rarity ?? '',
        setName: c.set?.name ?? '',
      }));

    memory.set(dexId, cards);
    store[String(dexId)] = cards;
    saveStore(store);
    return cards;
  } catch {
    return [];
  }
}

/** Rarezas "brilhantes" que recebem o efeito holográfico no hover. */
export function isHolo(rarity: string): boolean {
  return /rare|holo|ex|gx|vmax|vstar|\bv\b|full art|rainbow|secret|shiny|amazing|radiant/i.test(
    rarity,
  );
}
