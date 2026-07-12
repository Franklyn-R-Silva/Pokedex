import { useState, useEffect, Fragment } from 'react';
import type { RefItem } from '../../types';
import { fetchEvolutionChain, fetchEncounters } from '../../services/pokeapi';
import { getArtworkById } from '../../services/sprites';
import { formatEvolution, titleize } from '../../domain/pokemonInfo';
import { useI18n } from '../../i18n/I18nContext';

interface EvolutionProps {
  speciesUrl: string;
  encountersUrl: string;
  onSelect: (nameOrId: string | number) => void;
}

export function Evolution({ speciesUrl, encountersUrl, onSelect }: EvolutionProps) {
  const { t, lang } = useI18n();
  const [chain, setChain] = useState<RefItem[] | null>(null);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setChain(null);
    void fetchEvolutionChain(speciesUrl).then((data) => active && setChain(data));
    return () => {
      active = false;
    };
  }, [speciesUrl]);

  useEffect(() => {
    let active = true;
    void fetchEncounters(encountersUrl).then((data) => active && setLocations(data));
    return () => {
      active = false;
    };
  }, [encountersUrl]);

  return (
    <div className="tab-panel is-active" data-panel="evo">
      <div className="details__evolution">
        {chain && chain.length <= 1 && <span className="muted">{t('noEvolutions')}</span>}
        {chain?.map(({ name, id, detail }, index) => {
          const condition = formatEvolution(detail, lang);
          return (
            <Fragment key={name}>
              <button className="evo-item" type="button" onClick={() => onSelect(name)}>
                <img src={getArtworkById(id)} alt={name} loading="lazy" />
                <span>{name}</span>
                {condition && <small className="evo-cond">{condition}</small>}
              </button>
              {index < chain.length - 1 && <span className="evo-arrow">→</span>}
            </Fragment>
          );
        })}
      </div>

      <div className="details__locations">
        <h2 className="section-title">{t('locations')}</h2>
        {locations.length === 0 ? (
          <span className="muted">{t('noLocations')}</span>
        ) : (
          <div className="moves-chips">
            {locations.map((loc) => (
              <span className="move-chip" key={loc}>
                {titleize(loc)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
