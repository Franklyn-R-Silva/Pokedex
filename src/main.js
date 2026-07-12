import './style.css';
import {
  fetchPokemon,
  fetchAllPokemonNames,
  fetchEvolutionChain,
  getPokemonSprite,
  getStaticImage,
  getAnimatedGif,
  getArtworkById,
  MAX_POKEMON,
} from './api.js';
import { getTypeColor, getTypeLabel } from './pokemonTypes.js';
import { getTheme, setTheme, getFavorites, isFavorite, toggleFavorite } from './storage.js';
import { setupAutocomplete } from './autocomplete.js';

const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');

const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const suggestions = document.querySelector('.suggestions');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const buttonDownloadPng = document.querySelector('.btn-download--png');
const buttonDownloadGif = document.querySelector('.btn-download--gif');
const buttonFavorite = document.querySelector('.btn-favorite');
const themeToggle = document.querySelector('.theme-toggle');

const typesContainer = document.querySelector('.details__types');
const heightValue = document.querySelector('.height');
const weightValue = document.querySelector('.weight');
const statsContainer = document.querySelector('.details__stats');
const abilitiesContainer = document.querySelector('.details__abilities');
const evolutionContainer = document.querySelector('.details__evolution');
const details = document.querySelector('.details');
const favoritesList = document.querySelector('.favorites__list');

// Nome curto de cada stat para exibição.
const STAT_LABELS = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SPA',
  'special-defense': 'SPD',
  speed: 'VEL',
};

let searchPokemon = 1;
let currentPokemon = null; // dados completos do Pokémon exibido.
let currentImages = null; // { png, gif, name } do Pokémon exibido (para download).
let requestId = 0; // token para descartar renders assíncronos obsoletos.
let allNames = []; // todos os nomes de Pokémon (para o autocomplete).

function setLoading() {
  pokemonName.innerHTML = 'Carregando...';
  pokemonNumber.innerHTML = '';
}

function showError(message) {
  pokemonImage.style.display = 'none';
  pokemonName.innerHTML = message;
  pokemonNumber.innerHTML = '';
  details.classList.remove('is-visible');
  currentPokemon = null;
  currentImages = null;
  buttonDownloadPng.disabled = true;
  buttonDownloadGif.disabled = true;
  buttonFavorite.disabled = true;
  document.documentElement.style.removeProperty('--type-color');
}

function renderTypes(types) {
  typesContainer.innerHTML = '';
  types.forEach(({ type }) => {
    const badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.style.backgroundColor = getTypeColor(type.name);
    badge.textContent = getTypeLabel(type.name);
    typesContainer.appendChild(badge);
  });
}

function renderStats(stats) {
  statsContainer.innerHTML = '';
  stats.forEach(({ base_stat: base, stat }) => {
    const item = document.createElement('li');
    item.className = 'stat';

    const label = document.createElement('span');
    label.className = 'stat__label';
    label.textContent = STAT_LABELS[stat.name] ?? stat.name;

    const bar = document.createElement('div');
    bar.className = 'stat__bar';
    const fill = document.createElement('div');
    fill.className = 'stat__fill';
    // Base máxima comum ~255; limitamos a 100% da barra.
    fill.style.width = `${Math.min((base / 255) * 100, 100)}%`;
    bar.appendChild(fill);

    const value = document.createElement('span');
    value.className = 'stat__value';
    value.textContent = base;

    item.append(label, bar, value);
    statsContainer.appendChild(item);
  });
}

function renderAbilities(abilities) {
  abilitiesContainer.innerHTML = '';
  abilities.forEach(({ ability, is_hidden: isHidden }) => {
    const chip = document.createElement('span');
    chip.className = 'ability-chip';
    chip.textContent = ability.name.replace(/-/g, ' ');
    if (isHidden) {
      chip.classList.add('ability-chip--hidden');
      chip.title = 'Habilidade oculta';
    }
    abilitiesContainer.appendChild(chip);
  });
}

async function renderEvolution(speciesUrl, reqId) {
  evolutionContainer.innerHTML = '<span class="muted">Carregando...</span>';

  const chain = await fetchEvolutionChain(speciesUrl);
  // Descarta se o usuário já navegou para outro Pokémon.
  if (reqId !== requestId) return;

  evolutionContainer.innerHTML = '';
  if (chain.length <= 1) {
    evolutionContainer.innerHTML = '<span class="muted">Sem evoluções</span>';
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
    item.addEventListener('click', () => renderPokemon(name));
    evolutionContainer.appendChild(item);
  });
}

function updateFavoriteButton() {
  if (!currentPokemon) return;
  const favorited = isFavorite(currentPokemon.id);
  buttonFavorite.textContent = favorited ? '★ Favoritado' : '☆ Favoritar';
  buttonFavorite.classList.toggle('is-active', favorited);
}

