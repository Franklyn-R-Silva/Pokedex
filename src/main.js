import './style.css';
import { fetchPokemon, fetchAllPokemonNames, getPokemonSprite, MAX_POKEMON } from './api.js';
import { getTypeColor, getTypeLabel } from './pokemonTypes.js';

const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');

const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const nameList = document.querySelector('#pokemon-list');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const buttonDownload = document.querySelector('.btn-download');

const typesContainer = document.querySelector('.details__types');
const heightValue = document.querySelector('.height');
const weightValue = document.querySelector('.weight');
const statsContainer = document.querySelector('.details__stats');
const details = document.querySelector('.details');

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
let currentSprite = null; // { url, name } do Pokémon exibido (para download).

function setLoading() {
  pokemonName.innerHTML = 'Carregando...';
  pokemonNumber.innerHTML = '';
}

function showError(message) {
  pokemonImage.style.display = 'none';
  pokemonName.innerHTML = message;
  pokemonNumber.innerHTML = '';
  details.classList.remove('is-visible');
  currentSprite = null;
  buttonDownload.disabled = true;
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

function renderDetails(data) {
  const primaryType = data.types[0]?.type?.name;
  document.documentElement.style.setProperty('--type-color', getTypeColor(primaryType));

  renderTypes(data.types);
  heightValue.textContent = `${(data.height / 10).toFixed(1)} m`;
  weightValue.textContent = `${(data.weight / 10).toFixed(1)} kg`;
  renderStats(data.stats);

  details.classList.add('is-visible');
}

async function renderPokemon(pokemon) {
  setLoading();

  let data;
  try {
    data = await fetchPokemon(pokemon);
  } catch {
    showError('Erro de conexão :c');
    return;
  }

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

  currentSprite = { url: sprite, name: data.name };
  buttonDownload.disabled = !sprite;

  renderDetails(data);
}

/**
 * Baixa a imagem do Pokémon exibido. Faz fetch do blob (a PokéAPI serve
 * os sprites com CORS liberado); em caso de falha, abre a imagem em nova aba.
 */
async function downloadSprite() {
  if (!currentSprite?.url) return;

  const { url, name } = currentSprite;
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
 * Popula o <datalist> com todos os nomes, habilitando o autocomplete da busca.
 */
async function populateNameList() {
  const names = await fetchAllPokemonNames();
  const fragment = document.createDocumentFragment();
  names.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    fragment.appendChild(option);
  });
  nameList.appendChild(fragment);
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

buttonDownload.addEventListener('click', downloadSprite);

// Navegação pelo teclado (setas esquerda/direita).
document.addEventListener('keydown', (event) => {
  if (document.activeElement === input) return;
  if (event.key === 'ArrowLeft') buttonPrev.click();
  if (event.key === 'ArrowRight') buttonNext.click();
});

renderPokemon(searchPokemon);
populateNameList();
