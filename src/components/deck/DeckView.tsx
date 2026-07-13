import { useEffect } from 'react';
import type { DeckEntry } from '../../domain/deck';
import { deckSize, DECK_SIZE } from '../../domain/deck';
import type { Lang } from '../../types';
import { dl } from './labels';

// Visualização do deck como grade de cartas (imagem grande + quantidade),
// no estilo das listas de deck (ex.: LigaPokémon). Overlay em tela cheia.
export function DeckView({
  entries,
  lang,
  onClose,
}: {
  entries: DeckEntry[];
  lang: Lang;
  onClose: () => void;
}) {
  const size = deckSize(entries);

  // Esc fecha; trava o scroll do fundo enquanto aberto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="deckview" role="dialog" aria-modal="true" aria-label={dl(lang, 'viewDeck')}>
      <div className="deckview__bar">
        <button className="deck-back" type="button" onClick={onClose}>
          ✕ {dl(lang, 'close')}
        </button>
        <h3 className="deckview__title">{dl(lang, 'viewDeck')}</h3>
        <span className={`deck-count ${size === DECK_SIZE ? 'is-full' : ''}`}>
          {size} / {DECK_SIZE}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="muted deckview__empty">{dl(lang, 'empty')}</p>
      ) : (
        <div className="deckview__grid">
          {entries.map((e) => (
            <div className="deckview__card" key={e.card.id} title={`${e.card.name} · ${e.card.rarity}`}>
              <img src={e.card.large || e.card.small} alt={e.card.name} loading="lazy" />
              <span className="deckview__qty">{e.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
