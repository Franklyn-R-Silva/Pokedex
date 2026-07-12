// Time de até 6 Pokémon + resumo de fraquezas do time (persistido em localStorage).
import type { Pokemon } from '../types';
import { fetchPokemon, fetchEffectiveness } from '../services/pokeapi';
import { getStaticImage } from '../services/sprites';
import { getTypeColor, getTypeLabel } from '../domain/pokemonTypes';
import { typeSymbolEl } from '../domain/typeIcons';
import { t, getLang } from '../i18n';

const MAX_TEAM = 6;
const KEY = 'pokedex-team';

interface TeamOptions {
  form: HTMLFormElement;
  input: HTMLInputElement;
  listEl: HTMLElement;
  resultEl: HTMLElement;
  onSelect: (name: string) => void;
}

export interface TeamControls {
  add: (nameOrId: string) => Promise<void>;
  refresh: () => void;
  getTeam: () => Pokemon[];
}

function loadNames(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function setupTeam({ form, input, listEl, resultEl, onSelect }: TeamOptions): TeamControls {
  let team: Pokemon[] = [];

  function persist(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(team.map((p) => p.name)));
    } catch {
      /* ignora */
    }
  }

  function renderList(): void {
    listEl.innerHTML = '';
    team.forEach((pokemon) => {
      const chip = document.createElement('div');
      chip.className = 'team-member';

      const img = document.createElement('img');
      img.src = getStaticImage(pokemon);
      img.alt = pokemon.name;
      img.loading = 'lazy';
      img.addEventListener('click', () => onSelect(pokemon.name));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'team-member__remove';
      remove.textContent = '✕';
      remove.setAttribute('aria-label', t('compareRemoveAria'));
      remove.addEventListener('click', () => {
        team = team.filter((p) => p.id !== pokemon.id);
        persist();
        render();
      });

      chip.append(img, remove);
      listEl.appendChild(chip);
    });

    const full = team.length >= MAX_TEAM;
    input.disabled = full;
    input.placeholder = full ? '' : t('teamPlaceholder');
  }

  async function renderWeaknesses(): Promise<void> {
    resultEl.innerHTML = '';
    if (team.length === 0) {
      resultEl.innerHTML = `<span class="muted">${t('teamEmpty')}</span>`;
      return;
    }

    resultEl.innerHTML = '<div class="skeleton"></div><div class="skeleton skeleton--sm"></div>';
    const effList = await Promise.all(team.map((p) => fetchEffectiveness(p.types)));

    // Conta quantos membros são fracos a cada tipo atacante.
    const counts: Record<string, number> = {};
    effList.forEach((eff) => {
      eff.weaknesses.forEach((w) => {
        counts[w.name] = (counts[w.name] ?? 0) + 1;
      });
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    resultEl.innerHTML = '';
    const label = document.createElement('div');
    label.className = 'eff-group__label';
    label.textContent = t('teamWeaknesses');
    const badges = document.createElement('div');
    badges.className = 'eff-badges';
    const lang = getLang();
    entries.forEach(([name, count]) => {
      const badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.style.backgroundColor = getTypeColor(name);
      const sym = typeSymbolEl(name, 14);
      if (sym) badge.appendChild(sym);
      badge.append(`${getTypeLabel(name, lang)} ×${count}`);
      badges.appendChild(badge);
    });
    resultEl.append(label, badges);
  }

  function render(): void {
    renderList();
    void renderWeaknesses();
  }

  async function add(nameOrId: string): Promise<void> {
    const query = String(nameOrId).trim().toLowerCase();
    if (!query || team.length >= MAX_TEAM) return;
    let data: Pokemon | null;
    try {
      data = await fetchPokemon(query);
    } catch {
      return;
    }
    if (!data || team.some((p) => p.id === data!.id)) {
      input.value = '';
      return;
    }
    team.push(data);
    input.value = '';
    persist();
    render();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void add(input.value);
  });

  // Restaura o time salvo.
  void Promise.all(loadNames().map((name) => fetchPokemon(name))).then((list) => {
    team = list.filter((p): p is Pokemon => p !== null).slice(0, MAX_TEAM);
    render();
  });
  render();

  return { add, refresh: render, getTeam: () => team.slice() };
}
