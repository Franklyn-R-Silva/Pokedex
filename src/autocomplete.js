// Autocomplete por substring (busca em qualquer parte do nome), com navegação
// por teclado. Substitui o <datalist> nativo, que só sugere por prefixo.

/**
 * @param {object} options
 * @param {HTMLInputElement} options.input
 * @param {HTMLElement} options.container  Lista onde as sugestões são renderizadas.
 * @param {() => string[]} options.getNames  Retorna a lista completa de nomes.
 * @param {(name: string) => void} options.onSelect  Chamado ao escolher uma sugestão.
 * @param {number} [options.limit]  Máximo de sugestões exibidas.
 */
export function setupAutocomplete({ input, container, getNames, onSelect, limit = 8 }) {
  let matches = [];
  let activeIndex = -1;

  function close() {
    container.innerHTML = '';
    container.classList.remove('is-open');
    matches = [];
    activeIndex = -1;
  }

  // Monta o texto da sugestão destacando o trecho que casou com a busca.
  function highlight(name, query) {
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

  function render(query) {
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
      // mousedown (não click) para disparar antes do blur do input.
      item.addEventListener('mousedown', (event) => {
        event.preventDefault();
        select(name);
      });
      container.appendChild(item);
    });

    container.classList.add('is-open');
  }

  function select(name) {
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
    // Prioriza quem começa com a busca; depois os demais que a contêm.
    const names = getNames();
    const starts = [];
    const contains = [];
    for (const name of names) {
      const pos = name.indexOf(query);
      if (pos === 0) starts.push(name);
      else if (pos > 0) contains.push(name);
    }
    matches = [...starts, ...contains].slice(0, limit);
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

  // Fecha ao sair do campo (com atraso para permitir o clique na sugestão).
  input.addEventListener('blur', () => {
    setTimeout(close, 120);
  });

  return { close };
}
