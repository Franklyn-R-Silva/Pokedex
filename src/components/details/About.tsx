import type { Pokemon, Species } from '../../types';
import type { Translation } from '../../i18n/translations';
import { getFlavorText, getGenus } from '../../services/pokeapi';
import { getArtworkById } from '../../services/sprites';
import { aboutRows, speciesFlags, titleize } from '../../domain/pokemonInfo';
import { useI18n } from '../../i18n/I18nContext';
import { useTranslatedText } from '../../hooks/useTranslatedText';
import { Abilities } from './Abilities';

interface AboutProps {
  pokemon: Pokemon;
  species: Species | null;
  onSelect: (nameOrId: string | number) => void;
}

export function About({ pokemon, species, onSelect }: AboutProps) {
  const { t, lang } = useI18n();
  const genus = useTranslatedText(species ? getGenus(species, 'en') : '');
  const description = useTranslatedText(species ? getFlavorText(species, 'en') : '');
  const forms = species?.varieties.filter((v) => !v.is_default) ?? [];

  return (
    <div className="tab-panel is-active" data-panel="about">
      {genus && <p className="details__genus">{genus}</p>}
      {description && <p className="details__description">{description}</p>}

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

      {species && (
        <>
          <div className="details__flags">
            {speciesFlags(species).map((flag) => (
              <span className={`flag flag--${flag}`} key={flag}>
                {t(flag as keyof Translation) as string}
              </span>
            ))}
          </div>

          <div className="details__about">
            {aboutRows(pokemon, species, t('genderless'), lang).map(({ key, value }) => (
              <div className="about-cell" key={key}>
                <span className="about-label">{t(key as keyof Translation) as string}</span>
                <span className="about-value">{value}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {pokemon.held_items.length > 0 && (
        <div className="details__held">
          <strong>{t('heldItems')}: </strong>
          {pokemon.held_items.map((h) => titleize(h.item.name)).join(', ')}
        </div>
      )}

      {forms.length > 0 && (
        <div className="details__forms">
          <h2 className="section-title">{t('forms')}</h2>
          <div className="forms-grid">
            {forms.map((variety) => {
              const id = Number(/\/(\d+)\/?$/.exec(variety.pokemon.url)?.[1]);
              return (
                <button
                  className="evo-item"
                  type="button"
                  key={variety.pokemon.name}
                  onClick={() => onSelect(variety.pokemon.name)}
                >
                  {id > 0 && (
                    <img src={getArtworkById(id)} alt={variety.pokemon.name} loading="lazy" />
                  )}
                  <span>{titleize(variety.pokemon.name)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Abilities abilities={pokemon.abilities} />
    </div>
  );
}
