import { useState, useEffect } from 'react';
import { MAX_POKEMON } from './services/pokeapi';
import { getTypeColor } from './domain/pokemonTypes';
import { useI18n } from './i18n/I18nContext';
import { usePokemon } from './hooks/usePokemon';
import { Header } from './components/Header';
import { PokedexDevice } from './components/PokedexDevice';
import { DetailsCard } from './components/DetailsCard';

function initialQuery(): string {
  const fromUrl = new URLSearchParams(window.location.search).get('pokemon');
  return fromUrl ?? '1';
}

export function App() {
  const { t } = useI18n();
  const [query, setQuery] = useState<string>(initialQuery);
  const [shiny, setShiny] = useState(false);
  const { pokemon, loading, error } = usePokemon(query);

  // Tema por tipo + URL + título sincronizados com o Pokémon atual.
  useEffect(() => {
    if (!pokemon) return;
    const primary = pokemon.types[0]?.type.name ?? 'normal';
    document.documentElement.style.setProperty('--type-color', getTypeColor(primary));
    const url = new URL(window.location.href);
    url.searchParams.set('pokemon', String(pokemon.id));
    window.history.replaceState({}, '', url);
    const nice = pokemon.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    document.title = `#${pokemon.id} ${nice} · Pokédex`;
  }, [pokemon]);

  const go = (id: number) => setQuery(String(Math.min(MAX_POKEMON, Math.max(1, id))));

  return (
    <>
      <Header />
      <main>
        <PokedexDevice
          pokemon={pokemon}
          shiny={shiny}
          onSearch={(q) => setQuery(q.toLowerCase())}
          onPrev={() => pokemon && go(pokemon.id - 1)}
          onNext={() => pokemon && go(pokemon.id + 1)}
          onRandom={() => go(Math.floor(Math.random() * MAX_POKEMON) + 1)}
          onToggleShiny={() => setShiny((s) => !s)}
        />

        {error && <p className="error-message">{t('notFound')}</p>}
        {loading && !pokemon && <p className="loading-note muted">{t('loading')}</p>}
        {pokemon && <DetailsCard pokemon={pokemon} />}

        <div className="col col--panels">
          <section className="panel">
            <p className="muted" style={{ padding: '8px' }}>
              🚧 Painéis (favoritos, filtro, comparar, time, quiz, batalha, cartas, deck) sendo
              migrados para React nas próximas fases.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
