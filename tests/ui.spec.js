const { test, expect } = require('@playwright/test');
const { gotoSimpleCategoryGame } = require('./helpers/gotoSimpleCategoryGame');

test('full onboarding flow reaches the game screen', { tag: ['@ui', '@smoke', '@onboarding'] }, async ({
  page,
}) => {
  const game = await gotoSimpleCategoryGame(page, 'Tester');

  await game.expectGameScreenVisible();
});

test('top result width matches scoreboard', { tag: ['@ui', '@layout'] }, async ({ page }) => {
  const game = await gotoSimpleCategoryGame(page, 'Tester');

  await game.expectGameScreenVisible();

  await game.playUntilRoundEnds();
  await game.openViewResultsIfNeeded();

  await expect(game.topResult).toBeVisible();
  await expect(game.scoreboardPlayerTable).toBeVisible();

  const topWidth = await game.topResult.evaluate((el) => el.offsetWidth);
  const scoreWidth = await game.scoreboardPlayerTable.evaluate((el) => el.offsetWidth);

  expect(Math.abs(topWidth - scoreWidth)).toBeLessThanOrEqual(10);
});
