// Mini-jogo de batalha por turnos entre dois Pokémon do time.
// Usa os stats-base + efetividade de tipo (PokéAPI) para calcular o dano —
// não depende de nenhuma API nova. O jogador escolhe o ataque a cada turno.
import type { Pokemon } from '../types';
import { fetchEffectiveness } from '../services/pokeapi';
import { getStaticImage } from '../services/sprites';
import { getTypeColor, getTypeLabel } from '../domain/pokemonTypes';
import { t, getLang } from '../i18n';

const LEVEL = 50;

interface BattleMove {
  type: string;
  power: number;
}

interface Fighter {
  data: Pokemon;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  speed: number;
  moves: BattleMove[];
  takes: Record<string, number>; // multiplicador ao ser atingido por cada tipo
}

interface BattleOptions {
  modal: HTMLElement;
  content: HTMLElement;
  getTeam: () => Pokemon[];
  show: (modal: HTMLElement) => void;
}

export interface BattleControls {
  open: () => void;
}

function statOf(data: Pokemon, name: string): number {
  return data.stats.find((s) => s.stat.name === name)?.base_stat ?? 50;
}

async function buildFighter(data: Pokemon): Promise<Fighter> {
  const hp = statOf(data, 'hp');
  const types = data.types.map((tp) => tp.type.name);

  // Um golpe por tipo do Pokémon (STAB implícito) + um golpe Normal de apoio.
  const moves: BattleMove[] = types.map((type) => ({ type, power: 65 }));
  if (!types.includes('normal')) moves.push({ type: 'normal', power: 50 });

  const eff = await fetchEffectiveness(data.types);
  const takes: Record<string, number> = {};
  eff.weaknesses.forEach((w) => (takes[w.name] = w.multiplier));
  eff.resistances.forEach((r) => (takes[r.name] = r.multiplier));
  eff.immunities.forEach((name) => (takes[name] = 0));

  return {
    data,
    maxHp: 2 * hp + 110,
    hp: 2 * hp + 110,
    atk: statOf(data, 'attack'),
    def: statOf(data, 'defense'),
    speed: statOf(data, 'speed'),
    moves: moves.slice(0, 4),
    takes,
  };
}

function computeDamage(
  attacker: Fighter,
  defender: Fighter,
  move: BattleMove,
): { dmg: number; mult: number } {
  const mult = defender.takes[move.type] ?? 1;
  const base = ((((2 * LEVEL) / 5 + 2) * move.power * attacker.atk) / defender.def / 50 + 2) * mult;
  const variance = 0.85 + Math.random() * 0.15;
  return { dmg: Math.max(mult === 0 ? 0 : 1, Math.floor(base * variance)), mult };
}

