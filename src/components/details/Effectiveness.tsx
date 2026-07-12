import { useState, useEffect } from 'react';
import type { PokemonType, Effectiveness as Eff } from '../../types';
import type { Translation } from '../../i18n/translations';
import { fetchEffectiveness } from '../../services/pokeapi';
import { getTypeColor, getTypeLabel } from '../../domain/pokemonTypes';
import { useI18n } from '../../i18n/I18nContext';
import { TypeSymbol } from '../TypeIcon';

function suffix(m: number): string {
  if (m === 4) return ' ×4';
  if (m === 0.25) return ' ×¼';
  if (m === 0.5) return ' ×½';
  return '';
}

// Fraquezas / resistências / imunidades (relações de dano combinadas).
export function Effectiveness({ types }: { types: PokemonType[] }) {
  const { t, lang } = useI18n();
  const [eff, setEff] = useState<Eff | null>(null);

  useEffect(() => {
    let active = true;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setEff(null);
    void fetchEffectiveness(types).then((data) => active && setEff(data));
    return () => {
      active = false;
    };
  }, [types]);

  if (!eff) return <div className="details__effectiveness" />;

  const group = (
    labelKey: 'weaknesses' | 'resistances' | 'immunities',
    names: string[],
    mults?: number[],
  ) =>
    names.length > 0 && (
      <div className="eff-group" key={labelKey}>
        <div className="eff-group__label">{t(labelKey as keyof Translation) as string}</div>
        <div className="eff-badges">
          {names.map((name, i) => (
            <span className="type-badge" style={{ backgroundColor: getTypeColor(name) }} key={name}>
              <TypeSymbol type={name} size={14} />
              {getTypeLabel(name, lang) + (mults ? suffix(mults[i]) : '')}
            </span>
          ))}
        </div>
      </div>
    );

  return (
    <div className="details__effectiveness">
      {group(
        'weaknesses',
        eff.weaknesses.map((w) => w.name),
        eff.weaknesses.map((w) => w.multiplier),
      )}
      {group(
        'resistances',
        eff.resistances.map((w) => w.name),
        eff.resistances.map((w) => w.multiplier),
      )}
      {group('immunities', eff.immunities)}
    </div>
  );
}
