// Compara até 4 Pokémon lado a lado, com tabela de stats e gráfico de radar.
import type { Pokemon } from '../types';
import type { StatKey } from '../i18n/translations';
import { fetchPokemon } from '../services/pokeapi';
import { getStaticImage } from '../services/sprites';
import { t } from '../i18n';
import { radarSvg } from './radar';

const MAX_COMPARE = 4;
const COLORS = ['#ef5350', '#42a5f5', '#66bb6a', '#ab47bc'];
const STAT_ORDER: StatKey[] = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
];

const escapeHtml = (s: string): string => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

function statValue(pokemon: Pokemon, key: StatKey): number {
  return pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
}

function statTotal(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
}

interface CompareOptions {
  form: HTMLFormElement;
  input: HTMLInputElement;
  chipsEl: HTMLElement;
  resultEl: HTMLElement;
}

export interface CompareControls {
  add: (nameOrId: string) => Promise<void>;
  refresh: () => void;
}

export function setupCompare({ form, input, chipsEl, resultEl }: CompareOptions): CompareControls {
  let selected: Pokemon[] = [];

  function renderChips(): void {
    chipsEl.innerHTML = '';
    selected.forEach((pokemon, idx) => {
      const chip = document.createElement('div');
      chip.className = 'compare-chip';
      chip.style.setProperty('--pc', COLORS[idx]);

      const name = document.createElement('span');
      name.textContent = `#${pokemon.id} ${pokemon.name}`;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'compare-chip__remove';
      remove.textContent = '✕';
      remove.setAttribute('aria-label', t('compareRemoveAria'));
      remove.addEventListener('click', () => {
        selected = selected.filter((p) => p.id !== pokemon.id);
        render();
      });

      chip.append(name, remove);
      chipsEl.appendChild(chip);
    });

    const full = selected.length >= MAX_COMPARE;
    input.disabled = full;
    input.placeholder = full ? '' : t('comparePlaceholder');
  }

  function tableHtml(): string {
    const labels = t('statLabels');
    const cols = `minmax(44px, auto) repeat(${selected.length}, 1fr)`;

    let html = '<div class="ctable">';

    html += `<div class="ctable-row ctable-head" style="grid-template-columns:${cols}"><span></span>`;
    selected.forEach((pokemon, idx) => {
      html += `<div class="ctable-poke" style="--pc:${COLORS[idx]}">
        <img src="${escapeHtml(getStaticImage(pokemon))}" alt="${escapeHtml(pokemon.name)}" loading="lazy" />
        <span class="ctable-name">#${pokemon.id} ${escapeHtml(pokemon.name)}</span>
      </div>`;
    });
    html += '</div>';

    STAT_ORDER.forEach((key) => {
      const values = selected.map((p) => statValue(p, key));
      const max = Math.max(...values);
      html += `<div class="ctable-row" style="grid-template-columns:${cols}"><span class="ctable-label">${escapeHtml(labels[key])}</span>`;
      values.forEach((v, i) => {
        const pct = Math.min((v / 255) * 100, 100);
        html += `<div class="ctable-cell"><span class="${v === max ? 'is-higher' : ''}">${v}</span><div class="ctable-bar"><span style="width:${pct}%;background:${COLORS[i]}"></span></div></div>`;
      });
      html += '</div>';
    });

    const totals = selected.map(statTotal);
    const maxTotal = Math.max(...totals);
    html += `<div class="ctable-row ctable-total" style="grid-template-columns:${cols}"><span class="ctable-label">${escapeHtml(t('total'))}</span>`;
    totals.forEach((v) => {
      html += `<span class="${v === maxTotal ? 'is-higher' : ''}">${v}</span>`;
    });
    html += '</div></div>';

    return html;
  }

  function render(): void {
    renderChips();

    if (selected.length < 2) {
      resultEl.innerHTML = selected.length ? `<span class="muted">${t('compareHint')}</span>` : '';
      return;
    }

    resultEl.innerHTML = `<div class="compare">${radarSvg(selected, COLORS)}${tableHtml()}</div>`;
  }

  async function add(nameOrId: string): Promise<void> {
    const query = String(nameOrId).trim().toLowerCase();
    if (!query || selected.length >= MAX_COMPARE) return;

    let data: Pokemon | null;
    try {
      data = await fetchPokemon(query);
    } catch {
      return;
    }
    if (!data || selected.some((p) => p.id === data!.id)) {
      input.value = '';
      return;
    }

    selected.push(data);
    input.value = '';
    render();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void add(input.value);
  });

  render();

  return { add, refresh: render };
}
