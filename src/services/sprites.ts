import type { Pokemon } from '../types';

/**
 * Resolve a melhor imagem disponível para o Pokémon (normal ou shiny).
 * O sprite animado (black-white) só existe até a Geração V, então usamos
 * uma cadeia de fallback para não deixar imagem quebrada nas gerações novas.
 */
export function getPokemonSprite(data: Pokemon, shiny = false): string {
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

/** Imagem estática (PNG) de melhor qualidade: artwork oficial, com fallbacks. */
export function getStaticImage(data: Pokemon, shiny = false): string {
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

/** GIF animado (Gen V black-white). Retorna '' quando não existe (Gen VI+). */
export function getAnimatedGif(data: Pokemon, shiny = false): string {
  const animated = data.sprites?.versions?.['generation-v']?.['black-white']?.animated;
  return (shiny ? animated?.front_shiny : animated?.front_default) || '';
}

/** Monta a URL do artwork oficial a partir do id (sem requisição extra). */
export function getArtworkById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export interface SpriteItem {
  label: string;
  url: string;
}

/** Todas as imagens disponíveis (para a galeria do lightbox). */
export function getSpriteGallery(data: Pokemon): SpriteItem[] {
  const sprites = data.sprites ?? {};
  const artwork = sprites.other?.['official-artwork'];
  const animated = sprites.versions?.['generation-v']?.['black-white']?.animated;
  const items: SpriteItem[] = [];
  const add = (label: string, url?: string | null): void => {
    if (url) items.push({ label, url });
  };

  add('Artwork', artwork?.front_default);
  add('Shiny', artwork?.front_shiny);
  add('GIF', animated?.front_default);
  add('GIF ✨', animated?.front_shiny);
  add('Front', sprites.front_default);
  add('Back', sprites.back_default);
  add('Front ✨', sprites.front_shiny);
  add('Back ✨', sprites.back_shiny);
  return items;
}
