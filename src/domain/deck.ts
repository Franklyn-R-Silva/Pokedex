// Regras e análise de um deck do TCG (puro, sem DOM). Um deck válido tem 60
// cartas, no máx. 4 cópias por nome (exceto Energia Básica) e ao menos 1
// Pokémon Básico. A análise gera uma nota + apontamentos ("o que falta").
import type { TcgCard } from '../types';

export interface DeckEntry {
  card: TcgCard;
  count: number;
}

export type IssueLevel = 'ok' | 'warn' | 'error';

export interface DeckIssue {
  level: IssueLevel;
  code: string;
  value?: string | number;
}

export interface DeckAnalysis {
  size: number;
  pokemon: number;
  trainer: number;
  energy: number;
  basics: number;
  supporters: number;
  energyByType: Record<string, number>;
  neededTypes: string[];
  costCurve: number[];
  score: number;
  grade: string;
  issues: DeckIssue[];
  tips: DeckIssue[];
  standardLegal: boolean;
  expandedLegal: boolean;
  illegalStandard: number;
  /** Perfil de forças (0–100) para o radar: no que o deck é forte. */
  strengths: DeckStrength[];
}

export type StrengthKey = 'consistency' | 'power' | 'hp' | 'energy' | 'speed' | 'support';

export interface DeckStrength {
  key: StrengthKey;
  value: number;
}

export const DECK_SIZE = 60;
const MIN_BASICS = 8;

const isBasicEnergy = (c: TcgCard): boolean =>
  c.supertype === 'Energy' && c.subtypes.includes('Basic');

export const deckSize = (entries: DeckEntry[]): number =>
  entries.reduce((sum, e) => sum + e.count, 0);

/** Quantas cópias do mesmo nome ainda cabem (Energia Básica é ilimitada). */
export function copiesAllowed(card: TcgCard, currentCount: number): boolean {
  if (isBasicEnergy(card)) return true;
  return currentCount < 4;
}

function energyType(card: TcgCard): string | null {
  if (card.types.length > 0) return card.types[0];
  const match = /^(\w+)\s+Energy/i.exec(card.name);
  return match ? match[1] : null;
}

