import type { TcgCard } from '../../types';
import type { DeckEntry } from '../../domain/deck';
import { useI18n } from '../../i18n/I18nContext';
import { dl } from './labels';

interface DeckListProps {
  entries: DeckEntry[];
  onAdd: (card: TcgCard) => void;
  onRemove: (id: string) => void;
}

const GROUPS: { key: string; label: 'pokemon' | 'trainer' | 'energy' }[] = [
  { key: 'Pokémon', label: 'pokemon' },
  { key: 'Trainer', label: 'trainer' },
  { key: 'Energy', label: 'energy' },
];

export function DeckList({ entries, onAdd, onRemove }: DeckListProps) {
  const { lang } = useI18n();

  if (entries.length === 0) {
    return <p className="muted deck-empty">{dl(lang, 'empty')}</p>;
  }

  return (
    <div className="deck-list">
      {GROUPS.map(({ key, label }) => {
        const rows = entries.filter((e) => (e.card.supertype || 'Pokémon') === key);
        if (rows.length === 0) return null;
        const total = rows.reduce((s, e) => s + e.count, 0);
        return (
          <div className="deck-group" key={key}>
            <h3 className="deck-group__title">
              {dl(lang, label)} ({total})
            </h3>
            {rows.map((entry) => (
              <div className="deck-row" key={entry.card.id}>
                <img src={entry.card.small} alt={entry.card.name} loading="lazy" />
                <span className="deck-row__name">{entry.card.name}</span>
                <div className="deck-stepper">
                  <button type="button" aria-label="-" onClick={() => onRemove(entry.card.id)}>
                    −
                  </button>
                  <span className="deck-stepper__count">{entry.count}</span>
                  <button type="button" aria-label="+" onClick={() => onAdd(entry.card)}>
                    ＋
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
