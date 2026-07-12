// Formatação/derivação de dados extra da PokéAPI (sobre, gênero, golpes…).
import type { Pokemon, Species, Lang, EvolutionDetail } from '../types';

// Termos finitos traduzidos manualmente (mais precisos que tradução automática).
const GROWTH_PT: Record<string, string> = {
  slow: 'Lento',
  medium: 'Médio',
  fast: 'Rápido',
  'medium-slow': 'Médio-lento',
  'slow-then-very-fast': 'Errático',
  'fast-then-very-slow': 'Flutuante',
};

const EGG_PT: Record<string, string> = {
  monster: 'Monstro',
  water1: 'Água 1',
  water2: 'Água 2',
  water3: 'Água 3',
  bug: 'Inseto',
  flying: 'Voador',
  ground: 'Campo',
  fairy: 'Fada',
  plant: 'Planta',
  humanshape: 'Humanoide',
  mineral: 'Mineral',
  indeterminate: 'Amorfo',
  ditto: 'Ditto',
  dragon: 'Dragão',
  'no-eggs': 'Sem ovos',
};

const HABITAT_PT: Record<string, string> = {
  cave: 'Caverna',
  forest: 'Floresta',
  grassland: 'Campo',
  mountain: 'Montanha',
  rare: 'Raro',
  'rough-terrain': 'Terreno acidentado',
  sea: 'Mar',
  urban: 'Urbano',
  'waters-edge': "Beira d'água",
};

const ROMAN: Record<string, string> = {
  i: 'I',
  ii: 'II',
  iii: 'III',
  iv: 'IV',
  v: 'V',
  vi: 'VI',
  vii: 'VII',
  viii: 'VIII',
  ix: 'IX',
};

/** "human-like" → "Human Like". */
export function titleize(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "generation-iv" → "Gen IV". */
export function formatGeneration(name: string): string {
  const roman = ROMAN[name.replace('generation-', '')];
  return roman ? `Gen ${roman}` : titleize(name);
}

/** gender_rate (chance de ser fêmea em oitavos; -1 = sem gênero). */
export function formatGender(rate: number, genderlessLabel: string): string {
  if (rate < 0) return genderlessLabel;
  const female = (rate / 8) * 100;
  return `♀ ${female.toFixed(0)}% · ♂ ${(100 - female).toFixed(0)}%`;
}

/** Traduz termos finitos (crescimento/ovo/habitat); em EN usa o slug formatado. */
export function localizeTerm(kind: 'growth' | 'egg' | 'habitat', slug: string, lang: Lang): string {
  if (lang !== 'pt') return titleize(slug);
  const map = kind === 'growth' ? GROWTH_PT : kind === 'egg' ? EGG_PT : HABITAT_PT;
  return map[slug] ?? titleize(slug);
}

/** Descreve como um Pokémon evolui (nível, item, troca, amizade…). */
export function formatEvolution(detail: EvolutionDetail | undefined, lang: Lang): string {
  if (!detail) return '';
  if (detail.min_level)
    return lang === 'pt' ? `Nv. ${detail.min_level}` : `Lv. ${detail.min_level}`;
  if (detail.trigger.name === 'trade') return lang === 'pt' ? 'Troca' : 'Trade';
  if (detail.item) return titleize(detail.item.name);
  if (detail.min_happiness) return lang === 'pt' ? 'Amizade' : 'Friendship';
  if (detail.held_item) return titleize(detail.held_item.name);
  return titleize(detail.trigger.name);
}

export interface AboutRow {
  key: string;
  value: string;
}

/** Linhas do grid "Sobre" (chave i18n + valor já formatado). */
export function aboutRows(
  pokemon: Pokemon,
  species: Species,
  genderlessLabel: string,
  lang: Lang,
): AboutRow[] {
  const rows: AboutRow[] = [
    { key: 'baseExp', value: pokemon.base_experience ? String(pokemon.base_experience) : '—' },
    { key: 'captureRate', value: String(species.capture_rate) },
    { key: 'happiness', value: String(species.base_happiness) },
    { key: 'growth', value: localizeTerm('growth', species.growth_rate?.name ?? '—', lang) },
    { key: 'gender', value: formatGender(species.gender_rate, genderlessLabel) },
    {
      key: 'eggGroups',
      value: species.egg_groups.map((g) => localizeTerm('egg', g.name, lang)).join(', ') || '—',
    },
    { key: 'hatch', value: String(species.hatch_counter) },
    { key: 'generation', value: formatGeneration(species.generation.name) },
  ];
  if (species.habitat) {
    rows.push({ key: 'habitat', value: localizeTerm('habitat', species.habitat.name, lang) });
  }
  return rows;
}

/** Flags da espécie (chaves i18n: baby/legendary/mythical). */
export function speciesFlags(species: Species): string[] {
  const flags: string[] = [];
  if (species.is_baby) flags.push('baby');
  if (species.is_legendary) flags.push('legendary');
  if (species.is_mythical) flags.push('mythical');
  return flags;
}

export interface MoveEntry {
  name: string;
  level: number;
}

/** Agrupa os golpes por método de aprendizado, sem duplicatas. */
export function groupMoves(pokemon: Pokemon): Record<string, MoveEntry[]> {
  const groups: Record<string, Map<string, number>> = {};

  for (const entry of pokemon.moves) {
    for (const detail of entry.version_group_details) {
      const method = detail.move_learn_method.name;
      const map = (groups[method] ??= new Map<string, number>());
      const level = detail.level_learned_at;
      const current = map.get(entry.move.name);
      // Mantém o menor nível > 0 (ou 0 quando não é por nível).
      if (current === undefined || (level > 0 && (current === 0 || level < current))) {
        map.set(entry.move.name, level);
      }
    }
  }

  const result: Record<string, MoveEntry[]> = {};
  for (const [method, map] of Object.entries(groups)) {
    result[method] = [...map.entries()]
      .map(([name, level]) => ({ name, level }))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }
  return result;
}
