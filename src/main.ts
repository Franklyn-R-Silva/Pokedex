import './styles/style.css';
import pokedexDeviceUrl from './assets/pokedex.png';
import type { Pokemon, Species, PokemonType, PokemonStat, PokemonAbility } from './types';
import type { StatKey, Translation } from './i18n/translations';
import type { Theme } from './services/storage';
import type { FilterControls } from './features/filter';
import type { CompareControls } from './features/compare';
import {
  fetchPokemon,
  fetchAllPokemonNames,
  fetchEvolutionChain,
  fetchSpecies,
  fetchEffectiveness,
  fetchEncounters,
  fetchAbility,
  fetchMove,
  getFlavorText,
  getGenus,
  MAX_POKEMON,
} from './services/pokeapi';
import { translateToPt } from './services/translate';
import {
  getPokemonSprite,
  getStaticImage,
  getAnimatedGif,
  getArtworkById,
  getSpriteGallery,
} from './services/sprites';
import { getTypeColor, getTypeLabel } from './domain/pokemonTypes';
import {
  aboutRows,
  speciesFlags,
  groupMoves,
  titleize,
  formatEvolution,
} from './domain/pokemonInfo';
import { getTheme, setTheme, getFavorites, isFavorite, toggleFavorite } from './services/storage';
import { setupAutocomplete } from './features/autocomplete';
import { setupFilter } from './features/filter';
import { setupCompare } from './features/compare';
import { radarSvg } from './features/radar';
import { initLang, getLang, setLang, t } from './i18n';

/** querySelector tipado (assume que o elemento existe no HTML). */
const qs = <T extends Element>(selector: string): T => document.querySelector(selector) as T;

interface CurrentImages {
  png: string;
  gif: string;
  name: string;
}

const STAT_ORDER: StatKey[] = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
];

// A imagem do dispositivo é empacotada pelo Vite (URL com hash, cacheada pelo SW).
qs<HTMLImageElement>('.pokedex').src = pokedexDeviceUrl;

const skeletonRows = (n: number): string =>
  Array.from({ length: n }, () => '<div class="skeleton"></div>').join('');

let lastFocused: HTMLElement | null = null;
function showModal(modal: HTMLElement): void {
  lastFocused = document.activeElement as HTMLElement | null;
  modal.hidden = false;
  modal.querySelector<HTMLButtonElement>('.modal__close')?.focus();
}
function hideModal(modal: HTMLElement): void {
  modal.hidden = true;
  lastFocused?.focus();
}

const pokemonData = qs<HTMLElement>('.pokemon__data');
const pokemonName = qs<HTMLElement>('.pokemon__name');
const pokemonNumber = qs<HTMLElement>('.pokemon__number');
const pokemonImage = qs<HTMLImageElement>('.pokemon__image');

const form = qs<HTMLFormElement>('.form');
const input = qs<HTMLInputElement>('.input__search');
const suggestions = qs<HTMLElement>('.suggestions');
const buttonPrev = qs<HTMLButtonElement>('.btn-prev');
const buttonNext = qs<HTMLButtonElement>('.btn-next');
const buttonDownloadPng = qs<HTMLButtonElement>('.btn-download--png');
const buttonDownloadGif = qs<HTMLButtonElement>('.btn-download--gif');
const buttonFavorite = qs<HTMLButtonElement>('.btn-favorite');
const buttonRandom = qs<HTMLButtonElement>('.btn-random');
const buttonShiny = qs<HTMLButtonElement>('.btn-shiny');
const buttonCry = qs<HTMLButtonElement>('.btn-cry');
const buttonShare = qs<HTMLButtonElement>('.btn-share');
const themeToggle = qs<HTMLButtonElement>('.theme-toggle');
const langToggle = qs<HTMLButtonElement>('.lang-toggle');
const compareInfo = qs<HTMLButtonElement>('.compare-info');
const compareLegend = qs<HTMLElement>('.compare-legend');

