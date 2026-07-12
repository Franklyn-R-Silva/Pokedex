// Filtro por tipo e/ou geração: mostra um grid paginado de Pokémon clicáveis.
import { fetchByType, fetchByGeneration, getArtworkById } from './api.js';
import { TYPE_NAMES, getTypeLabel } from './pokemonTypes.js';
import { t, getLang } from './i18n.js';

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PAGE_SIZE = 24;

export function setupFilter({ typeSelect, genSelect, resultsEl, paginationEl, onSelect }) {
  let lastResults = [];
  let page = 0;

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

  function renderPagination() {
    paginationEl.innerHTML = '';
    const total = lastResults.length;
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return;

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'page-btn';
    prev.textContent = '‹';
    prev.disabled = page === 0;
    prev.addEventListener('click', () => {
      page -= 1;
      renderPage();
    });

    const info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = `${page + 1} / ${pages} · ${total}`;

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'page-btn';
    next.textContent = '›';
    next.disabled = page >= pages - 1;
    next.addEventListener('click', () => {
      page += 1;
      renderPage();
    });

    paginationEl.append(prev, info, next);
  }

  function renderPage() {
    resultsEl.innerHTML = '';
    const start = page * PAGE_SIZE;
    lastResults.slice(start, start + PAGE_SIZE).forEach(({ name, id }) => {
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

    renderPagination();
  }

  function renderResults(list) {
    lastResults = list;
    page = 0;

    if (list.length === 0) {
      resultsEl.innerHTML = `<span class="muted">${t('noResults')}</span>`;
      paginationEl.innerHTML = '';
      return;
    }

    renderPage();
  }

  async function apply() {
    const type = typeSelect.value;
    const gen = genSelect.value;

    if (!type && !gen) {
      resultsEl.innerHTML = '';
      paginationEl.innerHTML = '';
      lastResults = [];
      return;
    }

    resultsEl.innerHTML = `<span class="muted">${t('loading')}</span>`;
    paginationEl.innerHTML = '';

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

  // Re-aplica rótulos ao trocar de idioma, preservando resultados e página.
  return {
    refresh() {
      populateSelects();
      if (lastResults.length) renderPage();
    },
  };
}
