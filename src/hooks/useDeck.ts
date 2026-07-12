import { useState, useCallback } from 'react';
import type { TcgCard } from '../types';
import type { DeckEntry } from '../domain/deck';
import { copiesAllowed } from '../domain/deck';

const KEY = 'pokedex-deck';

function load(): DeckEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as DeckEntry[];
  } catch {
    return [];
  }
}

function save(entries: DeckEntry[]): DeckEntry[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* cota cheia */
  }
  return entries;
}

// Estado do deck (Map de cartas → contagem) persistido no localStorage.
export function useDeck() {
  const [entries, setEntries] = useState<DeckEntry[]>(load);

  const add = useCallback((card: TcgCard) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.card.id === card.id);
      if (!copiesAllowed(card, existing?.count ?? 0)) return prev;
      const next = existing
        ? prev.map((e) => (e.card.id === card.id ? { ...e, count: e.count + 1 } : e))
        : [...prev, { card, count: 1 }];
      return save(next);
    });
  }, []);

  const addMany = useCallback((card: TcgCard, n: number) => {
    setEntries((prev) => {
      let next = prev;
      for (let i = 0; i < n; i++) {
        const existing = next.find((e) => e.card.id === card.id);
        if (!copiesAllowed(card, existing?.count ?? 0)) break;
        next = existing
          ? next.map((e) => (e.card.id === card.id ? { ...e, count: e.count + 1 } : e))
          : [...next, { card, count: 1 }];
      }
      return save(next);
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) =>
      save(
        prev
          .map((e) => (e.card.id === id ? { ...e, count: e.count - 1 } : e))
          .filter((e) => e.count > 0),
      ),
    );
  }, []);

  const clear = useCallback(() => setEntries(save([])), []);

  return { entries, add, addMany, remove, clear };
}