const typesContainer = qs<HTMLElement>('.details__types');
const flagsContainer = qs<HTMLElement>('.details__flags');
const aboutContainer = qs<HTMLElement>('.details__about');
const heldContainer = qs<HTMLElement>('.details__held');
const formsContainer = qs<HTMLElement>('.details__forms');
const lightbox = qs<HTMLElement>('.lightbox');
const lightboxImg = qs<HTMLImageElement>('.lightbox__img');
const lightboxThumbs = qs<HTMLElement>('.lightbox__thumbs');
const infoModal = qs<HTMLElement>('.info-modal');
const topbarInfo = qs<HTMLButtonElement>('.topbar-info');
const detailModal = qs<HTMLElement>('.detail-modal');
const detailContent = qs<HTMLElement>('.detail-modal__content');
const movesContainer = qs<HTMLElement>('.details__moves');
const locationsContainer = qs<HTMLElement>('.details__locations');
const genusEl = qs<HTMLElement>('.details__genus');
const descriptionEl = qs<HTMLElement>('.details__description');
const heightValue = qs<HTMLElement>('.height');
const weightValue = qs<HTMLElement>('.weight');
const effectivenessContainer = qs<HTMLElement>('.details__effectiveness');
const detailsRadar = qs<HTMLElement>('.details__radar');
const statsContainer = qs<HTMLElement>('.details__stats');
const abilitiesContainer = qs<HTMLElement>('.details__abilities');
const evolutionContainer = qs<HTMLElement>('.details__evolution');
const details = qs<HTMLElement>('.details');
const favoritesList = qs<HTMLElement>('.favorites__list');

let searchPokemon = 1;
let currentPokemon: Pokemon | null = null;
let currentImages: CurrentImages | null = null;
let currentCry = '';
let shiny = false;
let requestId = 0;
let allNames: string[] = [];
let filterCtl: FilterControls | null = null;
let compareCtl: CompareControls | null = null;

function setLoading(): void {
  pokemonName.textContent = t('loading');
  pokemonNumber.textContent = '';
}

function showError(message: string): void {
  pokemonImage.style.display = 'none';
  pokemonName.textContent = message;
  pokemonNumber.textContent = '';
  details.classList.remove('is-visible');
  currentPokemon = null;
  currentImages = null;
  currentCry = '';
  buttonDownloadPng.disabled = true;
  buttonDownloadGif.disabled = true;
  buttonFavorite.disabled = true;
  buttonCry.disabled = true;
  buttonShare.disabled = true;
  document.documentElement.style.removeProperty('--type-color');
}