export function setupBattle({ modal, content, getTeam, show }: BattleOptions): BattleControls {
  const lang = getLang;

  function el<T extends HTMLElement>(tag: string, className = '', text = ''): T {
    const node = document.createElement(tag) as T;
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // --- Tela de seleção -------------------------------------------------------
  function renderSelect(): void {
    content.innerHTML = '';
    const team = getTeam();

    const title = el('h2', 'battle-title', t('battleTitle'));
    content.appendChild(title);

    if (team.length < 2) {
      content.appendChild(el('p', 'muted battle-note', t('battleNeedTwo')));
      return;
    }

    let you: Pokemon | null = null;
    const hint = el('p', 'battle-note', t('battlePickYou'));
    content.appendChild(hint);

    const grid = el('div', 'battle-pick');
    team.forEach((pokemon) => {
      const btn = el<HTMLButtonElement>('button', 'battle-pick__item');
      btn.type = 'button';
      const img = el<HTMLImageElement>('img');
      img.src = getStaticImage(pokemon);
      img.alt = pokemon.name;
      img.loading = 'lazy';
      const name = el('span', 'battle-pick__name', pokemon.name);
      btn.append(img, name);
      btn.addEventListener('click', () => {
        if (!you) {
          you = pokemon;
          btn.classList.add('is-you');
          btn.disabled = true;
          hint.textContent = t('battlePickFoe');
        } else if (pokemon.id !== you.id) {
          void startBattle(you, pokemon);
        }
      });
      grid.appendChild(btn);
    });
    content.appendChild(grid);
  }

  // --- Batalha ---------------------------------------------------------------
  async function startBattle(youData: Pokemon, foeData: Pokemon): Promise<void> {
    content.innerHTML = `<p class="battle-note muted">${t('loading')}</p>`;
    const [you, foe] = await Promise.all([buildFighter(youData), buildFighter(foeData)]);
    renderArena(you, foe);
  }

  function hpBar(fighter: Fighter): { wrap: HTMLElement; fill: HTMLElement; text: HTMLElement } {
    const wrap = el('div', 'battle-hp');
    const fill = el('div', 'battle-hp__fill');
    fill.style.background = getTypeColor(fighter.data.types[0]?.type.name ?? 'normal');
    const text = el('span', 'battle-hp__text');
    wrap.append(fill);
    return { wrap, fill, text };
  }

  function renderArena(you: Fighter, foe: Fighter): void {
    content.innerHTML = '';
    content.appendChild(el('h2', 'battle-title', t('battleTitle')));

    const arena = el('div', 'battle-arena');
    const foeSide = sideCard(foe, t('battleFoe'));
    const vs = el('div', 'battle-vs', 'VS');
    const youSide = sideCard(you, t('battleYou'));
    arena.append(foeSide.card, vs, youSide.card);
    content.appendChild(arena);

    const log = el('div', 'battle-log');
    const moves = el('div', 'battle-moves');
    content.append(moves, log);

    const pushLog = (msg: string): void => {
      const line = el('p', 'battle-log__line', msg);
      log.prepend(line);
      while (log.childElementCount > 4) log.lastElementChild?.remove();
    };

    const paint = (side: typeof foeSide, f: Fighter): void => {
      const pct = Math.max(0, (f.hp / f.maxHp) * 100);
      side.fill.style.width = `${pct}%`;
      side.fill.classList.toggle('is-low', pct <= 25);
      side.hpText.textContent = `${Math.ceil(f.hp)}/${f.maxHp}`;
    };
    paint(foeSide, foe);
    paint(youSide, you);

    const effNote = (mult: number): string =>
      mult === 0
        ? ` ${t('battleImmune')}`
        : mult > 1
          ? ` ${t('battleSuper')}`
          : mult < 1
            ? ` ${t('battleWeak')}`
            : '';

    let over = false;

    const attack = (attacker: Fighter, defender: Fighter, move: BattleMove): boolean => {
      const { dmg, mult } = computeDamage(attacker, defender, move);
      defender.hp -= dmg;
      const label = getTypeLabel(move.type, lang());
      pushLog(`${attacker.data.name} → ${label} (${dmg})${effNote(mult)}`);
      if (defender.hp <= 0) {
        defender.hp = 0;
        return true; // desmaiou
      }
      return false;
    };

    const foeMove = (): BattleMove =>
      // IA simples: escolhe o golpe com maior multiplicador contra você.
      foe.moves.reduce((best, m) =>
        (you.takes[m.type] ?? 1) * m.power > (you.takes[best.type] ?? 1) * best.power ? m : best,
      );

    const finish = (winner: Fighter, loser: Fighter): void => {
      over = true;
      moves.innerHTML = '';
      pushLog(`${loser.data.name} ${t('battleFainted')}`);
      const banner = el('p', 'battle-result', `🏆 ${winner.data.name} ${t('battleWins')}`);
      const again = el<HTMLButtonElement>('button', 'battle-again', t('battleAgain'));
      again.type = 'button';
      again.addEventListener('click', renderSelect);
      moves.append(banner, again);
    };

    const round = (yourMove: BattleMove): void => {
      if (over) return;
      // Ordem por velocidade (empate: você primeiro).
      const youFirst = you.speed >= foe.speed;
      const order: Array<[Fighter, Fighter, BattleMove, typeof foeSide]> = youFirst
        ? [
            [you, foe, yourMove, foeSide],
            [foe, you, foeMove(), youSide],
          ]
        : [
            [foe, you, foeMove(), youSide],
            [you, foe, yourMove, foeSide],
          ];

      for (const [atk, def, mv, defSide] of order) {
        const fainted = attack(atk, def, mv);
        paint(defSide, def);
        if (fainted) {
          finish(atk, def);
          break;
        }
      }
    };

    // Botões de ataque (os golpes do seu Pokémon).
    you.moves.forEach((move) => {
      const btn = el<HTMLButtonElement>('button', 'battle-move', getTypeLabel(move.type, lang()));
      btn.type = 'button';
      btn.style.background = getTypeColor(move.type);
      btn.addEventListener('click', () => round(move));
      moves.appendChild(btn);
    });

    pushLog(t('battleYourTurn'));
  }

  function sideCard(
    fighter: Fighter,
    role: string,
  ): { card: HTMLElement; fill: HTMLElement; hpText: HTMLElement } {
    const card = el('div', 'battle-side');
    const roleEl = el('span', 'battle-side__role', role);
    const name = el('span', 'battle-side__name', fighter.data.name);
    const img = el<HTMLImageElement>('img', 'battle-side__img');
    img.src = getStaticImage(fighter.data);
    img.alt = fighter.data.name;
    const bar = hpBar(fighter);
    card.append(roleEl, name, img, bar.wrap, bar.text);
    return { card, fill: bar.fill, hpText: bar.text };
  }

  return {
    open: () => {
      renderSelect();
      show(modal);
    },
  };
}
