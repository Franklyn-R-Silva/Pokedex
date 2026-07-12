import type { Pokemon } from '../types';
import type { StatKey } from '../i18n/translations';
import { t } from '../i18n';

const STAT_ORDER: StatKey[] = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
];

const escapeHtml = (s: string): string => s.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

function statValue(pokemon: Pokemon, key: StatKey): number {
  return pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
}

/** Gera um gráfico de radar (SVG) dos 6 stats base — 1 polígono por Pokémon. */
export function radarSvg(list: Pokemon[], colors: string[]): string {
  const size = 240;
  const c = size / 2;
  const R = 82;
  const n = STAT_ORDER.length;
  const labels = t('statLabels');
  const maxStat = Math.max(100, ...list.flatMap((p) => p.stats.map((s) => s.base_stat)));

  const angle = (i: number): number => ((i * 360) / n - 90) * (Math.PI / 180);
  const point = (r: number, i: number): [number, number] => [
    c + r * Math.cos(angle(i)),
    c + r * Math.sin(angle(i)),
  ];
  const poly = (r: number, mapFn?: (key: StatKey) => number): string =>
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
