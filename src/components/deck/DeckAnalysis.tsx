import type { DeckEntry } from '../../domain/deck';
import { analyzeDeck } from '../../domain/deck';
import { useI18n } from '../../i18n/I18nContext';
import { dl, issueText } from './labels';
import { DeckRadar } from './DeckRadar';

const COLORS = { pokemon: '#ef5350', trainer: '#42a5f5', energy: '#66bb6a' };
const ICON = { ok: '✔', warn: '⚠', error: '✖' };

// Rosca SVG de composição (Pokémon/Treinador/Energia).
function Donut({ p, tr, e }: { p: number; tr: number; e: number }) {
  const sum = p + tr + e;
  const total = sum || 1;
  const R = 46;
  const C = 2 * Math.PI * R;
  const segs = [
    { v: p, color: COLORS.pokemon },
    { v: tr, color: COLORS.trainer },
    { v: e, color: COLORS.energy },
  ];
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="deck-donut" width="120" height="120">
      <circle cx="60" cy="60" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
      {segs.map((s, i) => {
        const len = (s.v / total) * C;
        const el = (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 60 60)"
          />
        );
        offset += len;
        return el;
      })}
      <text x="60" y="64" textAnchor="middle" className="deck-donut__total">
        {sum}
      </text>
    </svg>
  );
}

export function DeckAnalysis({ entries }: { entries: DeckEntry[] }) {
  const { lang } = useI18n();
  const a = analyzeDeck(entries);
  const maxCost = Math.max(1, ...a.costCurve);

  return (
    <div className="deck-analysis">
      <div className="deck-score" data-grade={a.grade}>
        <span className="deck-score__grade">{a.grade}</span>
        <div>
          <span className="deck-score__label">{dl(lang, 'score')}</span>
          <span className="deck-score__value">{a.score}/100</span>
        </div>
      </div>

      <div className="deck-legality">
        <span className={`deck-format ${a.standardLegal ? 'is-legal' : 'is-illegal'}`}>
          {a.standardLegal ? '✔' : '✖'} Standard
        </span>
        <span className={`deck-format ${a.expandedLegal ? 'is-legal' : 'is-illegal'}`}>
          {a.expandedLegal ? '✔' : '✖'} Expanded
        </span>
        {a.illegalStandard > 0 && (
          <span className="deck-format__note muted">
            {a.illegalStandard} {lang === 'pt' ? 'fora de Standard' : 'not Standard-legal'}
          </span>
        )}
      </div>

      {a.strengths.length > 0 && (
        <div className="deck-chart deck-chart--radar">
          <h4>{dl(lang, 'strengths')}</h4>
          <DeckRadar data={a.strengths} lang={lang} />
        </div>
      )}

      <div className="deck-charts">
        <div className="deck-chart">
          <h4>{dl(lang, 'composition')}</h4>
          <Donut p={a.pokemon} tr={a.trainer} e={a.energy} />
          <div className="deck-legend">
            <span>
              <i style={{ background: COLORS.pokemon }} /> {dl(lang, 'pokemon')} {a.pokemon}
            </span>
            <span>
              <i style={{ background: COLORS.trainer }} /> {dl(lang, 'trainer')} {a.trainer}
            </span>
            <span>
              <i style={{ background: COLORS.energy }} /> {dl(lang, 'energy')} {a.energy}
            </span>
          </div>
        </div>

        <div className="deck-chart">
          <h4>{dl(lang, 'energyCurve')}</h4>
          <div className="deck-bars">
            {a.costCurve.map((v, cost) => (
              <div className="deck-bar" key={cost}>
                <div
                  className="deck-bar__fill"
                  style={{ height: `${(v / maxCost) * 100}%` }}
                  title={`${v}`}
                />
                <span className="deck-bar__label">{cost === 4 ? '4+' : cost}</span>
              </div>
            ))}
          </div>
          <p className="deck-basics muted">
            {dl(lang, 'basics')}: <strong>{a.basics}</strong>
          </p>
        </div>
      </div>

      <h4 className="deck-missing-title">{dl(lang, 'whatsMissing')}</h4>
      <ul className="deck-issues">
        {a.issues.map((issue, i) => (
          <li className={`deck-issue deck-issue--${issue.level}`} key={i}>
            <span className="deck-issue__icon">{ICON[issue.level]}</span>
            {issueText(lang, issue.code, issue.value)}
          </li>
        ))}
      </ul>

      {a.tips.length > 0 && (
        <>
          <h4 className="deck-missing-title">💡 {dl(lang, 'expertTips')}</h4>
          <ul className="deck-issues">
            {a.tips.map((tip, i) => (
              <li className={`deck-issue deck-issue--${tip.level}`} key={i}>
                <span className="deck-issue__icon">{tip.level === 'ok' ? '✔' : '💡'}</span>
                {issueText(lang, tip.code, tip.value)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
