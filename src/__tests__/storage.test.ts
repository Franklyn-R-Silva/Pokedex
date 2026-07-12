import { describe, it, expect, beforeEach } from 'vitest';
import { getFavorites, isFavorite, toggleFavorite, getTheme, setTheme } from '../services/storage';

describe('storage — favoritos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa vazio', () => {
    expect(getFavorites()).toEqual([]);
  });

  it('adiciona e remove ao alternar', () => {
    toggleFavorite({ id: 25, name: 'pikachu' });
    expect(isFavorite(25)).toBe(true);
    expect(getFavorites()).toEqual([{ id: 25, name: 'pikachu' }]);

    toggleFavorite({ id: 25, name: 'pikachu' });
    expect(isFavorite(25)).toBe(false);
    expect(getFavorites()).toEqual([]);
  });

  it('mantém apenas o essencial (id, name)', () => {
    const withExtra = { id: 1, name: 'bulbasaur', extra: 'ignorado' };
    toggleFavorite(withExtra);
    expect(getFavorites()).toEqual([{ id: 1, name: 'bulbasaur' }]);
  });
});

describe('storage — tema', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('usa "light" por padrão e persiste a escolha', () => {
    expect(getTheme()).toBe('light');
    setTheme('dark');
    expect(getTheme()).toBe('dark');
  });
});
