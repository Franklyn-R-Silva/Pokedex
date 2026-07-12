import { getTypeColor } from '../domain/pokemonTypes';
import { typeIconUrl } from '../domain/typeIcons';

// Ícones de tipo renderizados via CSS mask → o símbolo fica branco sobre o
// círculo colorido do tipo, independente do fill interno do SVG. As URLs vêm
// de domain/typeIcons.ts (compartilhado com os widgets imperativos).

/** Só o símbolo (branco, mascarado) — para usar dentro de um círculo já colorido. */
export function TypeSymbol({ type, size = 16 }: { type: string; size?: number }) {
  const url = typeIconUrl(type);
  if (!url) return null;
  return (
    <span
      className="type-sym"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        // Aspas obrigatórias: o SVG inlined vira data URI com aspas simples,
        // que sem quoting quebra o url() do CSS.
        WebkitMaskImage: `url("${url}")`,
        maskImage: `url("${url}")`,
      }}
    />
  );
}

/** Círculo colorido do tipo com o símbolo branco dentro. */
export function TypeIcon({ type, size = 24 }: { type: string; size?: number }) {
  return (
    <span
      className="type-ic"
      style={{ background: getTypeColor(type), width: size, height: size }}
    >
      <TypeSymbol type={type} size={Math.round(size * 0.62)} />
    </span>
  );
}
