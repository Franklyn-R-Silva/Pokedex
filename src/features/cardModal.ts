// Modal rico de uma carta do TCG: arte grande + conteúdo (HP, tipos, ataques),
// raridade e valor de mercado (TCGplayer USD / Cardmarket EUR).
import type { TcgCard } from '../types';
import { rarityTier, formatPrice, isHolo } from '../services/tcg';
import { getTypeColor } from '../domain/pokemonTypes';
import { applyTilt } from './tilt';
import { t } from '../i18n';

interface CardModalOptions {
  modal: HTMLElement;
  content: HTMLElement;
  show: (modal: HTMLElement) => void;
}

// Energias do TCG → tipos da PokéAPI (para reaproveitar as cores).
const TCG_TYPE: Record<string, string> = {
  colorless: 'normal',
  darkness: 'dark',
  metal: 'steel',
  lightning: 'electric',
};

export function createCardModal({ modal, content, show }: CardModalOptions): (card: TcgCard) => void {
  function el<T extends HTMLElement>(tag: string, className = '', text = ''): T {
    const node = document.createElement(tag) as T;
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function typeBadge(type: string): HTMLElement {
    const key = TCG_TYPE[type.toLowerCase()] ?? type.toLowerCase();
    const badge = el('span', 'type-badge tcg-type', type);
    badge.style.backgroundColor = getTypeColor(key);
    return badge;
  }

  function priceBlock(card: TcgCard): HTMLElement {
    const box = el('div', 'tcg-price');
    box.appendChild(el('span', 'tcg-price__label', t('cardPriceTitle')));

    if (card.priceUsd == null && card.priceEur == null) {
      box.appendChild(el('span', 'tcg-price__none muted', t('cardNoPrice')));
      return box;
    }

    const row = el('div', 'tcg-price__row');
    if (card.priceUsd != null) {
      const v = el('span', 'tcg-price__value', formatPrice(card.priceUsd, 'USD'));
      v.append(el('small', 'tcg-price__src', ' TCGplayer'));
      row.appendChild(v);
    }
    if (card.priceEur != null) {
      const v = el('span', 'tcg-price__value tcg-price__value--eur', formatPrice(card.priceEur, 'EUR'));
      v.append(el('small', 'tcg-price__src', ' Cardmarket'));
      row.appendChild(v);
    }
    box.appendChild(row);

    if (card.priceUpdated) {
      box.appendChild(el('span', 'tcg-price__updated muted', `${t('cardUpdated')} ${card.priceUpdated}`));
    }
    if (card.priceUrl) {
      const link = el<HTMLAnchorElement>('a', 'tcg-price__buy', t('cardBuy'));
      link.href = card.priceUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      box.appendChild(link);
    }
    return box;
  }

  function attacksBlock(card: TcgCard): HTMLElement | null {
    if (card.attacks.length === 0) return null;
    const wrap = el('div', 'tcg-attacks');
    wrap.appendChild(el('h3', 'tcg-section-title', t('cardAttacks')));
    card.attacks.forEach((atk) => {
      const row = el('div', 'tcg-attack');
      const head = el('div', 'tcg-attack__head');
      head.appendChild(el('span', 'tcg-attack__name', atk.name));
      if (atk.damage) head.appendChild(el('span', 'tcg-attack__damage', atk.damage));
      row.appendChild(head);
      if (atk.cost.length) {
        row.appendChild(el('span', 'tcg-attack__cost muted', atk.cost.join(' · ')));
      }
      if (atk.text) row.appendChild(el('p', 'tcg-attack__text', atk.text));
      wrap.appendChild(row);
    });
    return wrap;
  }

  return function openCard(card: TcgCard): void {
    content.innerHTML = '';
    show(modal);

    const layout = el('div', 'tcg-detail');

    const img = el<HTMLImageElement>('img', 'tcg-detail__img');
    img.src = card.large;
    img.alt = card.name;
    img.loading = 'lazy';
    if (isHolo(card.rarity)) {
      img.classList.add('is-holo');
      applyTilt(img, 14);
    }
    layout.appendChild(img);

    const info = el('div', 'tcg-detail__info');

    info.appendChild(el('h2', 'tcg-detail__name', card.name));

    const badges = el('div', 'tcg-detail__badges');
    if (card.rarity) {
      const rarity = el('span', 'tcg-rarity', card.rarity);
      rarity.dataset.tier = rarityTier(card.rarity);
      badges.appendChild(rarity);
    }
    card.types.forEach((type) => badges.appendChild(typeBadge(type)));
    if (card.hp) badges.appendChild(el('span', 'tcg-hp-badge', `${card.hp} HP`));
    info.appendChild(badges);

    const meta: string[] = [];
    if (card.setName) meta.push(card.setName);
    if (card.number) meta.push(`Nº ${card.number}`);
    if (card.artist) meta.push(`${t('cardBy')} ${card.artist}`);
    if (meta.length) info.appendChild(el('p', 'tcg-detail__meta muted', meta.join(' · ')));

    info.appendChild(priceBlock(card));

    const attacks = attacksBlock(card);
    if (attacks) info.appendChild(attacks);

    if (card.flavorText) info.appendChild(el('p', 'tcg-detail__flavor', card.flavorText));

    layout.appendChild(info);
    content.appendChild(layout);
  };
}