function renderTypes(types: PokemonType[]): void {
  const lang = getLang();
  typesContainer.innerHTML = '';
  types.forEach(({ type }) => {
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'type-badge type-badge--btn';
    badge.style.backgroundColor = getTypeColor(type.name);
    badge.textContent = getTypeLabel(type.name, lang);
    badge.title = t('filterByType');
    badge.addEventListener('click', () => {
      filterCtl?.setType(type.name);
      qs<HTMLElement>('.panel.filter').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    typesContainer.appendChild(badge);
  });
}

function renderStats(stats: PokemonStat[]): void {
  const labels = t('statLabels');
  statsContainer.innerHTML = '';
  stats.forEach(({ base_stat: base, stat }) => {
    const item = document.createElement('li');
    item.className = 'stat';

    const label = document.createElement('span');
    label.className = 'stat__label';
    label.textContent = labels[stat.name as StatKey] ?? stat.name;

    const bar = document.createElement('div');
    bar.className = 'stat__bar';
    const fill = document.createElement('div');
    fill.className = 'stat__fill';
    fill.style.width = `${Math.min((base / 255) * 100, 100)}%`;
    bar.appendChild(fill);

    const value = document.createElement('span');
    value.className = 'stat__value';
    value.textContent = String(base);

    item.append(label, bar, value);
    statsContainer.appendChild(item);
  });

  // Total dos stats base.
  const total = stats.reduce((sum, s) => sum + s.base_stat, 0);
  const totalRow = document.createElement('li');
  totalRow.className = 'stat stat--total';
  const totalLabel = document.createElement('span');
  totalLabel.className = 'stat__label';
  totalLabel.textContent = t('total');
  const spacer = document.createElement('span');
  const totalValue = document.createElement('span');
  totalValue.className = 'stat__value';
  totalValue.textContent = String(total);
  totalRow.append(totalLabel, spacer, totalValue);
  statsContainer.appendChild(totalRow);

  // EV yield (esforço) — quais stats o Pokémon rende ao ser derrotado.
  const evs = stats
    .filter((s) => s.effort > 0)
    .map((s) => `${s.effort} ${labels[s.stat.name as StatKey] ?? s.stat.name}`);
  if (evs.length > 0) {
    const evRow = document.createElement('li');
    evRow.className = 'stat-ev';
    const strong = document.createElement('strong');
    strong.textContent = `${t('evYield')}: `;
    evRow.append(strong, evs.join(', '));
    statsContainer.appendChild(evRow);
  }
}

function renderAbilities(abilities: PokemonAbility[]): void {
  abilitiesContainer.innerHTML = '';
  const pt = getLang() === 'pt';

  abilities.forEach((ability) => {
    const chip = document.createElement('span');
    chip.className = 'ability-chip';
    const english = ability.ability.name.replace(/-/g, ' ');
    chip.textContent = english;
    if (ability.is_hidden) {
      chip.classList.add('ability-chip--hidden');
      chip.title = t('hiddenAbility');
    }
    chip.classList.add('is-clickable');
    chip.addEventListener(
      'click',
      () => void openAbilityModal(ability.ability.url, chip.textContent ?? english),
    );
    abilitiesContainer.appendChild(chip);
    // Traduz em segundo plano no modo PT.
    if (pt) void translateToPt(english).then((tr) => (chip.textContent = tr));
  });
}

async function renderEffectiveness(types: PokemonType[], reqId: number): Promise<void> {
  effectivenessContainer.innerHTML = skeletonRows(2);

  const eff = await fetchEffectiveness(types);
  if (reqId !== requestId) return;

  const lang = getLang();
  effectivenessContainer.innerHTML = '';

  const suffix = (m: number): string => {
    if (m === 4) return ' ×4';
    if (m === 0.25) return ' ×¼';
    if (m === 0.5) return ' ×½';
    return '';
  };

  const addGroup = (
    labelKey: 'weaknesses' | 'resistances' | 'immunities',
    names: string[],
    mults?: number[],
  ) => {
    if (names.length === 0) return;
    const group = document.createElement('div');
    group.className = 'eff-group';
    const label = document.createElement('div');
    label.className = 'eff-group__label';
    label.textContent = t(labelKey);
    const badges = document.createElement('div');
    badges.className = 'eff-badges';
    names.forEach((name, i) => {
      const badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.style.backgroundColor = getTypeColor(name);
      badge.textContent = getTypeLabel(name, lang) + (mults ? suffix(mults[i]) : '');
      badges.appendChild(badge);
    });
    group.append(label, badges);
    effectivenessContainer.appendChild(group);
  };

  addGroup(
    'weaknesses',
    eff.weaknesses.map((w) => w.name),
    eff.weaknesses.map((w) => w.multiplier),
  );
  addGroup(
    'resistances',
    eff.resistances.map((w) => w.name),
    eff.resistances.map((w) => w.multiplier),
  );
  addGroup('immunities', eff.immunities);
}

// Descrição, genus, flags e grid "Sobre" (precisa da espécie + do Pokémon).
async function renderSpecies(data: Pokemon, reqId: number): Promise<void> {
  genusEl.textContent = '';
  descriptionEl.textContent = '';
  flagsContainer.innerHTML = '';
  aboutContainer.innerHTML = skeletonRows(4);

  const species = await fetchSpecies(data.species.url);
  if (reqId !== requestId || !species) return;

  const pt = getLang() === 'pt';
  const genusEn = getGenus(species, 'en');
  const descEn = getFlavorText(species, 'en');
  genusEl.textContent = genusEn;
  descriptionEl.textContent = descEn;

  // No modo PT, traduz descrição e genus (EN → PT) em segundo plano.
  if (pt) {
    void translateToPt(genusEn).then((tr) => {
      if (reqId === requestId) genusEl.textContent = tr;
    });
    void translateToPt(descEn).then((tr) => {
      if (reqId === requestId) descriptionEl.textContent = tr;
    });
  }

  speciesFlags(species).forEach((flag) => {
    const badge = document.createElement('span');
    badge.className = `flag flag--${flag}`;
    badge.textContent = t(flag as keyof Translation) as string;
    flagsContainer.appendChild(badge);
  });

  aboutContainer.innerHTML = '';
  aboutRows(data, species, t('genderless'), getLang()).forEach(({ key, value }) => {
    const cell = document.createElement('div');
    cell.className = 'about-cell';
    const label = document.createElement('span');
    label.className = 'about-label';
    label.textContent = t(key as keyof Translation) as string;
    const val = document.createElement('span');
    val.className = 'about-value';
    val.textContent = value;
    cell.append(label, val);
    aboutContainer.appendChild(cell);
  });

  renderForms(species);
}

function renderForms(species: Species): void {
  formsContainer.innerHTML = '';
  const others = species.varieties.filter((v) => !v.is_default);
  if (others.length === 0) return;

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = t('forms');

  const wrap = document.createElement('div');
  wrap.className = 'forms-chips';
  others.forEach((variety) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'form-chip';
    chip.textContent = titleize(variety.pokemon.name);
    chip.addEventListener('click', () => void renderPokemon(variety.pokemon.name));
    wrap.appendChild(chip);
  });

  formsContainer.append(title, wrap);
}

function renderHeldItems(data: Pokemon): void {
  heldContainer.innerHTML = '';
  if (data.held_items.length === 0) return;
  const label = document.createElement('strong');
  label.textContent = `${t('heldItems')}: `;
  const names = data.held_items.map((h) => titleize(h.item.name)).join(', ');
  heldContainer.append(label, document.createTextNode(names));
}

function renderMoves(data: Pokemon): void {
  movesContainer.innerHTML = '';
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

  const methodLabels: Record<string, string> = {
    'level-up': t('moveLevel'),
    machine: t('moveMachine'),
    egg: t('moveEgg'),
    tutor: t('moveTutor'),
  };
  const order = ['level-up', 'machine', 'egg', 'tutor'];
  [...methods]
    .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
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
        chip.addEventListener('click', () => void openMoveModal(url, name));
        chips.appendChild(chip);
      });
      group.append(gtitle, chips);
      body.appendChild(group);
    });

  toggle.addEventListener('click', () => {
    const open = body.hidden;
    body.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });

  movesContainer.append(toggle, body);
}

