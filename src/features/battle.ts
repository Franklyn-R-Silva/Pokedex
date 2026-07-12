// Mini-jogo de batalha por turnos: você escolhe um campeão do time e enfrenta
// uma sequência de inimigos (fases). Os inimigos podem ser aleatórios ou
// escolhidos por nome. Dano vem dos stats-base + efetividade de tipo (PokéAPI)
// — sem API nova. O jogador escolhe o ataque a cada turno.
import type { Pokemon } from '../types';
import { fetchEffectiveness, fetchPokemon, MAX_POKEMON } from '../services/pokeapi';
import { getStaticImage } from '../services/sprites';
import { getTypeColor, getTypeLabel } from '../domain/pokemonTypes';
import { t, getLang } from '../i18n';

const LEVEL = 50;
const MAX_FOES = 6;
const HEAL_BETWEEN = 0.3; // recupera 30% do HP entre as fases

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

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
  takes: Record<string, number>;
}

interface Side {
  card: HTMLElement;
  fill: HTMLElement;
  hpText: HTMLElement;
}

interface BattleOptions {
  modal: HTMLElement;
  content: HTMLElement;
  getTeam: () => Pokemon[];
  getNames: () => string[];
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
  const moves: BattleMove[] = types.map((type) => ({ type, power: 65 }));
  if (!types.includes('normal')) moves.push({ type: 'normal', power: 50 });

  const eff = await fetchEffectiveness(data.types);
  const takes: Record<string, number> = {};
  eff.weaknesses.forEach((w) => (takes[w.name] = w.multiplier));
  eff.resistances.forEach((r) => (takes[r.name] = r.multiplier));
  eff.immunities.forEach((name) => (takes[name] = 0));

  const maxHp = 2 * hp + 110;
  return {
    data,
    maxHp,
    hp: maxHp,
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

// --- Som da batalha (WebAudio no golpe + cry real ao desmaiar) -------------
let audioCtx: AudioContext | null = null;
function beep(from: number, to: number, dur: number, vol: number): void {
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx ??= new AC();
    const c = audioCtx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(from, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.start();
    o.stop(c.currentTime + dur);
  } catch {
    /* áudio indisponível */
  }
}
function playHit(mult: number): void {
  beep(mult > 1 ? 380 : 200, 60, mult > 1 ? 0.22 : 0.16, mult > 1 ? 0.16 : 0.12);
}
function playCry(url: string | null | undefined): void {
  if (!url) return;
  try {
    const a = new Audio(url);
    a.volume = 0.35;
    void a.play().catch(() => undefined);
  } catch {
    /* ignore */
  }
}

export function setupBattle({ modal, content, getTeam, getNames, show }: BattleOptions): BattleControls {
  const lang = getLang;

  function el<T extends HTMLElement>(tag: string, className = '', text = ''): T {
    const node = document.createElement(tag) as T;
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // --- Tela de preparação ----------------------------------------------------
  function renderSetup(): void {
    content.innerHTML = '';
    content.appendChild(el('h2', 'battle-title', t('battleTitle')));

    const team = getTeam();
    if (team.length === 0) {
      content.appendChild(el('p', 'muted battle-note', t('battleNeedTwo')));
      return;
    }

    let champion: Pokemon | null = null;
    const foes: Pokemon[] = [];

    // 1) Escolha do campeão (seu time).
    content.appendChild(el('p', 'battle-note', t('battlePickYou')));
    const youGrid = el('div', 'battle-pick');
    team.forEach((pokemon) => {
      const btn = el<HTMLButtonElement>('button', 'battle-pick__item');
      btn.type = 'button';
      const img = el<HTMLImageElement>('img');
      img.src = getStaticImage(pokemon);
      img.alt = pokemon.name;
      img.loading = 'lazy';
      btn.append(img, el('span', 'battle-pick__name', pokemon.name));
      btn.addEventListener('click', () => {
        champion = pokemon;
        youGrid.querySelectorAll('.battle-pick__item').forEach((b) => b.classList.remove('is-you'));
        btn.classList.add('is-you');
        updateStart();
      });
      youGrid.appendChild(btn);
    });
    content.appendChild(youGrid);

    // 2) Montagem do time inimigo (aleatório ou por nome) → fases.
    content.appendChild(el('h3', 'battle-subtitle', t('battleFoesTitle')));
    const controls = el('div', 'battle-foe-controls');

    const randomBtn = el<HTMLButtonElement>('button', 'battle-mini', t('battleRandom'));
    randomBtn.type = 'button';
    randomBtn.addEventListener('click', () => void addRandomFoe());

    const listId = 'battle-foe-names';
    const datalist = el<HTMLDataListElement>('datalist');
    datalist.id = listId;
    getNames()
      .slice(0, 1025)
      .forEach((name) => {
        const opt = document.createElement('option');
        opt.value = name;
        datalist.appendChild(opt);
      });

    const nameInput = el<HTMLInputElement>('input', 'battle-foe-input');
    nameInput.type = 'search';
    nameInput.placeholder = t('battleAddFoe');
    nameInput.setAttribute('aria-label', t('battleAddFoe'));
    nameInput.setAttribute('list', listId);
    nameInput.autocomplete = 'off';

    const addBtn = el<HTMLButtonElement>('button', 'battle-mini', '＋');
    addBtn.type = 'button';
    addBtn.addEventListener('click', () => void addNamedFoe());

    const addNamedFoe = async (): Promise<void> => {
      const name = nameInput.value.trim().toLowerCase();
      if (!name || foes.length >= MAX_FOES) return;
      const data = await fetchPokemon(name);
      if (data) {
        foes.push(data);
        nameInput.value = '';
        renderFoes();
      }
    };
    nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void addNamedFoe();
      }
    });

    const addRandomFoe = async (): Promise<void> => {
      if (foes.length >= MAX_FOES) return;
      randomBtn.disabled = true;
      const data = await fetchPokemon(Math.floor(Math.random() * MAX_POKEMON) + 1);
      randomBtn.disabled = false;
      if (data) {
        foes.push(data);
        renderFoes();
      }
    };

    controls.append(randomBtn, nameInput, addBtn, datalist);
    content.appendChild(controls);

    const foesList = el('div', 'battle-foes');
    content.appendChild(foesList);

    const startBtn = el<HTMLButtonElement>('button', 'battle-start', t('battleStart'));
    startBtn.type = 'button';
    startBtn.disabled = true;
    startBtn.addEventListener('click', () => {
      if (champion && foes.length) void startGauntlet(champion, foes.slice());
    });
    content.appendChild(startBtn);

    function updateStart(): void {
      startBtn.disabled = !champion || foes.length === 0;
    }

    function renderFoes(): void {
      foesList.innerHTML = '';
      foes.forEach((foe, i) => {
        const chip = el('div', 'battle-foe-chip');
        const order = el('span', 'battle-foe-chip__order', String(i + 1));
        const img = el<HTMLImageElement>('img');
        img.src = getStaticImage(foe);
        img.alt = foe.name;
        img.loading = 'lazy';
        const remove = el<HTMLButtonElement>('button', 'battle-foe-chip__remove', '✕');
        remove.type = 'button';
        remove.setAttribute('aria-label', t('battleSwap'));
        remove.addEventListener('click', () => {
          foes.splice(i, 1);
          renderFoes();
        });
        chip.append(order, img, remove);
        foesList.appendChild(chip);
      });
      randomBtn.disabled = foes.length >= MAX_FOES;
      updateStart();
    }
  }