function renderFavorites() {
  const favorites = getFavorites();
  favoritesList.innerHTML = '';

  if (favorites.length === 0) {
    favoritesList.innerHTML = '<span class="muted">Nenhum favorito ainda</span>';
    return;
  }

  favorites.forEach((favorite) => {
    const chip = document.createElement('div');
    chip.className = 'favorite-chip';

    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'favorite-chip__load';
    load.textContent = `#${favorite.id} ${favorite.name}`;
    load.addEventListener('click', () => renderPokemon(favorite.name));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'favorite-chip__remove';
    remove.textContent = '✕';
    remove.setAttribute('aria-label', `Remover ${favorite.name}`);
    remove.addEventListener('click', () => {
      toggleFavorite(favorite);
      renderFavorites();
      updateFavoriteButton();
    });

    chip.append(load, remove);
    favoritesList.appendChild(chip);
  });
}

function renderDetails(data, reqId) {
  const primaryType = data.types[0]?.type?.name;
  document.documentElement.style.setProperty('--type-color', getTypeColor(primaryType));

  renderTypes(data.types);
  heightValue.textContent = `${(data.height / 10).toFixed(1)} m`;
  weightValue.textContent = `${(data.weight / 10).toFixed(1)} kg`;
  renderStats(data.stats);
  renderAbilities(data.abilities);
  renderEvolution(data.species.url, reqId);

  details.classList.add('is-visible');
}

async function renderPokemon(pokemon) {
  const reqId = ++requestId;
  setLoading();

  let data;
  try {
    data = await fetchPokemon(pokemon);
  } catch {
    showError('Erro de conexão :c');
    return;
  }

  if (reqId !== requestId) return; // navegação mais recente já em andamento.

  if (!data) {
    showError('Não encontrado :c');
    return;
  }

  const sprite = getPokemonSprite(data);
  pokemonImage.style.display = 'block';
  pokemonImage.src = sprite;
  pokemonImage.alt = data.name;
  pokemonName.innerHTML = data.name;
  pokemonNumber.innerHTML = data.id;
  input.value = '';
  searchPokemon = data.id;

  const png = getStaticImage(data);
  const gif = getAnimatedGif(data);
  currentPokemon = data;
  currentImages = { png, gif, name: data.name };
  buttonDownloadPng.disabled = !png;
  buttonDownloadGif.disabled = !gif;
  buttonDownloadGif.title = gif ? '' : 'Sem GIF animado para este Pokémon';
  buttonFavorite.disabled = false;
  updateFavoriteButton();

  renderDetails(data, reqId);
}

/**
 * Baixa uma imagem por URL. Faz fetch do blob (a PokéAPI serve os sprites
 * com CORS liberado); em caso de falha, abre a imagem em nova aba.
 * @param {string} url
 * @param {string} name  Nome base do arquivo (sem extensão).
 */
async function downloadImage(url, name) {
  if (!url) return;

  const extension = url.split('.').pop().split('?')[0] || 'png';

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

/**
 * Carrega todos os nomes para alimentar o autocomplete por substring.
 */
async function loadNames() {
  allNames = await fetchAllPokemonNames();
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Tema claro' : 'Tema escuro');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = input.value.trim().toLowerCase();
  if (query) {
    renderPokemon(query);
  }
});

buttonPrev.addEventListener('click', () => {
  if (searchPokemon > 1) {
    renderPokemon(searchPokemon - 1);
  }
});

buttonNext.addEventListener('click', () => {
  if (searchPokemon < MAX_POKEMON) {
    renderPokemon(searchPokemon + 1);
  }
});

buttonDownloadPng.addEventListener('click', () => {
  if (currentImages?.png) downloadImage(currentImages.png, currentImages.name);
});

buttonDownloadGif.addEventListener('click', () => {
  if (currentImages?.gif) downloadImage(currentImages.gif, `${currentImages.name}-animado`);
});

buttonFavorite.addEventListener('click', () => {
  if (!currentPokemon) return;
  toggleFavorite({ id: currentPokemon.id, name: currentPokemon.name });
  updateFavoriteButton();
  renderFavorites();
});

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  setTheme(next);
  applyTheme(next);
});

// Navegação pelo teclado (setas esquerda/direita).
document.addEventListener('keydown', (event) => {
  if (document.activeElement === input) return;
  if (event.key === 'ArrowLeft') buttonPrev.click();
  if (event.key === 'ArrowRight') buttonNext.click();
});

setupAutocomplete({
  input,
  container: suggestions,
  getNames: () => allNames,
  onSelect: (name) => renderPokemon(name),
});

applyTheme(getTheme());
renderFavorites();
renderPokemon(searchPokemon);
loadNames();
