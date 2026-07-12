import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Pokemon } from '../types';
import { getPokemonSprite } from '../services/sprites';
import { useI18n } from '../i18n/I18nContext';
import pokedexDeviceUrl from '../assets/pokedex.png';

interface DeviceProps {
  pokemon: Pokemon | null;
  shiny: boolean;
  onSearch: (query: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onToggleShiny: () => void;
}

// Coluna do dispositivo: sprite, nome/número, busca, Prev/Next e ferramentas.
export function PokedexDevice({
  pokemon,
  shiny,
  onSearch,
  onPrev,
  onNext,
  onRandom,
  onToggleShiny,
}: DeviceProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <div className="col col--device">
      <div className="pokedex-device">
        <img
          src={pokemon ? getPokemonSprite(pokemon, shiny) : ''}
          alt={pokemon?.name ?? 'pokemon'}
          className="pokemon__image"
        />
        <h1 className="pokemon__data">
          <span className="pokemon__number">{pokemon?.id ?? ''}</span> -{' '}
          <span className="pokemon__name">{pokemon?.name.replace(/-/g, ' ') ?? ''}</span>
        </h1>
        <form className="form" role="search" onSubmit={submit}>
          <input
            type="search"
            className="input__search"
            placeholder={t('searchPlaceholder')}
            aria-label="Buscar Pokémon"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <div className="buttons">
          <button className="button btn-prev" type="button" onClick={onPrev}>
            Prev &lt;
          </button>
          <button className="button btn-next" type="button" onClick={onNext}>
            Next &gt;
          </button>
        </div>
        <img src={pokedexDeviceUrl} alt="pokedex" className="pokedex" />
      </div>

      <div className="toolbar">
        <button className="btn-tool btn-random" type="button" onClick={onRandom}>
          {t('random')}
        </button>
        <button
          className="btn-tool btn-shiny"
          type="button"
          aria-pressed={shiny}
          onClick={onToggleShiny}
        >
          {t('shiny')}
        </button>
      </div>
    </div>
  );
}