  // --- Gauntlet (fases) ------------------------------------------------------
  async function startGauntlet(championData: Pokemon, foesData: Pokemon[]): Promise<void> {
    content.innerHTML = `<p class="battle-note muted">${t('loading')}</p>`;
    const champion = await buildFighter(championData);
    let phase = 0;

    const nextPhase = async (): Promise<void> => {
      // Cura parcial entre as fases (recompensa por avançar).
      if (phase > 0) champion.hp = Math.min(champion.maxHp, champion.hp + champion.maxHp * HEAL_BETWEEN);
      const foe = await buildFighter(foesData[phase]);
      renderArena(champion, foe, {
        phase: phase + 1,
        total: foesData.length,
        onWin: () => {
          phase += 1;
          if (phase < foesData.length) void nextPhase();
          else showVictory(champion);
        },
      });
    };

    void nextPhase();
  }

  function showVictory(champion: Fighter): void {
    content.innerHTML = '';
    content.appendChild(el('h2', 'battle-title', t('battleTitle')));
    const img = el<HTMLImageElement>('img', 'battle-side__img battle-champion');
    img.src = getStaticImage(champion.data);
    img.alt = champion.data.name;
    content.appendChild(img);
    content.appendChild(el('p', 'battle-result', `🏆 ${champion.data.name} ${t('battleChampion')}`));
    const again = el<HTMLButtonElement>('button', 'battle-again', t('battleAgain'));
    again.type = 'button';
    again.addEventListener('click', renderSetup);
    content.appendChild(again);
  }

