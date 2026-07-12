// Verso da carta (SVG, estilizado como uma carta Pokémon) — usado na face
// traseira do modelo 3D. Escalável e bundlado, sem depender de imagem externa.
export function CardBack() {
  return (
    <svg className="card-back" viewBox="0 0 240 336" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cb-swirl" cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#7fa8e0" />
          <stop offset="55%" stopColor="#3f63b5" />
          <stop offset="100%" stopColor="#22347a" />
        </radialGradient>
        <linearGradient id="cb-ball" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5a5a" />
          <stop offset="49%" stopColor="#e23b3b" />
          <stop offset="51%" stopColor="#f4f4f4" />
          <stop offset="100%" stopColor="#d8dde6" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="240" height="336" rx="14" fill="#20347d" />
      <rect x="10" y="10" width="220" height="316" rx="8" fill="url(#cb-swirl)" />

      {/* redemoinho */}
      <g stroke="#cfe0f7" strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round">
        <path d="M120 60 C 60 80, 44 150, 90 190" />
        <path d="M120 276 C 190 256, 200 180, 150 146" />
        <path d="M40 150 C 60 110, 120 96, 150 120" />
        <path d="M200 186 C 180 226, 120 240, 92 216" />
      </g>

      {/* pokébola */}
      <g transform="translate(120 168)">
        <circle r="54" fill="url(#cb-ball)" stroke="#1a1a1a" strokeWidth="6" />
        <rect x="-54" y="-4" width="108" height="8" fill="#1a1a1a" />
        <circle r="17" fill="#fff" stroke="#1a1a1a" strokeWidth="6" />
        <circle r="7" fill="#e8eef8" stroke="#9fb4d8" strokeWidth="2" />
      </g>

      {/* wordmark estilizado */}
      <text x="120" y="46" textAnchor="middle" className="card-back__word">
        Pokémon
      </text>
      <text
        x="120"
        y="300"
        textAnchor="middle"
        className="card-back__word"
        transform="rotate(180 120 292)"
      >
        Pokémon
      </text>
    </svg>
  );
}
