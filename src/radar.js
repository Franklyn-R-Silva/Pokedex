// Gera um gráfico de radar (SVG) dos 6 stats base — reutilizado no card de
// detalhes (1 Pokémon) e na comparação (até 4 Pokémon sobrepostos).
import { t } from './i18n.js';

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

function statValue(pokemon, key) {
  return pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
}

/**
 * @param {object[]} list  Pokémon(s) a plotar.
 * @param {string[]} colors  Cor de cada polígono (por índice).
 * @returns {string} markup SVG.
 */
export function radarSvg(list, colors) {
  const size = 240;
  const c = size / 2;
  const R = 82;
  const n = STAT_ORDER.length;
  const labels = t('statLabels');
  const maxStat = Math.max(100, ...list.flatMap((p) => p.stats.map((s) => s.base_stat)));

  const angle = (i) => ((i * 360) / n - 90) * (Math.PI / 180);
  const point = (r, i) => [c + r * Math.cos(angle(i)), c + r * Math.sin(angle(i))];
  const poly = (r, mapFn) =>
    STAT_ORDER.map((key, i) =>
      point(mapFn ? r * mapFn(key) : r, i)
        .map((v) => v.toFixed(1))
        .join(','),
    ).join(' ');

  let svg = `<svg viewBox="0 0 ${size} ${size}" class="radar" role="img" aria-label="radar">`;

  [0.25, 0.5, 0.75, 1].forEach((f) => {
    svg += `<polygon points="${poly(R * f)}" class="radar-grid" />`;
  });

  STAT_ORDER.forEach((key, i) => {
    const [x, y] = point(R, i);
    const [lx, ly] = point(R + 16, i);
    svg += `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="radar-axis" />`;
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="radar-label" text-anchor="middle" dominant-baseline="middle">${escapeHtml(labels[key])}</text>`;
  });

  list.forEach((pokemon, idx) => {
    const color = colors[idx % colors.length];
    const points = poly(R, (key) => statValue(pokemon, key) / maxStat);
    svg += `<polygon points="${points}" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-width="2" />`;
  });

  return svg + '</svg>';
}
