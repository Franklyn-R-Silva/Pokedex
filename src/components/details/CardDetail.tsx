import { useState, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TcgCard } from '../../types';
import { rarityTier, formatPrice } from '../../services/tcg';
import { getTypeColor } from '../../domain/pokemonTypes';
import { useI18n } from '../../i18n/I18nContext';

// Energias do TCG → tipos da PokéAPI (para reaproveitar as cores).
const TCG_TYPE: Record<string, string> = {
  colorless: 'normal',
  darkness: 'dark',
  metal: 'steel',
  lightning: 'electric',
};

const reduce =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Carta girável para análise de perto: arraste para rotacionar em 3D + botão
// de giro completo. O brilho holográfico acompanha a rotação.
function RotatingCard({ card }: { card: TcgCard }) {
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [spinning, setSpinning] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const onDown = (e: ReactPointerEvent) => {
    drag.current = { x: e.clientX - rot.y, y: e.clientY + rot.x };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!drag.current || reduce) return;
    setRot({
      y: Math.max(-180, Math.min(180, e.clientX - drag.current.x)),
      x: Math.max(-80, Math.min(80, drag.current.y - e.clientY)),
    });
  };
  const onUp = () => (drag.current = null);

  const spin = () => {
    if (reduce) return;
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 900);
  };

  const glare = 50 + rot.y / 3.6;

  return (
    <div className="tcg-rotate">
      <div
        className={`tcg-rotate__inner ${spinning ? 'is-spinning' : ''}`}
        style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <img className="tcg-rotate__img" src={card.large} alt={card.name} />
        <span className="tcg-rotate__glare" style={{ '--gx': `${glare}%` } as React.CSSProperties} />
      </div>
      <button type="button" className="tcg-rotate__spin" onClick={spin} aria-label="Girar carta">
        🔄
      </button>
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
