import { describe, it, expect } from 'vitest';
import { getPokemonSprite, getStaticImage, getAnimatedGif, getArtworkById } from './api.js';

// Dados mínimos imitando a forma dos sprites da PokéAPI.
const genV = {
  sprites: {
    front_default: 'default.png',
    front_shiny: 'default-shiny.png',
    versions: {
      'generation-v': {
        'black-white': {
          animated: { front_default: 'anim.gif', front_shiny: 'anim-shiny.gif' },
        },
      },
    },
    other: {
      'official-artwork': { front_default: 'art.png', front_shiny: 'art-shiny.png' },
    },
  },
};

const genIX = {
  sprites: {
    front_default: 'default.png',
    versions: { 'generation-v': { 'black-white': { animated: { front_default: null } } } },
    other: { 'official-artwork': { front_default: 'art.png' } },
  },
};

describe('getPokemonSprite', () => {
  it('prefere o gif animado quando existe', () => {
    expect(getPokemonSprite(genV)).toBe('anim.gif');
    expect(getPokemonSprite(genV, true)).toBe('anim-shiny.gif');
  });

  it('cai para o artwork oficial quando não há animado (Gen VI+)', () => {
    expect(getPokemonSprite(genIX)).toBe('art.png');
  });
});

describe('getStaticImage', () => {
  it('retorna o artwork oficial (normal e shiny)', () => {
    expect(getStaticImage(genV)).toBe('art.png');
    expect(getStaticImage(genV, true)).toBe('art-shiny.png');
  });
});

describe('getAnimatedGif', () => {
  it('retorna o gif quando existe e vazio quando não', () => {
    expect(getAnimatedGif(genV)).toBe('anim.gif');
    expect(getAnimatedGif(genV, true)).toBe('anim-shiny.gif');
    expect(getAnimatedGif(genIX)).toBe('');
  });
});

describe('getArtworkById', () => {
  it('monta a URL do artwork pelo id', () => {
    expect(getArtworkById(25)).toContain('/official-artwork/25.png');
  });
});
