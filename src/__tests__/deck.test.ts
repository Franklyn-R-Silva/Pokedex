import { describe, it, expect } from 'vitest';
import type { TcgCard } from '../types';
import { analyzeDeck, copiesAllowed, type DeckEntry } from '../domain/deck';

function card(partial: Partial<TcgCard>): TcgCard {
  return {
    id: partial.id ?? Math.random().toString(36),
    name: partial.name ?? 'Card',
    small: '',
    large: '',
    rarity: partial.rarity ?? 'Common',
    setName: '',
    number: '',
    hp: '',
    supertype: partial.supertype ?? 'Pokémon',
    evolvesFrom: partial.evolvesFrom ?? '',
    types: partial.types ?? [],
    subtypes: partial.subtypes ?? [],
    artist: '',
    flavorText: '',
    attacks: partial.attacks ?? [],
    priceUsd: null,
    priceEur: null,
    priceUrl: '',
    priceUpdated: '',
  };
}

describe('deck analysis', () => {
  it('flags a deck that is under 60 cards', () => {
    const entries: DeckEntry[] = [{ card: card({ subtypes: ['Basic'] }), count: 4 }];
    const a = analyzeDeck(entries);
    expect(a.size).toBe(4);
    expect(a.issues.some((i) => i.code === 'tooFew')).toBe(true);
    expect(a.score).toBeLessThan(70);
  });

  it('detects the 4-copy limit (basic energy is unlimited)', () => {
    const poke = card({ id: 'p', name: 'Pikachu', subtypes: ['Basic'], types: ['Lightning'] });
    const energy = card({ id: 'e', name: 'Fire Energy', supertype: 'Energy', subtypes: ['Basic'] });
    expect(copiesAllowed(poke, 4)).toBe(false);
    expect(copiesAllowed(energy, 40)).toBe(true);
    const a = analyzeDeck([{ card: poke, count: 5 }]);
    expect(a.issues.some((i) => i.code === 'tooManyCopies')).toBe(true);
  });

  it('warns when attacker energy type is missing', () => {
    const poke = card({ name: 'Pikachu', subtypes: ['Basic'], types: ['Lightning'] });
    const fire = card({ name: 'Fire Energy', supertype: 'Energy', subtypes: ['Basic'], types: ['Fire'] });
    const a = analyzeDeck([
      { card: poke, count: 8 },
      { card: fire, count: 10 },
    ]);
    expect(a.issues.some((i) => i.code === 'energyMissing' && i.value === 'Lightning')).toBe(true);
  });

  it('flags a deck with no Pokémon', () => {
    const a = analyzeDeck([{ card: card({ supertype: 'Trainer', subtypes: ['Item'] }), count: 4 }]);
    expect(a.pokemon).toBe(0);
    expect(a.issues.some((i) => i.code === 'noPokemon')).toBe(true);
  });
});
