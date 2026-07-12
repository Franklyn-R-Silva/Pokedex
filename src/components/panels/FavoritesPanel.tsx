import { useI18n } from '../../i18n/I18nContext';
import { useFavorites } from '../../context/FavoritesContext';

// Painel de favoritos: lista salva no localStorage, carregar e remover.
export function FavoritesPanel({ onSelect }: { onSelect: (nameOrId: string | number) => void }) {
  const { t } = useI18n();
  const { favorites, toggle } = useFavorites();

  return (
    <section className="favorites">
      <h2 className="favorites__title">{t('favoritesTitle')}</h2>
      <div className="favorites__list">
        {favorites.length === 0 ? (
          <span className="muted">{t('noFavorites')}</span>
        ) : (
          favorites.map((fav) => (
            <div className="favorite-chip" key={fav.id}>
              <button
                className="favorite-chip__load"
                type="button"
                onClick={() => onSelect(fav.name)}
              >
                #{fav.id} {fav.name}
              </button>
              <button
                className="favorite-chip__remove"
                type="button"
                aria-label={t('removeFavorite')}
                onClick={() => toggle(fav)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
