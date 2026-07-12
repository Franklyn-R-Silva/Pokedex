// Modais de detalhe (habilidade e golpe) do card. Isolados do main.ts:
// recebem o modal + a função showModal e cuidam do próprio fetch/render.
import type { Translation } from '../i18n/translations';
import { fetchAbility, fetchMove } from '../services/pokeapi';
import { translateToPt } from '../services/translate';
import { getTypeColor, getTypeLabel } from '../domain/pokemonTypes';
import { titleize } from '../domain/pokemonInfo';
import { t, getLang } from '../i18n';

interface DetailModalOptions {
  modal: HTMLElement;
  content: HTMLElement;
  show: (modal: HTMLElement) => void;
}

export interface DetailModals {
  openAbility: (url: string, title: string) => Promise<void>;
  openMove: (url: string, name: string) => Promise<void>;
}

export function createDetailModals({ modal, content, show }: DetailModalOptions): DetailModals {
  function heading(text: string): void {
    const h = document.createElement('h2');
    h.className = 'detail-title';
    h.textContent = text;
    content.appendChild(h);
  }

  async function openAbility(url: string, title: string): Promise<void> {
    content.innerHTML = `<span class="muted">${t('loading')}</span>`;
    show(modal);
    const data = await fetchAbility(url);
    content.innerHTML = '';
    heading(title);

    const entry = data?.effect_entries.find((e) => e.language.name === 'en');
    const effect = entry?.short_effect ?? entry?.effect ?? t('none');
    const p = document.createElement('p');
    p.className = 'detail-effect';
    p.textContent = effect;
    content.appendChild(p);

    if (getLang() === 'pt' && effect) void translateToPt(effect).then((tr) => (p.textContent = tr));
  }

  async function openMove(url: string, name: string): Promise<void> {
    content.innerHTML = `<span class="muted">${t('loading')}</span>`;
    show(modal);
    const data = await fetchMove(url);
    content.innerHTML = '';
    heading(titleize(name));

    if (!data) {
      const muted = document.createElement('span');
      muted.className = 'muted';
      muted.textContent = t('notFound');
      content.appendChild(muted);
      return;
    }

    const lang = getLang();
    const badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.style.backgroundColor = getTypeColor(data.type.name);
    badge.textContent = getTypeLabel(data.type.name, lang);
    content.appendChild(badge);

    const grid = document.createElement('div');
    grid.className = 'detail-grid';
    const addCell = (label: string, value: string): void => {
      const cell = document.createElement('div');
      cell.className = 'about-cell';
      const l = document.createElement('span');
      l.className = 'about-label';
      l.textContent = label;
      const v = document.createElement('span');
      v.className = 'about-value';
      v.textContent = value;
      cell.append(l, v);
      grid.appendChild(cell);
    };
    addCell(t('moveCategory'), t(data.damage_class.name as keyof Translation) as string);
    addCell(t('movePower'), data.power != null ? String(data.power) : '—');
    addCell(t('moveAccuracy'), data.accuracy != null ? `${data.accuracy}%` : '—');
    addCell(t('movePp'), data.pp != null ? String(data.pp) : '—');
    content.appendChild(grid);

    const entry = data.effect_entries.find((e) => e.language.name === 'en');
    const effect = (entry?.short_effect ?? '').replace(/\$effect_chance/g, '—');
    if (effect) {
      const p = document.createElement('p');
      p.className = 'detail-effect';
      p.textContent = effect;
      content.appendChild(p);
      if (lang === 'pt') void translateToPt(effect).then((tr) => (p.textContent = tr));
    }
  }

  return { openAbility, openMove };
}
