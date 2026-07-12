import { useState } from 'react';
import { useDeck } from '../../hooks/useDeck';
import { deckSize, DECK_SIZE } from '../../domain/deck';
import { META_DECKS } from '../../domain/metaDecks';
import { searchCards } from '../../services/tcg';
import { useI18n } from '../../i18n/I18nContext';
import { dl } from './labels';
import { Catalog } from './Catalog';
import { DeckList } from './DeckList';
import { DeckAnalysis } from './DeckAnalysis';

type MobileTab = 'catalog' | 'deck' | 'analysis';

// View dedicada do construtor de deck (catálogo | deck | análise).
export function DeckBuilder({ onClose }: { onClose: () => void }) {
  const { lang } = useI18n();
  const { entries, add, addMany, remove, clear } = useDeck();
  const [mobileTab, setMobileTab] = useState<MobileTab>('deck');
  const [building, setBuilding] = useState(false);
  const size = deckSize(entries);

  // Carrega um arquétipo do meta buscando cada carta pelo nome na API.
  const loadMeta = async (id: string) => {
    const template = META_DECKS.find((d) => d.id === id);
    if (!template || building) return;
    setBuilding(true);
    clear();
    for (const { query, count } of template.cards) {
      const { cards } = await searchCards({ name: query });
      if (cards[0]) addMany(cards[0], count);
    }
    setBuilding(false);
  };

  return (
    <div className="deck-builder">
      <header className="deck-header">
        <button className="deck-back" type="button" onClick={onClose}>
          {dl(lang, 'back')}
        </button>
        <h2 className="deck-title">{dl(lang, 'title')}</h2>
        <span className={`deck-count ${size === DECK_SIZE ? 'is-full' : ''}`}>
          {size} / {DECK_SIZE}
        </span>
        <button className="deck-clear" type="button" onClick={clear}>
          {dl(lang, 'clear')}
        </button>
      </header>

      <div className="deck-meta">
        <span className="deck-meta__label">{dl(lang, 'meta')}</span>
        {META_DECKS.map((d) => (
          <button
            key={d.id}
            type="button"
            className="deck-meta__btn"
            disabled={building}
            onClick={() => void loadMeta(d.id)}
          >
            {d.name}
          </button>
        ))}
        {building && <span className="muted">{dl(lang, 'buildingMeta')}</span>}
      </div>

      <div className="deck-mobile-tabs">
        {(['catalog', 'deck', 'analysis'] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={mobileTab === tab ? 'is-active' : ''}
            onClick={() => setMobileTab(tab)}
          >
            {dl(lang, tab)}
          </button>
        ))}
      </div>

      <div className="deck-body">
        <section className={`deck-col deck-col--catalog ${mobileTab === 'catalog' ? 'is-active' : ''}`}>
          <Catalog onAdd={add} />
        </section>
        <section className={`deck-col deck-col--deck ${mobileTab === 'deck' ? 'is-active' : ''}`}>
          <DeckList entries={entries} onAdd={add} onRemove={remove} />
        </section>
        <section className={`deck-col deck-col--analysis ${mobileTab === 'analysis' ? 'is-active' : ''}`}>
          <DeckAnalysis entries={entries} />
        </section>
      </div>
    </div>
  );
}
