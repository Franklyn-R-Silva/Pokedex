// Formatação/derivação de dados extra da PokéAPI (sobre, gênero, golpes…).
import type { Pokemon, Species } from '../types';

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

export interface AboutRow {
  key: string;
  value: string;
}

/** Linhas do grid "Sobre" (chave i18n + valor já formatado). */
export function aboutRows(pokemon: Pokemon, species: Species, genderlessLabel: string): AboutRow[] {
  const rows: AboutRow[] = [
    { key: 'baseExp', value: pokemon.base_experience ? String(pokemon.base_experience) : '—' },
    { key: 'captureRate', value: String(species.capture_rate) },
    { key: 'happiness', value: String(species.base_happiness) },
    { key: 'growth', value: titleize(species.growth_rate?.name ?? '—') },
    { key: 'gender', value: formatGender(species.gender_rate, genderlessLabel) },
    { key: 'eggGroups', value: species.egg_groups.map((g) => titleize(g.name)).join(', ') || '—' },
    { key: 'hatch', value: String(species.hatch_counter) },
    { key: 'generation', value: formatGeneration(species.generation.name) },
  ];
  if (species.habitat) rows.push({ key: 'habitat', value: titleize(species.habitat.name) });
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
