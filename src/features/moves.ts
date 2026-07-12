// Lista de golpes do card de detalhes: agrupada por método, colapsável e com
// busca (lupa) para filtrar a lista longa. Recebe o container e um callback de
// clique — sem acoplar ao estado global do main.ts.
import type { Pokemon } from '../types';
import { groupMoves, titleize } from '../domain/pokemonInfo';
import { t } from '../i18n';

const METHOD_ORDER = ['level-up', 'machine', 'egg', 'tutor'];

export function renderMoves(
  container: HTMLElement,
  data: Pokemon,
  onMoveClick: (url: string, name: string) => void,
): void {
  container.innerHTML = '';
  const groups = groupMoves(data);
  const methods = Object.keys(groups);
  if (methods.length === 0) return;

  const total = new Set(data.moves.map((m) => m.move.name)).size;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'collapse-toggle';
  toggle.textContent = `${t('showMoves')} (${total})`;
  toggle.setAttribute('aria-expanded', 'false');

  const body = document.createElement('div');
  body.className = 'moves-body';
  body.hidden = true;

  // Campo de busca (lupa) para filtrar a lista longa de golpes.
  const search = document.createElement('div');
  search.className = 'moves-search';
  const searchIcon = document.createElement('span');
  searchIcon.className = 'moves-search__icon';
  searchIcon.setAttribute('aria-hidden', 'true');
  searchIcon.textContent = '🔍';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'moves-search__input';
  searchInput.placeholder = t('moveSearch');
  searchInput.setAttribute('aria-label', t('moveSearch'));
  search.append(searchIcon, searchInput);

  const empty = document.createElement('p');
  empty.className = 'moves-empty muted';
  empty.textContent = t('moveNoResults');
  empty.hidden = true;

  const methodLabels: Record<string, string> = {
    'level-up': t('moveLevel'),
    machine: t('moveMachine'),
    egg: t('moveEgg'),
    tutor: t('moveTutor'),
  };
  [...methods]
    .sort((a, b) => (METHOD_ORDER.indexOf(a) + 1 || 99) - (METHOD_ORDER.indexOf(b) + 1 || 99))
    .forEach((method) => {
      const group = document.createElement('div');
      group.className = 'moves-group';
      const gtitle = document.createElement('h3');
      gtitle.className = 'moves-group__title';
      gtitle.textContent = methodLabels[method] ?? titleize(method);
      const chips = document.createElement('div');
      chips.className = 'moves-chips';
      groups[method].forEach(({ name, level, url }) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'move-chip is-clickable';
        chip.textContent = level > 0 ? `${titleize(name)} · ${level}` : titleize(name);
        chip.dataset.move = `${name} ${titleize(name)}`.toLowerCase();
        chip.addEventListener('click', () => onMoveClick(url, name));
        chips.appendChild(chip);
      });
      group.append(gtitle, chips);
      body.appendChild(group);
    });

  // Filtra os chips pela busca; oculta grupos vazios e mostra aviso se nada casar.
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let anyVisible = false;
    body.querySelectorAll<HTMLElement>('.moves-group').forEach((group) => {
      let groupVisible = false;
      group.querySelectorAll<HTMLElement>('.move-chip').forEach((chip) => {
        const match = !q || (chip.dataset.move ?? '').includes(q);
        chip.hidden = !match;
        if (match) groupVisible = true;
      });
      group.hidden = !groupVisible;
      if (groupVisible) anyVisible = true;
    });
    empty.hidden = anyVisible;
  });

  body.prepend(search);
  body.appendChild(empty);

  toggle.addEventListener('click', () => {
    const open = body.hidden;
    body.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) searchInput.focus();
  });

  container.append(toggle, body);
}
