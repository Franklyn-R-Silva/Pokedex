import { useState, useEffect } from 'react';
import type { Pokemon } from '../types';
import { fetchPokemon, MAX_POKEMON } from '../services/pokeapi';

interface UsePokemonResult {
  pokemon: Pokemon | null;
  loading: boolean;
  error: boolean;
}

// Busca um Pokémon por id/nome com estados de carregamento e erro.
// Pré-carrega vizinhos em idle para deixar Prev/Next instantâneos.
export function usePokemon(idOrName: string | number): UsePokemonResult {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    // Reset intencional ao trocar de Pokémon (mostra o loading imediatamente).
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    fetchPokemon(idOrName)
      .then((data) => {
        if (!active) return;
        if (data) {
          setPokemon(data);
          prefetchNeighbors(data.id);
        } else {
          setError(true);
        }
      })
      .catch(() => active && setError(true))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [idOrName]);

  return { pokemon, loading, error };
}

function prefetchNeighbors(id: number): void {
  const schedule =
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback.bind(window)
      : (cb: () => void): number => window.setTimeout(cb, 400);
  schedule(() => {
    if (id < MAX_POKEMON) void fetchPokemon(id + 1);
    if (id > 1) void fetchPokemon(id - 1);
  });
}
