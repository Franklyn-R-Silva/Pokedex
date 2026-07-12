// Compara até 4 Pokémon lado a lado, com tabela de stats e gráfico de radar.
import { fetchPokemon, getStaticImage } from './api.js';
import { t } from './i18n.js';
import { radarSvg } from './radar.js';

const MAX_COMPARE = 4;
const COLORS = ['#ef5350', '#42a5f5', '#66bb6a', '#ab47bc'];
const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

function statValue(pokemon, key) {
  return pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
}

function statTotal(pokemon) {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
}

export function setupCompare({ form, input, chipsEl, resultEl }) {
  let selected = [];

  function renderChips() {
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

  function tableHtml() {
    const labels = t('statLabels');
    const cols = `minmax(44px, auto) repeat(${selected.length}, 1fr)`;

    let html = '<div class="ctable">';

    // Cabeçalho: imagem + nome de cada Pokémon.
    html += `<div class="ctable-row ctable-head" style="grid-template-columns:${cols}"><span></span>`;
    selected.forEach((pokemon, idx) => {
      html += `<div class="ctable-poke" style="--pc:${COLORS[idx]}">
        <img src="${escapeHtml(getStaticImage(pokemon))}" alt="${escapeHtml(pokemon.name)}" loading="lazy" />
        <span class="ctable-name">#${pokemon.id} ${escapeHtml(pokemon.name)}</span>
      </div>`;
    });
    html += '</div>';

    // Linhas de stats (destaca o maior).
    STAT_ORDER.forEach((key) => {
      const values = selected.map((p) => statValue(p, key));
      const max = Math.max(...values);
      html += `<div class="ctable-row" style="grid-template-columns:${cols}"><span class="ctable-label">${escapeHtml(labels[key])}</span>`;
      values.forEach((v) => {
        html += `<span class="${v === max ? 'is-higher' : ''}">${v}</span>`;
      });
      html += '</div>';
    });

    // Total.
    const totals = selected.map(statTotal);
    const maxTotal = Math.max(...totals);
    html += `<div class="ctable-row ctable-total" style="grid-template-columns:${cols}"><span class="ctable-label">${escapeHtml(t('total'))}</span>`;
    totals.forEach((v) => {
      html += `<span class="${v === maxTotal ? 'is-higher' : ''}">${v}</span>`;
    });
    html += '</div></div>';

    return html;
  }

  function render() {
    renderChips();

    if (selected.length < 2) {
      resultEl.innerHTML = selected.length ? `<span class="muted">${t('compareHint')}</span>` : '';
      return;
    }

    resultEl.innerHTML = `<div class="compare">${radarSvg(selected, COLORS)}${tableHtml()}</div>`;
  }

  async function add(nameOrId) {
    const query = String(nameOrId).trim().toLowerCase();
    if (!query || selected.length >= MAX_COMPARE) return;

    let data;
    try {
      data = await fetchPokemon(query);
    } catch {
      return;
    }
    if (!data || selected.some((p) => p.id === data.id)) {
      input.value = '';
      return;
    }

    selected.push(data);
    input.value = '';
    render();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    add(input.value);
  });

  render();

  return {
    add,
    refresh: render,
  };
}
