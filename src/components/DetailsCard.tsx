import { useState } from 'react';
import type { Pokemon } from '../types';
import { getTypeColor } from '../domain/pokemonTypes';
import { radarSvg } from '../features/radar';
import { useI18n } from '../i18n/I18nContext';
import { useSpecies } from '../hooks/useSpecies';
import { TypeBadge } from './TypeBadge';
import { StatsList } from './StatsList';
import { About } from './details/About';
import { Effectiveness } from './details/Effectiveness';
import { Evolution } from './details/Evolution';
import { Moves } from './details/Moves';
import { Cards } from './details/Cards';

type Tab = 'about' | 'stats' | 'moves' | 'evo' | 'cards';

const TABS: { id: Tab; label: keyof import('../i18n/translations').Translation }[] = [
  { id: 'about', label: 'about' },
  { id: 'stats', label: 'stats' },
  { id: 'moves', label: 'moves' },
  { id: 'evo', label: 'evolution' },
  { id: 'cards', label: 'cards' },
];

interface DetailsCardProps {
  pokemon: Pokemon;
  onSelect: (nameOrId: string | number) => void;
}

export function DetailsCard({ pokemon, onSelect }: DetailsCardProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('about');
  const species = useSpecies(pokemon.species.url);
  const primary = pokemon.types[0]?.type.name ?? 'normal';

  return (
    <div className="col col--details">
      <section className="details is-visible">
        <div className="details__types">
          {pokemon.types.map((tp) => (
            <TypeBadge type={tp.type.name} key={tp.type.name} />
          ))}
        </div>

        <div className="tabs" role="tablist">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={`tab ${tab === id ? 'is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
            >
              {t(label) as string}
            </button>
          ))}
        </div>

        {tab === 'about' && <About pokemon={pokemon} species={species} onSelect={onSelect} />}

        {tab === 'stats' && (
          <div className="tab-panel is-active" data-panel="stats">
            <div
              className="details__radar"
              dangerouslySetInnerHTML={{ __html: radarSvg([pokemon], [getTypeColor(primary)]) }}
            />
            <StatsList stats={pokemon.stats} />
            <Effectiveness types={pokemon.types} />
          </div>
        )}

        {tab === 'moves' && <Moves pokemon={pokemon} />}

        {tab === 'evo' && (
          <Evolution
            speciesUrl={pokemon.species.url}
            encountersUrl={pokemon.location_area_encounters}
            onSelect={onSelect}
          />
        )}

        {tab === 'cards' && <Cards dexId={pokemon.id} />}
      </section>
    </div>
  );
}
