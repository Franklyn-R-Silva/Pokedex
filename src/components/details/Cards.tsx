import { useState, useEffect, useRef } from 'react';
import type { TcgCard } from '../../types';
import { fetchCards, isHolo } from '../../services/tcg';
import { applyTilt } from '../../features/tilt';
import { useModal } from '../../context/ModalContext';
import { useI18n } from '../../i18n/I18nContext';
import { CardDetail } from './CardDetail';

function TcgThumb({ card, onClick }: { card: TcgCard; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const holo = isHolo(card.rarity);
  useEffect(() => {
    if (holo && ref.current) applyTilt(ref.current, 10);
  }, [holo]);

  return (
    <button ref={ref} type="button" className={`tcg-card ${holo ? 'is-holo' : ''}`} onClick={onClick}>
      <img
        src={card.small}
        alt={`${card.name}${card.setName ? ` · ${card.setName}` : ''}`}
        loading="lazy"
      />
    </button>
  );
}

// Galeria de cartas do TCG (carregada sob demanda quando a aba abre).
export function Cards({ dexId }: { dexId: number }) {
  const { t } = useI18n();
  const { open } = useModal();
  const [cards, setCards] = useState<TcgCard[] | null>(null);

  useEffect(() => {
    let active = true;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setCards(null);
    void fetchCards(dexId).then((data) => active && setCards(data));
    return () => {
      active = false;
    };
  }, [dexId]);

  return (
    <div className="tab-panel is-active" data-panel="cards">
      <div className="details__cards">
        {cards === null && (
          <div className="tcg-loading">
            <span className="spinner" aria-hidden="true" />
            {t('loading')}
          </div>
        )}
        {cards?.length === 0 && <span className="muted">{t('cardsNone')}</span>}
        {cards && cards.length > 0 && (
          <>
            <p className="tcg-hint muted">{t('cardsHint')}</p>
            <div className="tcg-gallery">
              {cards.map((card) => (
                <TcgThumb key={card.id} card={card} onClick={() => open(<CardDetail card={card} />)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
