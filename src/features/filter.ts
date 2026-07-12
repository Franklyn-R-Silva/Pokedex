// Filtro por tipo e/ou geração: grid clicável com ordenação e "carregar mais".
import type { RefItem } from '../types';
import { fetchByType, fetchByGeneration } from '../services/pokeapi';
import { getArtworkById } from '../services/sprites';
import { TYPE_NAMES, getTypeLabel } from '../domain/pokemonTypes';
import { t, getLang } from '../i18n';

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PAGE_SIZE = 24;

interface FilterOptions {
  typeSelect: HTMLSelectElement;
  genSelect: HTMLSelectElement;
  sortSelect: HTMLSelectElement;
  resultsEl: HTMLElement;
  paginationEl: HTMLElement;
  onSelect: (name: string) => void;
}

export interface FilterControls {
  refresh: () => void;
  setType: (typeName: string) => void;
}

export function setupFilter({
  typeSelect,
  genSelect,
  sortSelect,
  resultsEl,
  paginationEl,
  onSelect,
}: FilterOptions): FilterControls {
  let results: RefItem[] = [];
  let shown = PAGE_SIZE;

  function populateSelects(): void {
    const lang = getLang();
    const currentType = typeSelect.value;
    const currentGen = genSelect.value;
    const currentSort = sortSelect.value || 'number';

    typeSelect.innerHTML = '';
    typeSelect.appendChild(new Option(t('allTypes'), ''));
    TYPE_NAMES.forEach((name) =>
      typeSelect.appendChild(new Option(getTypeLabel(name, lang), name)),
    );

    genSelect.innerHTML = '';
    genSelect.appendChild(new Option(t('allGens'), ''));
    GENERATIONS.forEach((g) => genSelect.appendChild(new Option(`Gen ${g}`, String(g))));

    sortSelect.innerHTML = '';
    sortSelect.appendChild(new Option(t('sortByNumber'), 'number'));
    sortSelect.appendChild(new Option(t('sortByName'), 'name'));

    typeSelect.value = currentType;
    genSelect.value = currentGen;
    sortSelect.value = currentSort;
  }

  function sorted(list: RefItem[]): RefItem[] {
    const copy = [...list];
    if (sortSelect.value === 'name') copy.sort((a, b) => a.name.localeCompare(b.name));
    else copy.sort((a, b) => a.id - b.id);
    return copy;
  }

  function render(): void {
    resultsEl.innerHTML = '';
    paginationEl.innerHTML = '';

    if (results.length === 0) {
      resultsEl.innerHTML = `<span class="muted">${t('noResults')}</span>`;
      return;
    }

    sorted(results)
      .slice(0, shown)
      .forEach(({ name, id }) => {
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

    if (shown < results.length) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'load-more';
      more.textContent = `${t('loadMore')} (${results.length - shown})`;
      more.addEventListener('click', () => {
        shown += PAGE_SIZE;
        render();
      });
      paginationEl.appendChild(more);
    }
  }

  async function apply(): Promise<void> {
    const type = typeSelect.value;
    const gen = genSelect.value;

    if (!type && !gen) {
      results = [];
      resultsEl.innerHTML = '';
      paginationEl.innerHTML = '';
      return;
    }

    resultsEl.innerHTML = `<span class="muted">${t('loading')}</span>`;
    paginationEl.innerHTML = '';

    if (type && gen) {
      const [byType, byGen] = await Promise.all([fetchByType(type), fetchByGeneration(gen)]);
      const genIds = new Set(byGen.map((p) => p.id));
      results = byType.filter((p) => genIds.has(p.id));
    } else if (type) {
      results = await fetchByType(type);
    } else {
      results = await fetchByGeneration(gen);
    }

    shown = PAGE_SIZE;
    render();
  }

  typeSelect.addEventListener('change', apply);
  genSelect.addEventListener('change', apply);
  sortSelect.addEventListener('change', () => {
    shown = PAGE_SIZE;
    render();
  });
  populateSelects();

  return {
    refresh() {
      populateSelects();
      if (results.length) render();
    },
    setType(typeName: string) {
      typeSelect.value = typeName;
      void apply();
    },
  };
}
