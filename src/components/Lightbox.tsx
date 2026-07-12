import { useState } from 'react';
import type { Pokemon } from '../types';
import { getSpriteGallery } from '../services/sprites';

// Galeria de sprites (artwork, shiny, animado, frente/costas) no modal.
export function Lightbox({ pokemon }: { pokemon: Pokemon }) {
  const gallery = getSpriteGallery(pokemon);
  const [main, setMain] = useState(gallery[0]?.url ?? '');

  return (
    <>
      <img className="lightbox__img" src={main} alt={pokemon.name} />
      <div className="lightbox__thumbs">
        {gallery.map((item) => (
          <button
            key={item.url}
            type="button"
            className={`lightbox__thumb ${item.url === main ? 'is-active' : ''}`}
            onClick={() => setMain(item.url)}
          >
            <img src={item.url} alt={item.label} loading="lazy" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
