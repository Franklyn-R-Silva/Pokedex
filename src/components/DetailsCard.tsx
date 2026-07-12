import { useState } from 'react';
import type { Pokemon } from '../types';
import { getTypeColor } from '../domain/pokemonTypes';
import { radarSvg } from '../features/radar';
import { useI18n } from '../i18n/I18nContext';
import { TypeBadge } from './TypeBadge';
import { StatsList } from './StatsList';

type Tab = 'about' | 'stats';

// Card de detalhes: tipos + abas (Sobre/Stats). As demais abas (golpes,
// evolução, cartas) entram nas próximas fases da migração.
export function DetailsCard({ pokemon }: { pokemon: Pokemon }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('about');
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
          <button
            className={`tab ${tab === 'about' ? 'is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={tab === 'about'}
            onClick={() => setTab('about')}
          >
            {t('about')}
          </button>
          <button
            className={`tab ${tab === 'stats' ? 'is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={tab === 'stats'}
            onClick={() => setTab('stats')}
          >
            {t('stats')}
          </button>
        </div>

        {tab === 'about' && (
          <div className="tab-panel is-active" data-panel="about">
            <div className="details__meta">
              <div>
                <span className="label">{t('height')}</span>
                <span className="height">{(pokemon.height / 10).toFixed(1)} m</span>
              </div>
              <div>
                <span className="label">{t('weight')}</span>
                <span className="weight">{(pokemon.weight / 10).toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="tab-panel is-active" data-panel="stats">
            <div
              className="details__radar"
              dangerouslySetInnerHTML={{ __html: radarSvg([pokemon], [getTypeColor(primary)]) }}
            />
            <StatsList stats={pokemon.stats} />
          </div>
        )}
      </section>
    </div>
  );
}
