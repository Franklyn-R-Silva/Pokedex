import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('carrega, mostra o Pokémon e sugere na busca', async ({ page }) => {
  await page.goto('/?pokemon=25');
  await expect(page.locator('.pokemon__name')).toHaveText(/pikachu/i);
  await expect(page.locator('.pokedex')).toBeVisible();

  await page.fill('.input__search', 'char');
  await expect(page.locator('.suggestions .suggestion').first()).toBeVisible();
});

test('as abas do card de detalhes alternam', async ({ page }) => {
  await page.goto('/?pokemon=6');
  await expect(page.locator('.tab-panel[data-panel="about"]')).toBeVisible();
  await expect(page.locator('.tab-panel[data-panel="stats"]')).toBeHidden();

  await page.click('.tab[data-tab="stats"]');
  await expect(page.locator('.tab-panel[data-panel="stats"]')).toBeVisible();
  await expect(page.locator('.details__radar .radar')).toBeVisible();
});

test('construtor de deck abre e analisa', async ({ page }) => {
  await page.goto('/?view=deck');
  await expect(page.locator('.deck-builder')).toBeVisible();
  await expect(page.locator('.deck-count')).toContainText('/ 60');
  await expect(page.locator('.deck-score__value')).toBeVisible();
  await expect(page.locator('.deck-donut')).toBeVisible();
});

test('sem violações de acessibilidade críticas (axe)', async ({ page }) => {
  await page.goto('/?pokemon=1');
  await page.waitForTimeout(1500);

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
});