export function analyzeDeck(entries: DeckEntry[]): DeckAnalysis {
  const size = deckSize(entries);
  let pokemon = 0;
  let trainer = 0;
  let energy = 0;
  let basics = 0;
  let supporters = 0;
  const energyByType: Record<string, number> = {};
  const neededTypes = new Set<string>();
  const costCurve: number[] = [0, 0, 0, 0, 0]; // custos 0..4+
  const names = new Set<string>();
  const issues: DeckIssue[] = [];
  // Métricas para o perfil de forças (radar).
  let hpSum = 0;
  let hpCount = 0;
  let maxDamage = 0;
  let totalAttacks = 0;
  let lowCostAttacks = 0; // ataques de custo ≤ 2 (mais rápidos)

  for (const { card, count } of entries) {
    names.add(card.name.toLowerCase());
    if (card.supertype === 'Pokémon') {
      pokemon += count;
      const hp = parseInt(card.hp, 10);
      if (hp) {
        hpSum += hp * count;
        hpCount += count;
      }
      if (card.subtypes.includes('Basic')) basics += count;
      card.types.forEach((tp) => neededTypes.add(tp));
      card.attacks.forEach((atk) => {
        const cost = Math.min(4, atk.cost.length);
        costCurve[cost] += count;
        totalAttacks += count;
        if (atk.cost.length <= 2) lowCostAttacks += count;
        const dmg = parseInt((atk.damage || '').replace(/\D/g, ''), 10);
        if (dmg && dmg > maxDamage) maxDamage = dmg;
      });
    } else if (card.supertype === 'Trainer') {
      trainer += count;
      if (card.subtypes.includes('Supporter')) supporters += count;
    } else if (card.supertype === 'Energy') {
      energy += count;
      const type = energyType(card);
      if (type) energyByType[type] = (energyByType[type] ?? 0) + count;
    }
    // Regra das 4 cópias (exceto energia básica).
    if (!isBasicEnergy(card) && count > 4) {
      issues.push({ level: 'error', code: 'tooManyCopies', value: card.name });
    }
    // Linha de evolução incompleta.
    if (card.evolvesFrom && !names.has(card.evolvesFrom.toLowerCase())) {
      const hasBase = entries.some(
        (e) => e.card.name.toLowerCase() === card.evolvesFrom.toLowerCase(),
      );
      if (!hasBase) issues.push({ level: 'warn', code: 'evoGap', value: card.evolvesFrom });
    }
  }

  // Contagem total.
  if (size < DECK_SIZE) issues.push({ level: 'error', code: 'tooFew', value: DECK_SIZE - size });
  else if (size > DECK_SIZE)
    issues.push({ level: 'error', code: 'tooMany', value: size - DECK_SIZE });
  else issues.push({ level: 'ok', code: 'sizeOk' });

  // Pokémon básicos.
  if (pokemon === 0) issues.push({ level: 'error', code: 'noPokemon' });
  else if (basics < MIN_BASICS) issues.push({ level: 'warn', code: 'fewBasics', value: basics });
  else issues.push({ level: 'ok', code: 'basicsOk' });

  // Energia vs. tipos exigidos pelos atacantes.
  const needList = [...neededTypes];
  if (pokemon > 0 && energy === 0) issues.push({ level: 'warn', code: 'noEnergy' });
  needList.forEach((type) => {
    if (!energyByType[type]) issues.push({ level: 'warn', code: 'energyMissing', value: type });
  });

  // Treinadores (suporte de compra/busca).
  if (pokemon > 0 && trainer < 10) issues.push({ level: 'warn', code: 'fewTrainers', value: trainer });

  // Nota: penaliza por severidade.
  let score = 100;
  score -= Math.min(40, Math.abs(DECK_SIZE - size) * 2);
  if (pokemon === 0) score -= 30;
  else if (basics < MIN_BASICS) score -= 15;
  if (pokemon > 0 && energy === 0) score -= 15;
  score -= issues.filter((i) => i.code === 'tooManyCopies').length * 15;
  score -= issues.filter((i) => i.code === 'evoGap').length * 6;
  score -= issues.filter((i) => i.code === 'energyMissing').length * 5;
  if (issues.some((i) => i.code === 'fewTrainers')) score -= 8;
  score = Math.max(0, Math.min(100, score));

  const grade =
    score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  // Sugestões de especialista (proporções ideais e consistência).
  const tips: DeckIssue[] = [];
  if (pokemon > 0) {
    if (pokemon < 12) tips.push({ level: 'warn', code: 'tipFewPokemon', value: pokemon });
    else if (pokemon > 22) tips.push({ level: 'warn', code: 'tipManyPokemon', value: pokemon });
    if (supporters < 6) tips.push({ level: 'warn', code: 'tipDraw', value: supporters });
    if (energy > 20) tips.push({ level: 'warn', code: 'tipManyEnergy', value: energy });
    else if (energy >= 1 && energy < 6) tips.push({ level: 'warn', code: 'tipFewEnergy', value: energy });
    // Curva alta: muitos ataques custando 3+.
    const heavy = costCurve[3] + costCurve[4];
    if (heavy > pokemon) tips.push({ level: 'warn', code: 'tipHighCurve' });
  }
  if (size === DECK_SIZE && score >= 80 && tips.length === 0) {
    tips.push({ level: 'ok', code: 'tipSolid' });
  }

  // Perfil de forças (0–100) — heurístico, para o radar "no que o deck é forte".
  const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
  const avgHp = hpCount ? hpSum / hpCount : 0;
  const lowShare = totalAttacks ? lowCostAttacks / totalAttacks : 0;
  const strengths: DeckStrength[] =
    pokemon === 0
      ? []
      : [
          { key: 'consistency', value: clamp(supporters * 9 + trainer * 1.2) },
          { key: 'power', value: clamp(maxDamage / 3.3) },
          { key: 'hp', value: clamp((avgHp - 40) / 2.6) },
          { key: 'energy', value: clamp(energy * 6) },
          { key: 'speed', value: clamp(basics * 5 + lowShare * 50) },
          { key: 'support', value: clamp(trainer * 3) },
        ];

  // Legalidade de formato: todas as cartas precisam ser legais no formato.
  const illegalStandard = entries.filter((e) => !e.card.legalStandard).length;
  const standardLegal = entries.length > 0 && illegalStandard === 0;
  const expandedLegal = entries.length > 0 && entries.every((e) => e.card.legalExpanded);

  return {
    size,
    pokemon,
    trainer,
    energy,
    basics,
    supporters,
    energyByType,
    neededTypes: needList,
    costCurve,
    score,
    grade,
    issues,
    tips,
    standardLegal,
    expandedLegal,
    illegalStandard,
    strengths,
  };
}
