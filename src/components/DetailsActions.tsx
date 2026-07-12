import type { Pokemon } from '../types';
import { getStaticImage, getAnimatedGif } from '../services/sprites';
import { downloadImage } from '../services/download';
import { useI18n } from '../i18n/I18nContext';
import { useFavorites } from '../context/FavoritesContext';

// Ações do card: favoritar e baixar PNG/GIF.
export function DetailsActions({ pokemon, shiny }: { pokemon: Pokemon; shiny: boolean }) {
  const { t } = useI18n();
  const { isFav, toggle } = useFavorites();
  const fav = isFav(pokemon.id);
  const png = getStaticImage(pokemon, shiny);
  const gif = getAnimatedGif(pokemon, shiny);
  const baseName = shiny ? `${pokemon.name}-shiny` : pokemon.name;

  return (
    <div className="details__actions">
      <button
        className={`btn-favorite ${fav ? 'is-active' : ''}`}
        type="button"
        onClick={() => toggle({ id: pokemon.id, name: pokemon.name })}
      >
        {fav ? t('favorited') : t('favorite')}
      </button>
      <button
        className="btn-download btn-download--png"
        type="button"
        disabled={!png}
        onClick={() => void downloadImage(png, baseName)}
      >
        ⬇ PNG
      </button>
      <button
        className="btn-download btn-download--gif"
        type="button"
        disabled={!gif}
        title={gif ? '' : t('noGif')}
        onClick={() => void downloadImage(gif, `${baseName}-animado`)}
      >
        ⬇ GIF
      </button>
    </div>
  );
}
