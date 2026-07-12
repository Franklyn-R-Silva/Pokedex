// Filtro por tipo e/ou geração: mostra um grid de Pokémon clicáveis.
import { fetchByType, fetchByGeneration, getArtworkById } from './api.js';
import { TYPE_NAMES, getTypeLabel } from './pokemonTypes.js';
import { t, getLang } from './i18n.js';

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const MAX_RESULTS = 60;

export function setupFilter({ typeSelect, genSelect, resultsEl, onSelect }) {
  let lastResults = [];

  function populateSelects() {
    const lang = getLang();
    const currentType = typeSelect.value;
    const currentGen = genSelect.value;

    typeSelect.innerHTML = '';
    typeSelect.appendChild(new Option(t('allTypes'), ''));
    TYPE_NAMES.forEach((name) =>
      typeSelect.appendChild(new Option(getTypeLabel(name, lang), name)),
    );

    genSelect.innerHTML = '';
    genSelect.appendChild(new Option(t('allGens'), ''));
    GENERATIONS.forEach((g) => genSelect.appendChild(new Option(`Gen ${g}`, String(g))));

    typeSelect.value = currentType;
    genSelect.value = currentGen;
  }

  function renderResults(list) {
    lastResults = list;
    resultsEl.innerHTML = '';

    if (list.length === 0) {
      resultsEl.innerHTML = `<span class="muted">${t('noResults')}</span>`;
      return;
    }

    list.slice(0, MAX_RESULTS).forEach(({ name, id }) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'grid-item';

      const image = document.createElement('img');
      image.src = getArtworkById(id);
      image.alt = name;
      image.loading = 'lazy';

      const label = document.createElement('span');
      label.textContent = `#${id} ${name}`;

      item.append(image, label);
      item.addEventListener('click', () => onSelect(name));
      resultsEl.appendChild(item);
    });

    if (list.length > MAX_RESULTS) {
      const more = document.createElement('span');
      more.className = 'muted grid-more';
      more.textContent = `+${list.length - MAX_RESULTS}`;
      resultsEl.appendChild(more);
    }
  }

  async function apply() {
    const type = typeSelect.value;
    const gen = genSelect.value;

    if (!type && !gen) {
      resultsEl.innerHTML = '';
      lastResults = [];
      return;
    }

    resultsEl.innerHTML = `<span class="muted">${t('loading')}</span>`;

    let list;
    if (type && gen) {
      const [byType, byGen] = await Promise.all([fetchByType(type), fetchByGeneration(gen)]);
      const genIds = new Set(byGen.map((p) => p.id));
      list = byType.filter((p) => genIds.has(p.id)).sort((a, b) => a.id - b.id);
    } else if (type) {
      list = (await fetchByType(type)).sort((a, b) => a.id - b.id);
    } else {
      list = await fetchByGeneration(gen);
    }

    renderResults(list);
  }

  typeSelect.addEventListener('change', apply);
  genSelect.addEventListener('change', apply);
  populateSelects();

  // Re-aplica rótulos ao trocar de idioma, preservando os resultados atuais.
  return {
    refresh() {
      populateSelects();
      if (lastResults.length) renderResults(lastResults);
    },
  };
}