async function renderEncounters(url: string, reqId: number): Promise<void> {
  locationsContainer.innerHTML = '';

  const locations = await fetchEncounters(url);
  if (reqId !== requestId) return;

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = t('locations');
  locationsContainer.appendChild(title);

  if (locations.length === 0) {
    const muted = document.createElement('span');
    muted.className = 'muted';
    muted.textContent = t('noLocations');
    locationsContainer.appendChild(muted);
    return;
  }

  const chips = document.createElement('div');
  chips.className = 'moves-chips';
  locations.forEach((loc) => {
    const chip = document.createElement('span');
    chip.className = 'move-chip';
    chip.textContent = titleize(loc);
    chips.appendChild(chip);
  });
  locationsContainer.appendChild(chips);
}

async function renderEvolution(speciesUrl: string, reqId: number): Promise<void> {
  evolutionContainer.innerHTML = skeletonRows(1);

  const chain = await fetchEvolutionChain(speciesUrl);
  if (reqId !== requestId) return;

  evolutionContainer.innerHTML = '';
  if (chain.length <= 1) {
    evolutionContainer.innerHTML = `<span class="muted">${t('noEvolutions')}</span>`;
    return;
  }

  const lang = getLang();
  chain.forEach(({ name, id, detail }, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'evo-item';

    const image = document.createElement('img');
    image.src = getArtworkById(id);
    image.alt = name;
    image.loading = 'lazy';

    const label = document.createElement('span');
    label.textContent = name;

    item.append(image, label);

    const condition = formatEvolution(detail, lang);
    if (condition) {
      const cond = document.createElement('small');
      cond.className = 'evo-cond';
      cond.textContent = condition;
      item.appendChild(cond);
    }

    item.addEventListener('click', () => void renderPokemon(name));
    evolutionContainer.appendChild(item);

    if (index < chain.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'evo-arrow';
      arrow.textContent = '→';
      evolutionContainer.appendChild(arrow);
    }
  });
}

