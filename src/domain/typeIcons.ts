// URLs dos ícones de tipo (SVG silhueta, duiker101/pokemon-type-svg-icons, MIT)
// e helper de símbolo mascarado. Framework-agnóstico: usado tanto pelos
// componentes React (<TypeIcon>) quanto pelos widgets imperativos em features/.
//
// Import default de `.svg` no Vite resolve para a URL do asset (string) — mais
// confiável que import.meta.glob com query, que retornava o namespace do módulo.
import normal from '../assets/types/normal.svg';
import fighting from '../assets/types/fighting.svg';
import flying from '../assets/types/flying.svg';
import poison from '../assets/types/poison.svg';
import ground from '../assets/types/ground.svg';
import rock from '../assets/types/rock.svg';
import bug from '../assets/types/bug.svg';
import ghost from '../assets/types/ghost.svg';
import steel from '../assets/types/steel.svg';
import fire from '../assets/types/fire.svg';
import water from '../assets/types/water.svg';
import grass from '../assets/types/grass.svg';
import electric from '../assets/types/electric.svg';
import psychic from '../assets/types/psychic.svg';
import ice from '../assets/types/ice.svg';
import dragon from '../assets/types/dragon.svg';
import dark from '../assets/types/dark.svg';
import fairy from '../assets/types/fairy.svg';

const ICONS: Record<string, string> = {
  normal, fighting, flying, poison, ground, rock, bug, ghost, steel,
  fire, water, grass, electric, psychic, ice, dragon, dark, fairy,
};

export function typeIconUrl(type: string): string | undefined {
  return ICONS[type];
}

/** Cria o <span> do símbolo (branco, mascarado) para uso em DOM imperativo. */
export function typeSymbolEl(type: string, size = 14): HTMLElement | null {
  const url = typeIconUrl(type);
  if (!url) return null;
  const span = document.createElement('span');
  span.className = 'type-sym';
  span.setAttribute('aria-hidden', 'true');
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  // Aspas obrigatórias: SVG inlined vira data URI com aspas simples internas.
  span.style.setProperty('-webkit-mask-image', `url("${url}")`);
  span.style.setProperty('mask-image', `url("${url}")`);
  return span;
}
