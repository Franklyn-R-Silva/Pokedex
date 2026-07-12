// Autocomplete por substring (busca em qualquer parte do nome), com navegação
// por teclado. Substitui o <datalist> nativo, que só sugere por prefixo.

/** Filtra nomes por substring, priorizando quem começa com a busca. */
export function filterNames(names: string[], query: string, limit = 8): string[] {
  const q = query.toLowerCase();
  if (!q) return [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const name of names) {
    const pos = name.indexOf(q);
    if (pos === 0) starts.push(name);
    else if (pos > 0) contains.push(name);
  }
  return [...starts, ...contains].slice(0, limit);
}

interface AutocompleteOptions {
  input: HTMLInputElement;
  container: HTMLElement;
  getNames: () => string[];
  onSelect: (name: string) => void;
  limit?: number;
}

export function setupAutocomplete({
  input,
  container,
  getNames,
  onSelect,
  limit = 8,
}: AutocompleteOptions): { close: () => void } {
  let matches: string[] = [];
  let activeIndex = -1;

  function close(): void {
    container.innerHTML = '';
    container.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    matches = [];
    activeIndex = -1;
  }

  function highlight(name: string, query: string): DocumentFragment {
    const index = name.indexOf(query);
    const fragment = document.createDocumentFragment();
    if (index < 0) {
      fragment.append(name);
      return fragment;
    }
    fragment.append(name.slice(0, index));
    const strong = document.createElement('strong');
    strong.textContent = name.slice(index, index + query.length);
    fragment.append(strong, name.slice(index + query.length));
    return fragment;
  }

  function render(query: string): void {
    container.innerHTML = '';
    if (matches.length === 0) {
      close();
      return;
    }

    matches.forEach((name, i) => {
      const item = document.createElement('li');
      item.className = 'suggestion';
      item.setAttribute('role', 'option');
      if (i === activeIndex) {
        item.classList.add('is-active');
        item.setAttribute('aria-selected', 'true');
      }
      item.appendChild(highlight(name, query));
      item.addEventListener('mousedown', (event) => {
        event.preventDefault();
        select(name);
      });
      container.appendChild(item);
    });

    container.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
  }

  function select(name: string): void {
    input.value = name;
    close();
    onSelect(name);
  }

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 1) {
      close();
      return;
    }
    matches = filterNames(getNames(), query, limit);
    activeIndex = -1;
    render(query);
  });

  input.addEventListener('keydown', (event) => {
    if (matches.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % matches.length;
      render(input.value.trim().toLowerCase());
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + matches.length) % matches.length;
      render(input.value.trim().toLowerCase());
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault();
        select(matches[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      close();
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(close, 120);
  });

  return { close };
}