function updateFavoriteButton(): void {
  if (!currentPokemon) return;
  const favorited = isFavorite(currentPokemon.id);
  buttonFavorite.textContent = favorited ? t('favorited') : t('favorite');
  buttonFavorite.classList.toggle('is-active', favorited);
}

function renderFavorites(): void {
  const favorites = getFavorites();
  favoritesList.innerHTML = '';

  if (favorites.length === 0) {
    favoritesList.innerHTML = `<span class="muted">${t('noFavorites')}</span>`;
    return;
  }

  favorites.forEach((favorite) => {
    const chip = document.createElement('div');
    chip.className = 'favorite-chip';

    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'favorite-chip__load';
    load.textContent = `#${favorite.id} ${favorite.name}`;
    load.addEventListener('click', () => void renderPokemon(favorite.name));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'favorite-chip__remove';
    remove.textContent = '✕';
    remove.setAttribute('aria-label', t('removeFavorite'));
    remove.addEventListener('click', () => {
      toggleFavorite(favorite);
      renderFavorites();
      updateFavoriteButton();
    });

    chip.append(load, remove);
    favoritesList.appendChild(chip);
  });
}

// Atualiza a imagem exibida e os alvos de download conforme o estado shiny.
function updateImages(): void {
  if (!currentPokemon) return;
  const data = currentPokemon;
  const baseName = shiny ? `${data.name}-shiny` : data.name;

  pokemonImage.src = getPokemonSprite(data, shiny);
  const png = getStaticImage(data, shiny);
  const gif = getAnimatedGif(data, shiny);
  currentImages = { png, gif, name: baseName };
  buttonDownloadPng.disabled = !png;
  buttonDownloadGif.disabled = !gif;
  buttonDownloadGif.title = gif ? '' : t('noGif');
}

// Reduz a fonte do nome/número até caber em uma linha na tela do dispositivo.
function fitPokemonName(): void {
  pokemonData.style.fontSize = '';
  let size = parseFloat(getComputedStyle(pokemonData).fontSize);
  let guard = 0;
  while (pokemonData.scrollWidth > pokemonData.clientWidth && size > 8 && guard < 40) {
    size -= 1;
    pokemonData.style.fontSize = `${size}px`;
    guard += 1;
  }
}

function updateUrl(id: number): void {
  const url = new URL(window.location.href);
  url.searchParams.set('pokemon', String(id));
  window.history.replaceState({}, '', url);
}

function renderDetails(data: Pokemon, reqId: number): void {
  const primaryType = data.types[0]?.type?.name ?? 'normal';
  document.documentElement.style.setProperty('--type-color', getTypeColor(primaryType));

  renderTypes(data.types);
  heightValue.textContent = `${(data.height / 10).toFixed(1)} m`;
  weightValue.textContent = `${(data.weight / 10).toFixed(1)} kg`;
  detailsRadar.innerHTML = radarSvg([data], [getTypeColor(primaryType)]);
  renderStats(data.stats);
  renderHeldItems(data);
  renderMoves(data);
  renderAbilities(data.abilities);
  void renderSpecies(data, reqId);
  void renderEffectiveness(data.types, reqId);
  void renderEvolution(data.species.url, reqId);
  void renderEncounters(data.location_area_encounters, reqId);

  details.classList.add('is-visible');
}

