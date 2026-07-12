import { useState, useEffect } from 'react';
import type { TcgCard } from '../../types';
import type { Lang } from '../../types';
import { searchCards, formatPrice } from '../../services/tcg';
import { useI18n } from '../../i18n/I18nContext';
import { useModal } from '../../context/ModalContext';
import { CardDetail } from '../details/CardDetail';

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
const RARITIES = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Double Rare',
  'Ultra Rare',
  'Illustration Rare',
  'Special Illustration Rare',
  'Rare Secret',
];
const SORTS: { id: string; pt: string; en: string }[] = [
  { id: '-set.releaseDate', pt: 'Mais novas', en: 'Newest' },
  { id: 'name', pt: 'A–Z', en: 'A–Z' },
  { id: '-hp', pt: 'Maior HP', en: 'Highest HP' },
  { id: 'price', pt: 'Preço ↓', en: 'Price ↓' },
];
const PAGE_SIZE = 24;

const L = (lang: Lang, pt: string, en: string) => (lang === 'pt' ? pt : en);

// Navegador de cartas (estilo "Preços/Banco de cartas"): busca com filtros
// avançados, paginação e preço de mercado. Só frontend (Pokémon TCG API).
export function CardBrowser({ onClose }: { onClose: () => void }) {
  const { lang } = useI18n();
  const { open } = useModal();
  const [name, setName] = useState('');
  const [supertype, setSupertype] = useState('');
  const [type, setType] = useState('');
  const [rarity, setRarity] = useState('');
  const [sort, setSort] = useState('-set.releaseDate');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ cards: TcgCard[]; totalCount: number } | null>(null);

  // Reseta a página ao mudar qualquer filtro.
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setPage(1);
  }, [name, supertype, type, rarity, sort]);

  useEffect(() => {
    let active = true;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setData(null);
    const timer = setTimeout(() => {
      void searchCards({
        name,
        supertype: supertype || undefined,
        type: type || undefined,
        rarity: rarity || undefined,
        orderBy: sort === 'price' ? '-set.releaseDate' : sort,
        page,
        pageSize: PAGE_SIZE,
      }).then((r) => {
        if (!active) return;
        const cards =
          sort === 'price'
            ? [...r.cards].sort((a, b) => (b.priceUsd ?? 0) - (a.priceUsd ?? 0))
            : r.cards;
        setData({ cards, totalCount: r.totalCount });
      });
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, supertype, type, rarity, sort, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE)) : 1;

  return (
    <div className="cardbrowser">
      <header className="cardbrowser__head">
        <button className="deck-back" type="button" onClick={onClose}>
          {L(lang, '← Voltar', '← Back')}
        </button>
        <h2 className="deck-title">{L(lang, '🃟 Cartas', '🃟 Cards')}</h2>
        {data && (
          <span className="cardbrowser__count">
            {data.totalCount.toLocaleString()} {L(lang, 'cartas', 'cards')}
          </span>
        )}
      </header>

      <div className="cardbrowser__filters">
        <input
          className="deck-search"
          type="search"
          placeholder={L(lang, 'Buscar carta pelo nome…', 'Search cards by name…')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="cardbrowser__selects">
          <select value={supertype} onChange={(e) => setSupertype(e.target.value)} aria-label="Tipo">
            <option value="">{L(lang, 'Todos os tipos', 'All supertypes')}</option>
            <option value="Pokémon">Pokémon</option>
            <option value="Trainer">{L(lang, 'Treinador', 'Trainer')}</option>
            <option value="Energy">{L(lang, 'Energia', 'Energy')}</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Elemento">
            <option value="">{L(lang, 'Todos elementos', 'All types')}</option>
            {TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)} aria-label="Raridade">
            <option value="">{L(lang, 'Todas raridades', 'All rarities')}</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {L(lang, s.pt, s.en)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data === null ? (
        <div className="tcg-loading">
          <span className="spinner" aria-hidden="true" />
          {L(lang, 'Carregando…', 'Loading…')}
        </div>
      ) : data.cards.length === 0 ? (
        <p className="muted cardbrowser__empty">{L(lang, 'Nenhuma carta encontrada.', 'No cards found.')}</p>
      ) : (
        <>
          <div className="cardbrowser__grid">
            {data.cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`cardbrowser__card ${card.priceUsd ? '' : 'no-price'}`}
                onClick={() => open(<CardDetail card={card} />)}
              >
                <img src={card.small} alt={card.name} loading="lazy" />
                <span className="cardbrowser__name">{card.name}</span>
                <span className="cardbrowser__price">
                  {card.priceUsd != null ? formatPrice(card.priceUsd, 'USD') : '—'}
                </span>
              </button>
            ))}
          </div>

          <div className="cardbrowser__pager">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹ {L(lang, 'Anterior', 'Prev')}
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              {L(lang, 'Próxima', 'Next')} ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}
