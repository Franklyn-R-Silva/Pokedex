import { useRef, useEffect, useState, useCallback } from 'react';
import type { Pokemon } from '../../types';
import { fetchPokemon, MAX_POKEMON } from '../../services/pokeapi';
import { getStaticImage } from '../../services/sprites';
import { useI18n } from '../../i18n/I18nContext';
import { AdventureBattle } from './AdventureBattle';

// Mapa: T=árvore W=água G=grama alta Y=ginásio .=chão P=início
const MAP = [
  'TTTTTTTTTTTTTTTT',
  'T..............T',
  'T..GGGG...TTT..T',
  'T..GGGG...T.Y..T',
  'T..GGGG...T....T',
  'T.........WWW..T',
  'T..P......WWW..T',
  'T.........WWW..T',
  'T..GGGGGG.....T',
  'T..GGGGGG..TT..T',
  'T.............T',
  'TTTTTTTTTTTTTTTT',
].map((r) => r.padEnd(16, 'T'));

const TS = 34;
const COLS = 16;
const ROWS = MAP.length;
const BLOCKED = new Set(['T', 'W']);
const KEY = 'pokedex-adventure';

type Battle = { you: Pokemon; foe: Pokemon; kind: 'wild' | 'gym'; label: string };

function startPos(): { x: number; y: number } {
  for (let y = 0; y < ROWS; y++) {
    const x = MAP[y].indexOf('P');
    if (x >= 0) return { x, y };
  }
  return { x: 1, y: 1 };
}

export function Adventure({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef(startPos());
  const leadRef = useRef<Pokemon | null>(null);
  const leadImg = useRef<HTMLImageElement | null>(null);
  const busyRef = useRef(false);
  const [, force] = useState(0);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [badge, setBadge] = useState(() => localStorage.getItem(`${KEY}-badge`) === '1');
  const [msg, setMsg] = useState('');

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tile = MAP[y][x];
        // chão base
        ctx.fillStyle = '#dcecc4';
        ctx.fillRect(x * TS, y * TS, TS, TS);
        if (tile === 'G') {
          ctx.fillStyle = '#7cbf5a';
          ctx.fillRect(x * TS, y * TS, TS, TS);
          ctx.fillStyle = '#5fa03e';
          ctx.font = `${TS * 0.7}px serif`;
          ctx.fillText('🌱', x * TS + 4, y * TS + TS - 6);
        } else if (tile === 'T') {
          ctx.font = `${TS * 0.85}px serif`;
          ctx.fillText('🌳', x * TS + 2, y * TS + TS - 4);
        } else if (tile === 'W') {
          ctx.fillStyle = '#6fb7e8';
          ctx.fillRect(x * TS, y * TS, TS, TS);
        } else if (tile === 'Y') {
          ctx.fillStyle = '#c98b46';
          ctx.fillRect(x * TS + 3, y * TS + 3, TS - 6, TS - 6);
          ctx.font = `${TS * 0.7}px serif`;
          ctx.fillText(badge ? '🏆' : '🏛️', x * TS + 4, y * TS + TS - 7);
        }
      }
    }
    // jogador (sprite do líder ou círculo)
    const { x, y } = posRef.current;
    if (leadImg.current?.complete && leadImg.current.naturalWidth) {
      ctx.drawImage(leadImg.current, x * TS + 1, y * TS - 2, TS - 2, TS - 2);
    } else {
      ctx.fillStyle = '#e23b3b';
      ctx.beginPath();
      ctx.arc(x * TS + TS / 2, y * TS + TS / 2, TS / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [badge]);

  // Carrega o líder do time salvo (ou Pikachu) e a arte.
  useEffect(() => {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem('pokedex-team') ?? '[]') as string[];
      } catch {
        return [];
      }
    })();
    void fetchPokemon(saved[0] ?? 'pikachu').then((p) => {
      if (!p) return;
      leadRef.current = p;
      const img = new Image();
      img.src = getStaticImage(p);
      img.onload = redraw;
      leadImg.current = img;
      redraw();
    });
    // posição salva
    try {
      const s = JSON.parse(localStorage.getItem(`${KEY}-pos`) ?? 'null') as { x: number; y: number } | null;
      if (s) posRef.current = s;
    } catch {
      /* ignore */
    }
    redraw();
  }, [redraw]);

  const encounter = useCallback(
    async (kind: 'wild' | 'gym') => {
      if (!leadRef.current || busyRef.current) return;
      busyRef.current = true;
      setMsg(kind === 'gym' ? t('advGym') : t('advWild'));
      const foeId = kind === 'gym' ? 208 /* Steelix */ : Math.floor(Math.random() * MAX_POKEMON) + 1;
      const foe = await fetchPokemon(foeId);
      setMsg('');
      if (foe) {
        setBattle({
          you: leadRef.current,
          foe,
          kind,
          label: kind === 'gym' ? t('advLeader') : t('advWildFoe'),
        });
      } else {
        busyRef.current = false;
      }
    },
    [t],
  );

  // Movimento por teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (battle || busyRef.current) return;
      const d: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };
      const mv = d[e.key];
      if (!mv) return;
      e.preventDefault();
      const nx = posRef.current.x + mv[0];
      const ny = posRef.current.y + mv[1];
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return;
      const tile = MAP[ny][nx];
      if (BLOCKED.has(tile)) return;
      posRef.current = { x: nx, y: ny };
      localStorage.setItem(`${KEY}-pos`, JSON.stringify(posRef.current));
      redraw();
      if (tile === 'Y') void encounter('gym');
      else if (tile === 'G' && Math.random() < 0.18) void encounter('wild');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [battle, encounter, redraw]);

  const endBattle = (won: boolean) => {
    const wasGym = battle?.kind === 'gym';
    setBattle(null);
    busyRef.current = false;
    if (won && wasGym) {
      localStorage.setItem(`${KEY}-badge`, '1');
      setBadge(true);
    }
    setMsg(won ? t('advWon') : t('advLost'));
    force((n) => n + 1);
    setTimeout(() => setMsg(''), 2500);
    redraw();
  };

  return (
    <div className="adventure">
      <header className="adventure__head">
        <button className="deck-back" type="button" onClick={onClose}>
          {lang === 'pt' ? '← Voltar' : '← Back'}
        </button>
        <h2 className="deck-title">{lang === 'pt' ? '🎮 Aventura' : '🎮 Adventure'}</h2>
        {badge && <span className="adventure__badge">🏅 {lang === 'pt' ? 'Insígnia' : 'Badge'}</span>}
      </header>

      <p className="adventure__hint muted">
        {lang === 'pt'
          ? 'Use as setas/WASD para andar. Entre na grama 🌱 para encontrar Pokémon; enfrente o ginásio 🏛️.'
          : 'Use arrows/WASD to walk. Step into the grass 🌱 for wild encounters; challenge the gym 🏛️.'}
      </p>

      <div className="adventure__stage">
        <canvas ref={canvasRef} width={COLS * TS} height={ROWS * TS} className="adventure__canvas" />
        {msg && <div className="adventure__msg">{msg}</div>}
      </div>

      {battle && (
        <div className="adventure__battle">
          <AdventureBattle you={battle.you} foe={battle.foe} foeLabel={battle.label} onEnd={endBattle} />
        </div>
      )}
    </div>
  );
}
