// Compara dois Pokémon lado a lado (tipos, altura, peso e stats).
import { fetchPokemon, getStaticImage } from './api.js';
import { getTypeColor, getTypeLabel } from './pokemonTypes.js';
import { t, getLang } from './i18n.js';

function statTotal(pokemon) {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
}

export function setupCompare({ inputA, inputB, button, resultEl }) {
  let lastA = null;
  let lastB = null;

  function pokemonColumn(pokemon) {
    const lang = getLang();
    const col = document.createElement('div');
    col.className = 'compare__poke';

    const image = document.createElement('img');
    image.src = getStaticImage(pokemon);
    image.alt = pokemon.name;
    image.loading = 'lazy';

    const name = document.createElement('span');
    name.className = 'compare__name';
    name.textContent = `#${pokemon.id} ${pokemon.name}`;

    const types = document.createElement('div');
    types.className = 'compare__types';
    pokemon.types.forEach(({ type }) => {
      const badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.style.backgroundColor = getTypeColor(type.name);
      badge.textContent = getTypeLabel(type.name, lang);
      types.appendChild(badge);
    });

    col.append(image, name, types);
    return col;
  }

  function statRow(label, valueA, valueB, isTotal = false) {
    const row = document.createElement('div');
    row.className = isTotal ? 'compare__row compare__row--total' : 'compare__row';

    const a = document.createElement('span');
    a.textContent = valueA;
    a.className = valueA > valueB ? 'is-higher' : '';

    const mid = document.createElement('span');
    mid.className = 'compare__stat-label';
    mid.textContent = label;

    const b = document.createElement('span');
    b.textContent = valueB;
    b.className = valueB > valueA ? 'is-higher' : '';

    row.append(a, mid, b);
    return row;
  }

  function render(a, b) {
    const labels = t('statLabels');
    resultEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'compare';

    const header = document.createElement('div');
    header.className = 'compare__header';
    const vs = document.createElement('span');
    vs.className = 'compare__vs';
    vs.textContent = 'VS';
    header.append(pokemonColumn(a), vs, pokemonColumn(b));
    wrapper.appendChild(header);

    a.stats.forEach((s) => {
      const other = b.stats.find((x) => x.stat.name === s.stat.name);
      wrapper.appendChild(
        statRow(labels[s.stat.name] ?? s.stat.name, s.base_stat, other?.base_stat ?? 0),
      );
    });
    wrapper.appendChild(statRow(t('total'), statTotal(a), statTotal(b), true));

    resultEl.appendChild(wrapper);
  }

  async function run() {
    const qa = inputA.value.trim().toLowerCase();
    const qb = inputB.value.trim().toLowerCase();
    if (!qa || !qb) return;

    resultEl.innerHTML = `<span class="muted">${t('loading')}</span>`;
    let a;
    let b;
    try {
      [a, b] = await Promise.all([fetchPokemon(qa), fetchPokemon(qb)]);
    } catch {
      resultEl.innerHTML = `<span class="muted">${t('connError')}</span>`;
      return;
    }

    if (!a || !b) {
      resultEl.innerHTML = `<span class="muted">${t('notFound')}</span>`;
      return;
    }

    lastA = a;
    lastB = b;
    render(a, b);
  }

  button.addEventListener('click', run);
  [inputA, inputB].forEach((el) =>
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    }),
  );

  return {
    refresh() {
      if (lastA && lastB) render(lastA, lastB);
    },
  };
}
