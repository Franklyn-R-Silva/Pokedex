import type { Lang } from '../../types';

// Rótulos do construtor de deck (PT, EN) — feature autocontida.
const L = {
  title: ['🃏 Construtor de Deck', '🃏 Deck Builder'],
  open: ['🃏 Deck', '🃏 Deck'],
  back: ['← Voltar', '← Back'],
  searchPlaceholder: ['Buscar carta pelo nome…', 'Search cards by name…'],
  all: ['Todas', 'All'],
  pokemon: ['Pokémon', 'Pokémon'],
  trainer: ['Treinador', 'Trainer'],
  energy: ['Energia', 'Energy'],
  deck: ['Deck', 'Deck'],
  clear: ['Limpar', 'Clear'],
  empty: ['Seu deck está vazio. Busque cartas ao lado e clique para adicionar.', 'Your deck is empty. Search cards and click to add.'],
  loading: ['Carregando…', 'Loading…'],
  noResults: ['Nenhuma carta encontrada.', 'No cards found.'],
  composition: ['Composição', 'Composition'],
  energyCurve: ['Custo de energia dos ataques', 'Attack energy cost'],
  basics: ['Pokémon Básicos', 'Basic Pokémon'],
  score: ['Nota do deck', 'Deck score'],
  whatsMissing: ['Análise — o que falta', 'Analysis — what to improve'],
  catalog: ['Catálogo', 'Catalog'],
  analysis: ['Análise', 'Analysis'],
  meta: ['Decks do meta:', 'Meta decks:'],
  buildingMeta: ['Montando deck…', 'Building deck…'],
  expertTips: ['Sugestões do especialista', 'Expert suggestions'],
  strengths: ['Forças do deck', 'Deck strengths'],
  mostUsed: ['Mais usado', 'Most used'],
  ofMeta: ['do meta', 'of meta'],
  source: ['Cartas e preços via', 'Cards & prices via'],
  metaArchetypes: ['Arquétipos do meta via', 'Meta archetypes via'],
  clearFilters: ['Limpar filtros', 'Clear filters'],
  viewDeck: ['Ver deck', 'View deck'],
  close: ['Fechar', 'Close'],
} as const;

export function dl(lang: Lang, key: keyof typeof L): string {
  return L[key][lang === 'pt' ? 0 : 1];
}

// Rótulos dos eixos do radar de forças.
export function strengthLabel(lang: Lang, key: string): string {
  const pt = lang === 'pt';
  switch (key) {
    case 'consistency':
      return pt ? 'Consistência' : 'Consistency';
    case 'power':
      return pt ? 'Poder' : 'Power';
    case 'hp':
      return pt ? 'HP/Defesa' : 'HP/Defense';
    case 'energy':
      return pt ? 'Energia' : 'Energy';
    case 'speed':
      return pt ? 'Velocidade' : 'Speed';
    case 'support':
      return pt ? 'Suporte' : 'Support';
    default:
      return key;
  }
}

// Texto dos apontamentos da análise (por código), com valor interpolado.
export function issueText(lang: Lang, code: string, value?: string | number): string {
  const pt = lang === 'pt';
  switch (code) {
    case 'tooFew':
      return pt ? `Faltam ${value} cartas para 60.` : `${value} cards short of 60.`;
    case 'tooMany':
      return pt ? `${value} cartas a mais (máx. 60).` : `${value} cards over the 60 limit.`;
    case 'sizeOk':
      return pt ? 'Deck com 60 cartas.' : 'Deck has 60 cards.';
    case 'noPokemon':
      return pt ? 'Sem Pokémon — adicione ao menos 1 Básico.' : 'No Pokémon — add at least 1 Basic.';
    case 'fewBasics':
      return pt
        ? `Poucos Pokémon Básicos (${value}) — risco de mão travada, ideal ≥ 8.`
        : `Too few Basic Pokémon (${value}) — mulligan risk, aim for ≥ 8.`;
    case 'basicsOk':
      return pt ? 'Bons Pokémon Básicos.' : 'Healthy Basic Pokémon count.';
    case 'noEnergy':
      return pt ? 'Sem Energia para os seus atacantes.' : 'No Energy for your attackers.';
    case 'energyMissing':
      return pt
        ? `Energia ${value} insuficiente para os custos dos seus atacantes.`
        : `Not enough ${value} Energy for your attackers' costs.`;
    case 'fewTrainers':
      return pt
        ? `Poucos Treinadores (${value}) — deck forte costuma ter ~25–35.`
        : `Few Trainers (${value}) — strong decks run ~25–35.`;
    case 'tooManyCopies':
      return pt ? `Mais de 4 cópias de "${value}".` : `More than 4 copies of "${value}".`;
    case 'evoGap':
      return pt
        ? `Linha incompleta: falta "${value}".`
        : `Incomplete evolution line: missing "${value}".`;
    // Sugestões de especialista
    case 'tipFewPokemon':
      return pt
        ? `Poucos Pokémon (${value}) — o ideal é ~12–20 para não ficar sem atacante.`
        : `Few Pokémon (${value}) — aim for ~12–20 so you always have an attacker.`;
    case 'tipManyPokemon':
      return pt
        ? `Muitos Pokémon (${value}) — corte alguns por mais Treinadores de consistência.`
        : `Too many Pokémon (${value}) — cut a few for consistency Trainers.`;
    case 'tipDraw':
      return pt
        ? `Poucos Supporters de compra (${value}) — mire ~6–10 (Professor's Research, Iono…).`
        : `Few draw Supporters (${value}) — aim for ~6–10 (Professor's Research, Iono…).`;
    case 'tipManyEnergy':
      return pt
        ? `Muita Energia (${value}) — a maioria dos decks roda ~8–15; troque por Treinadores.`
        : `Lots of Energy (${value}) — most decks run ~8–15; swap some for Trainers.`;
    case 'tipFewEnergy':
      return pt
        ? `Pouca Energia (${value}) — pode faltar para atacar; considere +energia ou aceleração.`
        : `Low Energy (${value}) — you may whiff attacks; add energy or acceleration.`;
    case 'tipHighCurve':
      return pt
        ? 'Curva de energia alta — inclua aceleração de energia para atacar mais cedo.'
        : 'High energy curve — add energy acceleration to attack sooner.';
    case 'tipSolid':
      return pt ? 'Deck sólido e consistente! 👌' : 'Solid, consistent deck! 👌';
    default:
      return code;
  }
}
