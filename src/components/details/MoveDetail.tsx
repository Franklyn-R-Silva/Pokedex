import { useState, useEffect } from 'react';
import type { MoveData } from '../../types';
import type { Translation } from '../../i18n/translations';
import { fetchMove } from '../../services/pokeapi';
import { getTypeColor, getTypeLabel } from '../../domain/pokemonTypes';
import { titleize } from '../../domain/pokemonInfo';
import { useI18n } from '../../i18n/I18nContext';
import { useTranslatedText } from '../../hooks/useTranslatedText';
import { TypeSymbol } from '../TypeIcon';

// Conteúdo do modal de golpe (tipo/poder/precisão/PP/categoria/efeito) — /move.
export function MoveDetail({ url, name }: { url: string; name: string }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<MoveData | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void fetchMove(url).then((d) => active && setData(d));
    return () => {
      active = false;
    };
  }, [url]);

  const rawEffect =
    data?.effect_entries.find((e) => e.language.name === 'en')?.short_effect ?? '';
  const effect = useTranslatedText(rawEffect.replace(/\$effect_chance/g, '—'));

  if (data === undefined) return <span className="muted">{t('loading')}</span>;
  if (data === null) return <span className="muted">{t('notFound')}</span>;

  const cell = (label: string, value: string) => (
    <div className="about-cell">
      <span className="about-label">{label}</span>
      <span className="about-value">{value}</span>
    </div>
  );

  return (
    <>
      <h2 className="detail-title">{titleize(name)}</h2>
      <span className="type-badge" style={{ backgroundColor: getTypeColor(data.type.name) }}>
        <TypeSymbol type={data.type.name} size={15} />
        {getTypeLabel(data.type.name, lang)}
      </span>
      <div className="detail-grid">
        {cell(t('moveCategory'), t(data.damage_class.name as keyof Translation) as string)}
        {cell(t('movePower'), data.power != null ? String(data.power) : '—')}
        {cell(t('moveAccuracy'), data.accuracy != null ? `${data.accuracy}%` : '—')}
        {cell(t('movePp'), data.pp != null ? String(data.pp) : '—')}
      </div>
      {effect && <p className="detail-effect">{effect}</p>}
    </>
  );
}
