import { useState, useEffect } from 'react';
import type { Pokemon } from '../../types';
import {
  buildFighter,
  computeDamage,
  playHit,
  playCry,
  type Fighter,
  type BattleMove,
} from '../../features/battle';
import { getStaticImage } from '../../services/sprites';
import { getTypeColor, getTypeLabel } from '../../domain/pokemonTypes';
import { useI18n } from '../../i18n/I18nContext';

interface Props {
  you: Pokemon;
  foe: Pokemon;
  foeLabel: string;
  onEnd: (won: boolean) => void;
}

// Batalha por turnos do Modo Aventura (encontro selvagem / ginásio).
// Reaproveita as fórmulas e o som do mini-jogo de batalha.
export function AdventureBattle({ you, foe, foeLabel, onEnd }: Props) {
  const { t, lang } = useI18n();
  const [f, setF] = useState<{ you: Fighter; foe: Fighter } | null>(null);
  const [yHp, setYHp] = useState(0);
  const [oHp, setOHp] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([buildFighter(you), buildFighter(foe)]).then(([y, o]) => {
      if (!active) return;
      setF({ you: y, foe: o });
      setYHp(y.maxHp);
      setOHp(o.maxHp);
      setLog([t('battleYourTurn')]);
    });
    return () => {
      active = false;
    };
  }, [you, foe, t]);

  if (!f) return <div className="tcg-loading"><span className="spinner" aria-hidden="true" />{t('loading')}</div>;

  const addLog = (m: string) => setLog((l) => [m, ...l].slice(0, 4));
  const eff = (mult: number) =>
    mult === 0 ? ` ${t('battleImmune')}` : mult > 1 ? ` ${t('battleSuper')}` : mult < 1 ? ` ${t('battleWeak')}` : '';

  const round = (move: BattleMove) => {
    if (busy || over) return;
    setBusy(true);
    // Você ataca.
    const r1 = computeDamage(f.you, f.foe, move);
    const newO = Math.max(0, oHp - r1.dmg);
    setOHp(newO);
    playHit(r1.mult);
    addLog(`${f.you.data.name} → ${getTypeLabel(move.type, lang)} (${r1.dmg})${eff(r1.mult)}`);
    if (newO <= 0) {
      playCry(f.foe.data.cries?.latest);
      setOver(true);
      setBusy(false);
      setTimeout(() => onEnd(true), 900);
      return;
    }
    // Oponente revida (melhor golpe).
    const fm = f.foe.moves.reduce((b, m) =>
      (f.you.takes[m.type] ?? 1) * m.power > (f.you.takes[b.type] ?? 1) * b.power ? m : b,
    );
    const r2 = computeDamage(f.foe, f.you, fm);
    const newY = Math.max(0, yHp - r2.dmg);
    setYHp(newY);
    playHit(r2.mult);
    addLog(`${f.foe.data.name} → ${getTypeLabel(fm.type, lang)} (${r2.dmg})${eff(r2.mult)}`);
    if (newY <= 0) {
      playCry(f.you.data.cries?.latest);
      setOver(true);
      setBusy(false);
      setTimeout(() => onEnd(false), 900);
      return;
    }
    setBusy(false);
  };

  const bar = (hp: number, max: number, color: string) => (
    <div className="battle-hp">
      <div
        className={`battle-hp__fill ${hp / max <= 0.25 ? 'is-low' : ''}`}
        style={{ width: `${(hp / max) * 100}%`, background: color }}
      />
    </div>
  );

  return (
    <div className="adv-battle">
      <div className="battle-arena">
        <div className="battle-side">
          <span className="battle-side__role">{foeLabel}</span>
          <span className="battle-side__name">{f.foe.data.name}</span>
          <img className="battle-side__img" src={getStaticImage(f.foe.data)} alt={f.foe.data.name} />
          {bar(oHp, f.foe.maxHp, getTypeColor(f.foe.data.types[0]?.type.name ?? 'normal'))}
          <span className="battle-hp__text">{Math.ceil(oHp)}/{f.foe.maxHp}</span>
        </div>
        <div className="battle-vs">VS</div>
        <div className="battle-side">
          <span className="battle-side__role">{t('battleYou')}</span>
          <span className="battle-side__name">{f.you.data.name}</span>
          <img className="battle-side__img" src={getStaticImage(f.you.data)} alt={f.you.data.name} />
          {bar(yHp, f.you.maxHp, getTypeColor(f.you.data.types[0]?.type.name ?? 'normal'))}
          <span className="battle-hp__text">{Math.ceil(yHp)}/{f.you.maxHp}</span>
        </div>
      </div>

      {!over && (
        <div className="battle-moves">
          {f.you.moves.map((m, i) => (
            <button
              key={i}
              type="button"
              className="battle-move"
              style={{ background: getTypeColor(m.type) }}
              disabled={busy}
              onClick={() => round(m)}
            >
              {getTypeLabel(m.type, lang)}
            </button>
          ))}
        </div>
      )}

      <div className="battle-log">
        {log.map((l, i) => (
          <p className="battle-log__line" key={i}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