  // --- Arena de uma fase -----------------------------------------------------
  function renderArena(
    you: Fighter,
    foe: Fighter,
    meta: { phase: number; total: number; onWin: () => void },
  ): void {
    content.innerHTML = '';
    content.appendChild(el('h2', 'battle-title', t('battleTitle')));
    content.appendChild(
      el('p', 'battle-phase', `${t('battlePhase')} ${meta.phase}/${meta.total}`),
    );

    const arena = el('div', 'battle-arena');
    const foeSide = sideCard(foe, t('battleFoe'));
    const youSideCard = sideCard(you, t('battleYou'));
    arena.append(foeSide.card, el('div', 'battle-vs', 'VS'), youSideCard.card);
    content.appendChild(arena);

    const moves = el('div', 'battle-moves');
    const log = el('div', 'battle-log');
    content.append(moves, log);

    const pushLog = (msg: string): void => {
      const line = el('p', 'battle-log__line', msg);
      log.prepend(line);
      while (log.childElementCount > 4) log.lastElementChild?.remove();
    };

    const paint = (side: Side, f: Fighter): void => {
      const pct = Math.max(0, (f.hp / f.maxHp) * 100);
      side.fill.style.width = `${pct}%`;
      side.fill.classList.toggle('is-low', pct <= 25);
      side.hpText.textContent = `${Math.ceil(Math.max(0, f.hp))}/${f.maxHp}`;
    };
    paint(foeSide, foe);
    paint(youSideCard, you);

    const effNote = (mult: number): string =>
      mult === 0
        ? ` ${t('battleImmune')}`
        : mult > 1
          ? ` ${t('battleSuper')}`
          : mult < 1
            ? ` ${t('battleWeak')}`
            : '';

    let over = false;
    let busy = false;

    const floatDamage = (card: HTMLElement, dmg: number, mult: number): void => {
      const dmgEl = el('span', 'battle-damage', `-${dmg}`);
      if (mult > 1) dmgEl.classList.add('is-super');
      card.appendChild(dmgEl);
      setTimeout(() => dmgEl.remove(), 700);
    };

    const performAttack = async (
      attacker: Fighter,
      defender: Fighter,
      move: BattleMove,
      attackerSide: Side,
      defenderSide: Side,
      youIsAttacker: boolean,
    ): Promise<boolean> => {
      attackerSide.card.classList.add(youIsAttacker ? 'is-lunge-up' : 'is-lunge-down');
      await wait(170);
      attackerSide.card.classList.remove('is-lunge-up', 'is-lunge-down');

      const { dmg, mult } = computeDamage(attacker, defender, move);
      defender.hp -= dmg;
      playHit(mult);
      defenderSide.card.classList.add('is-hit');
      floatDamage(defenderSide.card, dmg, mult);
      paint(defenderSide, defender);
      pushLog(`${attacker.data.name} → ${getTypeLabel(move.type, lang())} (${dmg})${effNote(mult)}`);
      await wait(320);
      defenderSide.card.classList.remove('is-hit');
      return defender.hp <= 0;
    };

    const foeMove = (): BattleMove =>
      foe.moves.reduce((best, m) =>
        (you.takes[m.type] ?? 1) * m.power > (you.takes[best.type] ?? 1) * best.power ? m : best,
      );

    const finish = (winner: Fighter, loser: Fighter, youWon: boolean): void => {
      over = true;
      moves.innerHTML = '';
      playCry(loser.data.cries?.latest); // grito do Pokémon que desmaiou
      pushLog(`${loser.data.name} ${t('battleFainted')}`);
      if (youWon) {
        const banner = el('p', 'battle-result', `✅ ${winner.data.name} ${t('battleWins')}`);
        moves.appendChild(banner);
        setTimeout(meta.onWin, 900);
      } else {
        const banner = el('p', 'battle-result', `💀 ${loser.data.name} ${t('battleFainted')}`);
        const again = el<HTMLButtonElement>('button', 'battle-again', t('battleAgain'));
        again.type = 'button';
        again.addEventListener('click', renderSetup);
        moves.append(banner, again);
      }
    };

    const round = async (yourMove: BattleMove): Promise<void> => {
      if (over || busy) return;
      busy = true;
      moves.querySelectorAll('button').forEach((b) => (b.disabled = true));

      const youFirst = you.speed >= foe.speed;
      const steps: Array<[Fighter, Fighter, BattleMove, Side, Side, boolean]> = youFirst
        ? [
            [you, foe, yourMove, youSideCard, foeSide, true],
            [foe, you, foeMove(), foeSide, youSideCard, false],
          ]
        : [
            [foe, you, foeMove(), foeSide, youSideCard, false],
            [you, foe, yourMove, youSideCard, foeSide, true],
          ];

      for (const [atk, def, mv, atkSide, defSide, youIsAtk] of steps) {
        const fainted = await performAttack(atk, def, mv, atkSide, defSide, youIsAtk);
        if (fainted) {
          finish(atk, def, youIsAtk);
          break;
        }
      }

      busy = false;
      if (!over) moves.querySelectorAll('button').forEach((b) => (b.disabled = false));
    };

    you.moves.forEach((move) => {
      const btn = el<HTMLButtonElement>('button', 'battle-move', getTypeLabel(move.type, lang()));
      btn.type = 'button';
      btn.style.background = getTypeColor(move.type);
      btn.addEventListener('click', () => void round(move));
      moves.appendChild(btn);
    });

    pushLog(t('battleYourTurn'));
  }

  function sideCard(fighter: Fighter, role: string): Side {
    const card = el('div', 'battle-side');
    const img = el<HTMLImageElement>('img', 'battle-side__img');
    img.src = getStaticImage(fighter.data);
    img.alt = fighter.data.name;
    const bar = el('div', 'battle-hp');
    const fill = el('div', 'battle-hp__fill');
    fill.style.background = getTypeColor(fighter.data.types[0]?.type.name ?? 'normal');
    bar.appendChild(fill);
    const hpText = el('span', 'battle-hp__text');
    card.append(
      el('span', 'battle-side__role', role),
      el('span', 'battle-side__name', fighter.data.name),
      img,
      bar,
      hpText,
    );
    return { card, fill, hpText };
  }

  return {
    open: () => {
      renderSetup();
      show(modal);
    },
  };
}
