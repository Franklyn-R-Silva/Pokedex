import { useState, useEffect } from 'react';
import type { Species } from '../types';
import { fetchSpecies } from '../services/pokeapi';

// Busca a espécie (descrição, genus, grupos de ovo, flags…) de forma reativa.
export function useSpecies(url: string): Species | null {
  const [species, setSpecies] = useState<Species | null>(null);
  useEffect(() => {
    let active = true;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSpecies(null);
    void fetchSpecies(url).then((data) => {
      if (active) setSpecies(data);
    });
    return () => {
      active = false;
    };
  }, [url]);
  return species;
}
