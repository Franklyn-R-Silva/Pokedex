import { useState, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, CSSProperties } from 'react';
import type { TcgCard } from '../../types';
import { rarityTier, formatPrice } from '../../services/tcg';
import { getTypeColor } from '../../domain/pokemonTypes';
import { useI18n } from '../../i18n/I18nContext';
import { CardBack } from './CardBack';

// Energias do TCG → tipos da PokéAPI (para reaproveitar as cores).
const TCG_TYPE: Record<string, string> = {
  colorless: 'normal',
  darkness: 'dark',
  metal: 'steel',
  lightning: 'electric',
};

const reduce =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Card 3D de verdade: frente (arte) + verso (SVG). Arraste para girar livre
// (como um personagem 3D), controle o zoom, gire ou vire a carta. O brilho
// holográfico e o efeito acompanham a rotação e mudam conforme a raridade.
function RotatingCard({ card }: { card: TcgCard }) {
  const [rot, setRot] = useState({ x: -8, y: 18 });
  const [zoom, setZoom] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const drag = useRef<{ px: number; py: number; rx: number; ry: number } | null>(null);
  const tier = rarityTier(card.rarity);

  const onDown = (e: ReactPointerEvent) => {
    drag.current = { px: e.clientX, py: e.clientY, rx: rot.x, ry: rot.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!drag.current || reduce) return;
    const d = drag.current;
    setRot({
      y: d.ry + (e.clientX - d.px) * 0.6, // giro livre (sem trava) → mostra o verso
      x: Math.max(-80, Math.min(80, d.rx - (e.clientY - d.py) * 0.6)),
    });
  };
  const onUp = () => (drag.current = null);

  const spin = () => {
    if (reduce) return;
    setSpinning(true);
    setRot((r) => ({ ...r, y: r.y + 360 }));
    window.setTimeout(() => setSpinning(false), 50);
  };
  const flip = () => setRot((r) => ({ x: 0, y: Math.round(r.y / 360) * 360 + (isBack(r.y) ? 0 : 180) }));
  const isBack = (y: number) => {
    const m = ((y % 360) + 360) % 360;
    return m > 90 && m < 270;
  };

  // Brilho segue o ângulo; intensidade do sheen no CSS por data-tier.
  const glare = 50 + Math.sin((rot.y * Math.PI) / 180) * 45;

  return (
    <div className="card3d" style={{ perspective: '1200px' }}>
      <div
        className={`card3d__stage ${spinning ? 'is-anim' : ''}`}
        style={{
          width: `${Math.round(200 * zoom)}px`,
          height: `${Math.round(279 * zoom)}px`,
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <div className="card3d__face card3d__face--front" data-tier={tier}>
          <img src={card.large} alt={card.name} draggable={false} />
          <span className="card3d__shine" style={{ '--gx': `${glare}%` } as CSSProperties} />
        </div>
        <div className="card3d__face card3d__face--back">
          <CardBack />
        </div>
      </div>

      <div className="card3d__controls">
        <button type="button" onClick={spin} aria-label="Girar 360°" title="Girar">
          🔄
        </button>
        <button type="button" onClick={flip} aria-label="Virar" title="Frente / verso">
          ⟳
        </button>
        <input
          type="range"
          className="card3d__zoom"
          min={0.7}
          max={1.8}
          step={0.05}
          value={zoom}
          aria-label="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

// Modal rico da carta: análise girável + conteúdo, raridade e preço.
export function CardDetail({ card }: { card: TcgCard }) {
  const { t } = useI18n();

  const meta = [
    card.setName,
    card.number && `Nº ${card.number}`,
    card.artist && `${t('cardBy')} ${card.artist}`,
  ].filter(Boolean);

  return (
    <div className="tcg-detail">
      <RotatingCard card={card} />
      <div className="tcg-detail__info">
        <h2 className="tcg-detail__name">{card.name}</h2>

        <div className="tcg-detail__badges">
          {card.rarity && (
            <span className="tcg-rarity" data-tier={rarityTier(card.rarity)}>
              {card.rarity}
            </span>
          )}
          {card.types.map((type) => (
            <span
              className="type-badge tcg-type"
              style={{ backgroundColor: getTypeColor(TCG_TYPE[type.toLowerCase()] ?? type.toLowerCase()) }}
              key={type}
            >
              {type}
            </span>
          ))}
          {card.hp && <span className="tcg-hp-badge">{card.hp} HP</span>}
        </div>

        {meta.length > 0 && <p className="tcg-detail__meta muted">{meta.join(' · ')}</p>}

        <div className="tcg-price">
          <span className="tcg-price__label">{t('cardPriceTitle')}</span>
          {card.priceUsd == null && card.priceEur == null ? (
            <span className="tcg-price__none muted">{t('cardNoPrice')}</span>
          ) : (
            <div className="tcg-price__row">
              {card.priceUsd != null && (
                <span className="tcg-price__value">
                  {formatPrice(card.priceUsd, 'USD')}
                  <small className="tcg-price__src"> TCGplayer</small>
                </span>
              )}
              {card.priceEur != null && (
                <span className="tcg-price__value tcg-price__value--eur">
                  {formatPrice(card.priceEur, 'EUR')}
                  <small className="tcg-price__src"> Cardmarket</small>
                </span>
              )}
            </div>
          )}
          {card.priceUpdated && (
            <span className="tcg-price__updated muted">
              {t('cardUpdated')} {card.priceUpdated}
            </span>
          )}
          {card.priceUrl && (
            <a className="tcg-price__buy" href={card.priceUrl} target="_blank" rel="noopener">
              {t('cardBuy')}
            </a>
          )}
        </div>

        {card.attacks.length > 0 && (
          <div className="tcg-attacks">
            <h3 className="tcg-section-title">{t('cardAttacks')}</h3>
            {card.attacks.map((atk, i) => (
              <div className="tcg-attack" key={`${atk.name}-${i}`}>
                <div className="tcg-attack__head">
                  <span className="tcg-attack__name">{atk.name}</span>
                  {atk.damage && <span className="tcg-attack__damage">{atk.damage}</span>}
                </div>
                {atk.cost.length > 0 && (
                  <span className="tcg-attack__cost muted">{atk.cost.join(' · ')}</span>
                )}
                {atk.text && <p className="tcg-attack__text">{atk.text}</p>}
              </div>
            ))}
          </div>
        )}

        {card.flavorText && <p className="tcg-detail__flavor">{card.flavorText}</p>}
      </div>
    </div>
  );
}
