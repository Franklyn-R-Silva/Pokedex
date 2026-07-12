import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { MAX_POKEMON, fetchAllPokemonNames } from './services/pokeapi';
import { getTypeColor, getTypeLabel } from './domain/pokemonTypes';
import { getArtworkById } from './services/sprites';
import { useI18n } from './i18n/I18nContext';
import { usePokemon } from './hooks/usePokemon';
import { Header } from './components/Header';
import { PokedexDevice } from './components/PokedexDevice';
import { DetailsCard } from './components/DetailsCard';
import { FavoritesPanel } from './components/panels/FavoritesPanel';
import { FilterPanel } from './components/panels/FilterPanel';
import { ComparePanel } from './components/panels/ComparePanel';
import { TeamPanel } from './components/panels/TeamPanel';
import { QuizPanel } from './components/panels/QuizPanel';

// Code-split: o construtor de deck (view pesada + Pokémon TCG API) só carrega
// quando aberto, mantendo o bundle inicial menor.
const DeckBuilder = lazy(() =>
  import('./components/deck/DeckBuilder').then((m) => ({ default: m.DeckBuilder })),
);

// Pokémon do dia (determinístico pela data) quando não há ?pokemon=ID.
function pokemonOfTheDay(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((now.getTime() - start) / 86_400_000);
  return ((dayOfYear * 7 + now.getFullYear()) % MAX_POKEMON) + 1;
}

function initialQuery(): string {
  return new URLSearchParams(window.location.search).get('pokemon') ?? String(pokemonOfTheDay());
}

export function App() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState<string>(initialQuery);
  const [shiny, setShiny] = useState(false);
  const { pokemon, loading, error } = usePokemon(query);
  const [view, setView] = useState<'main' | 'deck'>(() =>
    new URLSearchParams(window.location.search).get('view') === 'deck' ? 'deck' : 'main',
  );

  const setViewUrl = (next: 'main' | 'deck') => {
    const url = new URL(window.location.href);
    if (next === 'deck') url.searchParams.set('view', 'deck');
    else url.searchParams.delete('view');
    window.history.replaceState({}, '', url);
    setView(next);
  };

  const allNamesRef = useRef<string[]>([]);
  useEffect(() => {
    void fetchAllPokemonNames().then((names) => (allNamesRef.current = names));
  }, []);
  const getNames = useCallback(() => allNamesRef.current, []);

  const go = useCallback(
    (id: number) => setQuery(String(Math.min(MAX_POKEMON, Math.max(1, id)))),
    [],
  );
  const onSelect = useCallback((q: string | number) => setQuery(String(q).toLowerCase()), []);

  // Tema por tipo + URL + SEO/OG sincronizados com o Pokémon atual.
  useEffect(() => {
    if (!pokemon) return;
    const primary = pokemon.types[0]?.type.name ?? 'normal';
    document.documentElement.style.setProperty('--type-color', getTypeColor(primary));
    const url = new URL(window.location.href);
    url.searchParams.set('pokemon', String(pokemon.id));
    window.history.replaceState({}, '', url);

    const nice = pokemon.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const title = `#${pokemon.id} ${nice} · Pokédex`;
    const types = pokemon.types.map((tp) => getTypeLabel(tp.type.name, lang)).join(', ');
    const desc = `${nice} — ${types}. ${t('metaDescription')}`;
    document.title = title;
    const setMeta = (sel: string, v: string) =>
      document.querySelector(sel)?.setAttribute('content', v);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:image"]', getArtworkById(pokemon.id));
    setMeta('meta[property="og:url"]', window.location.href);
    setMeta('meta[name="description"]', desc);
  }, [pokemon, lang, t]);

  // Teclado: ←/→ navegam, "/" foca a busca (fora de campos e sem modal aberto).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('.input__search')?.focus();
        return;
      }
      if (typing || document.querySelector('.modal')) return;
      if (e.key === 'ArrowLeft' && pokemon) go(pokemon.id - 1);
      if (e.key === 'ArrowRight' && pokemon) go(pokemon.id + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pokemon, go]);

  if (view === 'deck')
    return (
      <Suspense fallback={<p className="loading-note muted">{t('loading')}</p>}>
        <DeckBuilder onClose={() => setViewUrl('main')} />
      </Suspense>
    );

  return (
    <>
      <Header onOpenDeck={() => setViewUrl('deck')} />
      <main>
        <PokedexDevice
          pokemon={pokemon}
          shiny={shiny}
          getNames={getNames}
          onSearch={(q) => setQuery(q.toLowerCase())}
          onPrev={() => pokemon && go(pokemon.id - 1)}
          onNext={() => pokemon && go(pokemon.id + 1)}
          onRandom={() => go(Math.floor(Math.random() * MAX_POKEMON) + 1)}
          onToggleShiny={() => setShiny((s) => !s)}
        />

        {error && <p className="error-message">{t('notFound')}</p>}
        {loading && !pokemon && <p className="loading-note muted">{t('loading')}</p>}
        {pokemon && <DetailsCard pokemon={pokemon} shiny={shiny} onSelect={onSelect} />}

        <div className="col col--panels">
          <FavoritesPanel onSelect={onSelect} />
          <FilterPanel onSelect={onSelect} />
          <ComparePanel getNames={getNames} />
          <TeamPanel getNames={getNames} onSelect={onSelect} />
          <QuizPanel getNames={getNames} />
        </div>
      </main>
    </>
  );
}
