import './styles/style.css';
import type { Pokemon, PokemonType, PokemonStat, PokemonAbility } from './types';
import type { StatKey, Translation } from './i18n/translations';
import type { Theme } from './services/storage';
import type { FilterControls } from './features/filter';
import type { CompareControls } from './features/compare';
import {
  fetchPokemon,
  fetchAllPokemonNames,
  fetchEvolutionChain,
  fetchSpecies,
  fetchWeaknesses,
  getFlavorText,
  getGenus,
  getAbilityName,
  MAX_POKEMON,
} from './services/pokeapi';
import {
  getPokemonSprite,
  getStaticImage,
  getAnimatedGif,
  getArtworkById,
} from './services/sprites';
import { getTypeColor, getTypeLabel } from './domain/pokemonTypes';
import { getTheme, setTheme, getFavorites, isFavorite, toggleFavorite } from './services/storage';
import { setupAutocomplete } from './features/autocomplete';
import { setupFilter } from './features/filter';
import { setupCompare } from './features/compare';
import { radarSvg } from './features/radar';
import { initLang, getLang, setLang, t, contentLang } from './i18n';

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
const genusEl = qs<HTMLElement>('.details__genus');
const descriptionEl = qs<HTMLElement>('.details__description');
const heightValue = qs<HTMLElement>('.height');
const weightValue = qs<HTMLElement>('.weight');
const weaknessesContainer = qs<HTMLElement>('.details__weaknesses');
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
}

async function renderAbilities(abilities: PokemonAbility[], reqId: number): Promise<void> {
  abilitiesContainer.innerHTML = `<span class="muted">${t('loading')}</span>`;
  const lang = contentLang();
  const names = await Promise.all(abilities.map((ability) => getAbilityName(ability, lang)));
  if (reqId !== requestId) return;

  abilitiesContainer.innerHTML = '';
  abilities.forEach((ability, i) => {
    const chip = document.createElement('span');
    chip.className = 'ability-chip';
    chip.textContent = names[i];
    if (ability.is_hidden) {
      chip.classList.add('ability-chip--hidden');
      chip.title = t('hiddenAbility');
    }
    abilitiesContainer.appendChild(chip);
  });
}

async function renderWeaknesses(types: PokemonType[], reqId: number): Promise<void> {
  weaknessesContainer.innerHTML = `<span class="muted">${t('loading')}</span>`;

  const weaknesses = await fetchWeaknesses(types);
  if (reqId !== requestId) return;

  const lang = getLang();
  weaknessesContainer.innerHTML = '';
  if (weaknesses.length === 0) {
    weaknessesContainer.innerHTML = `<span class="muted">${t('none')}</span>`;
    return;
  }

  weaknesses.forEach(({ name, multiplier }) => {
    const badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.style.backgroundColor = getTypeColor(name);
    badge.textContent =
      multiplier > 2 ? `${getTypeLabel(name, lang)} ×4` : getTypeLabel(name, lang);
    weaknessesContainer.appendChild(badge);
  });
}

async function renderSpeciesInfo(speciesUrl: string, reqId: number): Promise<void> {
  genusEl.textContent = '';
  descriptionEl.textContent = '';

  const species = await fetchSpecies(speciesUrl);
  if (reqId !== requestId || !species) return;

  const lang = contentLang();
  genusEl.textContent = getGenus(species, lang);
  descriptionEl.textContent = getFlavorText(species, lang);
}

async function renderEvolution(speciesUrl: string, reqId: number): Promise<void> {
  evolutionContainer.innerHTML = `<span class="muted">${t('loading')}</span>`;

  const chain = await fetchEvolutionChain(speciesUrl);
  if (reqId !== requestId) return;

  evolutionContainer.innerHTML = '';
  if (chain.length <= 1) {
    evolutionContainer.innerHTML = `<span class="muted">${t('noEvolutions')}</span>`;
    return;
  }

  chain.forEach(({ name, id }) => {
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
    item.addEventListener('click', () => void renderPokemon(name));
    evolutionContainer.appendChild(item);
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
  void renderAbilities(data.abilities, reqId);
  void renderSpeciesInfo(data.species.url, reqId);
  void renderWeaknesses(data.types, reqId);
  void renderEvolution(data.species.url, reqId);

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

// Deep link: abre direto o Pokémon indicado em ?pokemon=ID (ou o #1).
const initialParam = new URLSearchParams(window.location.search).get('pokemon');
searchPokemon = Number(initialParam) || 1;

initLang();
applyStaticI18n();
renderFavorites();
void renderPokemon(initialParam ?? searchPokemon);
loadNames();
