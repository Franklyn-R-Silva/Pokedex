import type { PokemonStat } from '../types';
import type { StatKey } from '../i18n/translations';
import { useI18n } from '../i18n/I18nContext';

// Lista de stats-base (barras normalizadas em 255), total e EV yield.
export function StatsList({ stats }: { stats: PokemonStat[] }) {
  const { t } = useI18n();
  const labels = t('statLabels');
  const total = stats.reduce((sum, s) => sum + s.base_stat, 0);
  const evs = stats
    .filter((s) => s.effort > 0)
    .map((s) => `${s.effort} ${labels[s.stat.name as StatKey] ?? s.stat.name}`);

  return (
    <ul className="details__stats">
      {stats.map(({ base_stat: base, stat }) => (
        <li className="stat" key={stat.name}>
          <span className="stat__label">{labels[stat.name as StatKey] ?? stat.name}</span>
          <div className="stat__bar">
            <div className="stat__fill" style={{ width: `${Math.min((base / 255) * 100, 100)}%` }} />
          </div>
          <span className="stat__value">{base}</span>
        </li>
      ))}
      <li className="stat stat--total">
        <span className="stat__label">{t('total')}</span>
        <span />
        <span className="stat__value">{total}</span>
      </li>
      {evs.length > 0 && (
        <li className="stat-ev">
          <strong>{t('evYield')}: </strong>
          {evs.join(', ')}
        </li>
      )}
    </ul>
  );
}