async function renderPokemon(pokemon: string | number): Promise<void> {
  const reqId = ++requestId;
  setLoading();

  let data: Pokemon | null;
  try {
    data = await fetchPokemon(pokemon);
  } catch {
    showError(t('connError'));
    return;
  }

  if (reqId !== requestId) return;

  if (!data) {
    showError(t('notFound'));
    return;
  }

  pokemonImage.style.display = 'block';
  pokemonImage.alt = data.name;
  pokemonName.textContent = data.name.replace(/-/g, ' ');
  pokemonNumber.textContent = String(data.id);
  fitPokemonName();
  input.value = '';
  searchPokemon = data.id;

  currentPokemon = data;
  currentCry = data.cries?.latest ?? '';
  buttonFavorite.disabled = false;
  buttonShare.disabled = false;
  buttonCry.disabled = !currentCry;
  updateImages();
  // Reinicia a animação de "pop" da imagem a cada Pokémon.
  pokemonImage.classList.remove('pop');
  void pokemonImage.offsetWidth;
  pokemonImage.classList.add('pop');
  updateFavoriteButton();
  updateUrl(data.id);

  renderDetails(data, reqId);
}

/** Baixa uma imagem por URL (blob), com fallback de abrir em nova aba. */
async function downloadImage(url: string, name: string): Promise<void> {
  if (!url) return;

  const extension = url.split('.').pop()?.split('?')[0] || 'png';

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${name}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

function playCry(): void {
  if (!currentCry) return;
  const audio = new Audio(currentCry);
  audio.volume = 0.4;
  void audio.play().catch(() => {
    /* autoplay bloqueado ou formato não suportado */
  });
}

async function sharePokemon(): Promise<void> {
  if (!currentPokemon) return;
  const url = new URL(window.location.href);
  url.searchParams.set('pokemon', String(currentPokemon.id));
  const link = url.toString();

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Pokédex', text: currentPokemon.name, url: link });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      const original = t('share');
      buttonShare.textContent = t('copied');
      setTimeout(() => {
        buttonShare.textContent = original;
      }, 1500);
    }
  } catch {
    /* usuário cancelou ou API indisponível */
  }
}

async function loadNames(): Promise<void> {
  allNames = await fetchAllPokemonNames();
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? t('themeLight') : t('themeDark'));
}

// Preenche a legenda de atributos (HP → Vida, etc.) no idioma atual.
function renderCompareLegend(): void {
  const labels = t('statLabels');
  const names = t('statNames');
  compareLegend.innerHTML = '';
  STAT_ORDER.forEach((key) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const abbr = document.createElement('strong');
    abbr.textContent = labels[key];
    item.append(abbr, ` ${names[key]}`);
    compareLegend.appendChild(item);
  });
}

// Aplica o idioma a todos os textos estáticos da interface.
function applyStaticI18n(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n as keyof Translation) as string;
  });
  document.querySelectorAll<HTMLInputElement>('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh as keyof Translation) as string;
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria as keyof Translation) as string);
  });
  renderCompareLegend();
  langToggle.textContent = getLang().toUpperCase();
  applyTheme(getTheme());
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = input.value.trim().toLowerCase();
  if (query) void renderPokemon(query);
});

buttonPrev.addEventListener('click', () => {
  if (searchPokemon > 1) void renderPokemon(searchPokemon - 1);
});

buttonNext.addEventListener('click', () => {
  if (searchPokemon < MAX_POKEMON) void renderPokemon(searchPokemon + 1);
});

buttonRandom.addEventListener('click', () => {
  void renderPokemon(Math.floor(Math.random() * MAX_POKEMON) + 1);
});

buttonShiny.addEventListener('click', () => {
  shiny = !shiny;
  buttonShiny.setAttribute('aria-pressed', String(shiny));
  buttonShiny.classList.toggle('is-active', shiny);
  updateImages();
});

buttonCry.addEventListener('click', playCry);
buttonShare.addEventListener('click', () => void sharePokemon());

compareInfo.addEventListener('click', () => {
  const willOpen = compareLegend.hidden;
  compareLegend.hidden = !willOpen;
  compareInfo.setAttribute('aria-expanded', String(willOpen));
});

