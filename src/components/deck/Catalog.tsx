import { useState, useEffect } from 'react';
import type { TcgCard } from '../../types';
import { searchCards } from '../../services/tcg';
import { useI18n } from '../../i18n/I18nContext';
import { useModal } from '../../context/ModalContext';
import { CardDetail } from '../details/CardDetail';
import { dl } from './labels';

const SUPERTYPES = ['', 'Pokémon', 'Trainer', 'Energy'] as const;
const TYPES = [
  'Grass',
  'Fire',
  'Water',
  'Lightning',
  'Psychic',
  'Fighting',
  'Darkness',
  'Metal',
  'Fairy',
  'Dragon',
  'Colorless',
];

// Catálogo: busca cartas (nome + supertipo + tipo) e adiciona ao deck no clique.
export function Catalog({ onAdd }: { onAdd: (card: TcgCard) => void }) {
  const { lang } = useI18n();
  const { open } = useModal();
  const [name, setName] = useState('');
  const [supertype, setSupertype] = useState('');
  const [type, setType] = useState('');
  const [cards, setCards] = useState<TcgCard[] | null>(null);

  useEffect(() => {
    let active = true;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setCards(null);
    const timer = setTimeout(() => {
      void searchCards({
        name,
        supertype: supertype || undefined,
        type: type || undefined,
      }).then((r) => active && setCards(r.cards));
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, supertype, type]);

  const labelFor = (st: string) =>
    st === '' ? dl(lang, 'all') : st === 'Pokémon' ? dl(lang, 'pokemon') : st === 'Trainer' ? dl(lang, 'trainer') : dl(lang, 'energy');

  return (
    <div className="deck-catalog">
      <input
        className="deck-search"
        type="search"
        placeholder={dl(lang, 'searchPlaceholder')}
        aria-label={dl(lang, 'searchPlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="deck-chips">
        {SUPERTYPES.map((st) => (
          <button
            key={st || 'all'}
            type="button"
            className={`deck-chip ${supertype === st ? 'is-active' : ''}`}
            onClick={() => setSupertype(st)}
          >
            {labelFor(st)}
          </button>
        ))}
      </div>
      <div className="deck-types">
        {TYPES.map((tp) => (
          <button
            key={tp}
            type="button"
            className={`deck-type ${type === tp ? 'is-active' : ''}`}
            onClick={() => setType(type === tp ? '' : tp)}
          >
            {tp}
          </button>
        ))}
      </div>
      <div className="deck-results">
        {cards === null && (
          <div className="tcg-loading">
            <span className="spinner" aria-hidden="true" />
            {dl(lang, 'loading')}
          </div>
        )}
        {cards?.length === 0 && <span className="muted">{dl(lang, 'noResults')}</span>}
        {cards?.map((card) => (
          <div className="deck-result-cell" key={card.id}>
            <button
              type="button"
              className="deck-result-card"
              title={`${card.name} · ${card.rarity}`}
              onClick={() => onAdd(card)}
            >
              <img src={card.small} alt={card.name} loading="lazy" />
            </button>
            <button
              type="button"
              className="deck-result-view"
              aria-label={lang === 'pt' ? 'Ver detalhes' : 'View details'}
              title={lang === 'pt' ? 'Ver detalhes' : 'View details'}
              onClick={() => open(<CardDetail card={card} onAdd={() => onAdd(card)} />)}
            >
              🔍
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
