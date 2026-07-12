import { useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Pokemon } from '../types';
import { getPokemonSprite } from '../services/sprites';
import { setupAutocomplete } from '../features/autocomplete';
import { useI18n } from '../i18n/I18nContext';
import { useModal } from '../context/ModalContext';
import { Lightbox } from './Lightbox';
import pokedexDeviceUrl from '../assets/pokedex.png';

interface DeviceProps {
  pokemon: Pokemon | null;
  shiny: boolean;
  getNames: () => string[];
  onSearch: (query: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onToggleShiny: () => void;
}

export function PokedexDevice({
  pokemon,
  shiny,
  getNames,
  onSearch,
  onPrev,
  onNext,
  onRandom,
  onToggleShiny,
}: DeviceProps) {
  const { t } = useI18n();
  const { open } = useModal();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLUListElement>(null);
  const dataRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Autocomplete reaproveitado (substring, teclado) sobre a busca.
  useEffect(() => {
    if (!inputRef.current || !suggestRef.current) return;
    setupAutocomplete({
      input: inputRef.current,
      container: suggestRef.current,
      getNames,
      onSelect: (name) => onSearchRef.current(name),
    });
  }, [getNames]);

  // Encolhe o nome/número até caber em uma linha e reinicia o "pop" da imagem.
  useEffect(() => {
    const el = dataRef.current;
    if (el) {
      el.style.fontSize = '';
      let size = parseFloat(getComputedStyle(el).fontSize);
      let guard = 0;
      while (el.scrollWidth > el.clientWidth && size > 8 && guard < 40) {
        size -= 1;
        el.style.fontSize = `${size}px`;
        guard += 1;
      }
    }
    const img = imageRef.current;
    if (img) {
      img.classList.remove('pop');
      void img.offsetWidth;
      img.classList.add('pop');
    }
  }, [pokemon]);

  useEffect(() => {
    const onResize = () => {
      const el = dataRef.current;
      if (el) el.style.fontSize = '';
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value) {
      onSearch(value.toLowerCase());
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const cry = pokemon?.cries?.latest ?? '';
  const playCry = () => {
    if (cry) void new Audio(cry).play().catch(() => undefined);
  };
  const share = () => {
    const url = window.location.href;
    if (navigator.share) void navigator.share({ title: document.title, url }).catch(() => undefined);
    else void navigator.clipboard?.writeText(url);
  };

  return (
    <div className="col col--device">
      <div className="pokedex-device">
        <img
          ref={imageRef}
          src={pokemon ? getPokemonSprite(pokemon, shiny) : ''}
          alt={pokemon?.name ?? 'pokemon'}
          className="pokemon__image"
          onClick={() => pokemon && open(<Lightbox pokemon={pokemon} />)}
        />
        <h1 className="pokemon__data" ref={dataRef}>
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
            ref={inputRef}
          />
          <ul className="suggestions" role="listbox" ref={suggestRef} />
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
        <button className="btn-tool btn-cry" type="button" disabled={!cry} onClick={playCry}>
          {t('cry')}
        </button>
        <button className="btn-tool btn-share" type="button" disabled={!pokemon} onClick={share}>
          {t('share')}
        </button>
      </div>
    </div>
  );
}