// Lightbox: clicar na imagem abre uma galeria com todas as sprites.
function openLightbox(): void {
  if (!currentPokemon) return;
  const gallery = getSpriteGallery(currentPokemon);
  if (gallery.length === 0) return;
  const name = currentPokemon.name;

  const setMain = (url: string): void => {
    lightboxImg.src = url;
    lightboxImg.alt = name;
  };

  lightboxThumbs.innerHTML = '';
  gallery.forEach((item, i) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'lightbox__thumb';
    if (i === 0) thumb.classList.add('is-active');

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.label;
    img.loading = 'lazy';
    const caption = document.createElement('span');
    caption.textContent = item.label;
    thumb.append(img, caption);

    thumb.addEventListener('click', () => {
      setMain(item.url);
      lightboxThumbs
        .querySelectorAll('.lightbox__thumb')
        .forEach((el) => el.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
    lightboxThumbs.appendChild(thumb);
  });

  setMain(gallery[0].url);
  showModal(lightbox);
}

// Modal de detalhes de habilidade (efeito) — endpoint /ability.
async function openAbilityModal(url: string, title: string): Promise<void> {
  detailContent.innerHTML = `<span class="muted">${t('loading')}</span>`;
  showModal(detailModal);
  const data = await fetchAbility(url);
  detailContent.innerHTML = '';

  const heading = document.createElement('h2');
  heading.className = 'detail-title';
  heading.textContent = title;
  detailContent.appendChild(heading);

  const entry = data?.effect_entries.find((e) => e.language.name === 'en');
  const effect = entry?.short_effect ?? entry?.effect ?? t('none');
  const p = document.createElement('p');
  p.className = 'detail-effect';
  p.textContent = effect;
  detailContent.appendChild(p);

  if (getLang() === 'pt' && effect) void translateToPt(effect).then((tr) => (p.textContent = tr));
}

// Modal de detalhes de golpe (tipo/poder/precisão/PP/categoria/efeito) — /move.
async function openMoveModal(url: string, name: string): Promise<void> {
  detailContent.innerHTML = `<span class="muted">${t('loading')}</span>`;
  showModal(detailModal);
  const data = await fetchMove(url);
  detailContent.innerHTML = '';

  const heading = document.createElement('h2');
  heading.className = 'detail-title';
  heading.textContent = titleize(name);
  detailContent.appendChild(heading);

  if (!data) {
    const muted = document.createElement('span');
    muted.className = 'muted';
    muted.textContent = t('notFound');
    detailContent.appendChild(muted);
    return;
  }

  const lang = getLang();
  const badge = document.createElement('span');
  badge.className = 'type-badge';
  badge.style.backgroundColor = getTypeColor(data.type.name);
  badge.textContent = getTypeLabel(data.type.name, lang);
  detailContent.appendChild(badge);

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
  detailContent.appendChild(grid);

  const entry = data.effect_entries.find((e) => e.language.name === 'en');
  const effect = (entry?.short_effect ?? '').replace(/\$effect_chance/g, '—');
  if (effect) {
    const p = document.createElement('p');
    p.className = 'detail-effect';
    p.textContent = effect;
    detailContent.appendChild(p);
    if (lang === 'pt') void translateToPt(effect).then((tr) => (p.textContent = tr));
  }
}

pokemonImage.addEventListener('click', openLightbox);
topbarInfo.addEventListener('click', () => showModal(infoModal));

document.querySelectorAll<HTMLElement>('.modal').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) hideModal(modal);
  });
  modal.querySelector<HTMLButtonElement>('.modal__close')?.addEventListener('click', () => {
    hideModal(modal);
  });
});

buttonDownloadPng.addEventListener('click', () => {
  if (currentImages?.png) void downloadImage(currentImages.png, currentImages.name);
});

buttonDownloadGif.addEventListener('click', () => {
  if (currentImages?.gif) void downloadImage(currentImages.gif, `${currentImages.name}-animado`);
});

