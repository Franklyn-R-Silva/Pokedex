import type { DeckStrength } from '../../domain/deck';
import type { Lang } from '../../types';
import { strengthLabel } from './labels';

// Radar hexagonal das forças do deck (0–100 por eixo). Puro SVG, sem libs.
const CX = 120;
const CY = 104;
const R = 70;

function point(i: number, total: number, radius: number): [number, number] {
  const angle = -Math.PI / 2 + (i / total) * Math.PI * 2;
  return [CX + Math.cos(angle) * radius, CY + Math.sin(angle) * radius];
}

export function DeckRadar({ data, lang }: { data: DeckStrength[]; lang: Lang }) {
  const n = data.length;
  if (n === 0) return null;

  const rings = [0.25, 0.5, 0.75, 1];
  const grid = rings.map((f) =>
    data.map((_, i) => point(i, n, R * f).join(',')).join(' '),
  );
  const shape = data.map((s, i) => point(i, n, R * (s.value / 100)).join(',')).join(' ');

  return (
    <svg viewBox="0 0 240 210" className="deck-radar" role="img" aria-label={strengthLabel(lang, 'strengths')}>
      {/* anéis */}
      {grid.map((pts, i) => (
        <polygon key={i} points={pts} className="deck-radar__ring" />
      ))}
      {/* eixos */}
      {data.map((_, i) => {
        const [x, y] = point(i, n, R);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} className="deck-radar__axis" />;
      })}
      {/* área preenchida */}
      <polygon points={shape} className="deck-radar__area" />
      {/* vértices */}
      {data.map((s, i) => {
        const [x, y] = point(i, n, R * (s.value / 100));
        return <circle key={i} cx={x} cy={y} r={2.6} className="deck-radar__dot" />;
      })}
      {/* rótulos + valores */}
      {data.map((s, i) => {
        const [x, y] = point(i, n, R + 20);
        const anchor = x > CX + 6 ? 'start' : x < CX - 6 ? 'end' : 'middle';
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} className="deck-radar__label">
            <tspan>{strengthLabel(lang, s.key)}</tspan>
            <tspan x={x} dy="11" className="deck-radar__val">
              {s.value}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
