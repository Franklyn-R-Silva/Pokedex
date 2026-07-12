import { describe, it, expect } from 'vitest';
import { filterNames } from './autocomplete.js';

const NAMES = ['bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charizard', 'pikachu', 'raichu'];

describe('filterNames', () => {
  it('encontra por substring no meio/fim do nome', () => {
    expect(filterNames(NAMES, 'saur')).toEqual(['bulbasaur', 'ivysaur', 'venusaur']);
    expect(filterNames(NAMES, 'mander')).toEqual(['charmander']);
    expect(filterNames(NAMES, 'chu')).toEqual(['pikachu', 'raichu']);
  });

  it('prioriza correspondências no início', () => {
    // "char" começa em charmander/charizard; nenhum outro contém "char".
    expect(filterNames(NAMES, 'char')).toEqual(['charmander', 'charizard']);
  });

  it('é case-insensitive', () => {
    expect(filterNames(NAMES, 'PIKA')).toEqual(['pikachu']);
  });

  it('respeita o limite', () => {
    expect(filterNames(NAMES, 'a', 2)).toHaveLength(2);
  });

  it('retorna vazio para busca vazia', () => {
    expect(filterNames(NAMES, '')).toEqual([]);
  });
});
