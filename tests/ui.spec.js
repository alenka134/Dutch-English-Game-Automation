const { test, expect } = require('@playwright/test');
const { attachDialogHandler } = require('../utils/dialogHandler');
const { HomePage } = require('../pages/HomePage');
const { CategoryPage, CATEGORY_VALUES } = require('../pages/CategoryPage');
const { GamePage } = require('../pages/GamePage');

test('full onboarding flow reaches the game screen', async ({ page }) => {
  attachDialogHandler(page, 'Tester', { roundCategory: 'simple phrases' });

  const home = new HomePage(page);
  const category = new CategoryPage(page);
  const game = new GamePage(page);

  await home.goto();
  await home.submitName('Tester');

  await category.expectVisible();
  await category.selectCategoryByValue(CATEGORY_VALUES.SIMPLE);
  await category.startGame();

  await game.expectGameScreenVisible();
});

test('top result width matches scoreboard', async ({ page }) => {
  attachDialogHandler(page, 'Tester', { roundCategory: 'simple phrases' });

  const home = new HomePage(page);
  const category = new CategoryPage(page);
  const game = new GamePage(page);

  await home.goto();
  await home.submitName('Tester');
  await category.expectVisible();
  await category.selectCategoryByValue(CATEGORY_VALUES.SIMPLE);
  await category.startGame();
  await game.expectGameScreenVisible();

  await game.playUntilRoundEnds();
  await game.openViewResultsIfNeeded();

  await expect(game.topResult).toBeVisible();
  await expect(game.scoreboardPlayerTable).toBeVisible();

  const topWidth = await game.topResult.evaluate((el) => el.offsetWidth);
  const scoreWidth = await game.scoreboardPlayerTable.evaluate((el) => el.offsetWidth);

  expect(Math.abs(topWidth - scoreWidth)).toBeLessThan(10);
});