buttonFavorite.addEventListener('click', () => {
  if (!currentPokemon) return;
  toggleFavorite({ id: currentPokemon.id, name: currentPokemon.name });
  updateFavoriteButton();
  renderFavorites();
});

themeToggle.addEventListener('click', () => {
  const next: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  setTheme(next);
  applyTheme(next);
});

langToggle.addEventListener('click', () => {
  setLang(getLang() === 'pt' ? 'en' : 'pt');
  applyStaticI18n();
  updateFavoriteButton();
  renderFavorites();
  filterCtl?.refresh();
  compareCtl?.refresh();
  if (currentPokemon) void renderPokemon(currentPokemon.id);
});

window.addEventListener('resize', () => {
  if (currentPokemon) fitPokemonName();
});

// Atalhos de teclado: "/" foca a busca, setas navegam, Esc sai da busca.
document.addEventListener('keydown', (event) => {
  const openModal = document.querySelector<HTMLElement>('.modal:not([hidden])');
  if (openModal) {
    if (event.key === 'Escape') {
      hideModal(openModal);
      return;
    }
    // Foco preso dentro do modal (acessibilidade).
    if (event.key === 'Tab') {
      const focusables = openModal.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    return;
  }

  const target = event.target as HTMLElement | null;
  const typing =
    document.activeElement === input || target?.tagName === 'INPUT' || target?.tagName === 'SELECT';

  if (event.key === '/' && !typing) {
    event.preventDefault();
    input.focus();
    return;
  }
  if (event.key === 'Escape' && document.activeElement === input) {
    input.blur();
    return;
  }
  if (typing) return;
  if (event.key === 'ArrowLeft') buttonPrev.click();
  if (event.key === 'ArrowRight') buttonNext.click();
});

// Abas do card de detalhes (compacta o conteúdo, menos scroll).
const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab');
const tabPanels = document.querySelectorAll<HTMLElement>('.tab-panel');
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.tab ?? 'about';
    tabButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === name));
    tabPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === name));
  });
});

setupAutocomplete({
  input,
  container: suggestions,
  getNames: () => allNames,
  onSelect: (name) => void renderPokemon(name),
});

filterCtl = setupFilter({
  typeSelect: qs<HTMLSelectElement>('.filter-type'),
  genSelect: qs<HTMLSelectElement>('.filter-gen'),
  resultsEl: qs<HTMLElement>('.filter-results'),
  paginationEl: qs<HTMLElement>('.filter-pagination'),
  onSelect: (name) => {
    void renderPokemon(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
});

const compareInput = qs<HTMLInputElement>('.compare-input');
compareCtl = setupCompare({
  form: qs<HTMLFormElement>('.compare__controls'),
  input: compareInput,
  chipsEl: qs<HTMLElement>('.compare-chips'),
  resultEl: qs<HTMLElement>('.compare-result'),
});

// Autocomplete por nome; escolher uma sugestão adiciona à comparação.
setupAutocomplete({
  input: compareInput,
  container: qs<HTMLElement>('.compare-suggest'),
  getNames: () => allNames,
  onSelect: (name) => void compareCtl?.add(name),
});

// PWA: mostra o botão "Instalar" quando o navegador oferece o prompt.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installBtn = qs<HTMLButtonElement>('.install-btn');
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', () => {
  if (!deferredPrompt) return;
  void deferredPrompt.prompt();
  installBtn.hidden = true;
  deferredPrompt = null;
});
window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
});

// Pokémon do dia (determinístico pela data) quando não há ?pokemon=ID.
function pokemonOfTheDay(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((now.getTime() - start) / 86_400_000);
  return ((dayOfYear * 7 + now.getFullYear()) % MAX_POKEMON) + 1;
}

// Deep link: abre direto o Pokémon indicado em ?pokemon=ID (ou o do dia).
const initialParam = new URLSearchParams(window.location.search).get('pokemon');
const initial = initialParam ?? String(pokemonOfTheDay());
searchPokemon = Number(initial) || 1;

initLang();
applyStaticI18n();
renderFavorites();
void renderPokemon(initial);
loadNames();
