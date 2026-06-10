const { test, expect } = require('@playwright/test');
const { gotoCategoryGame, gotoSimpleCategoryGame } = require('./helpers/gotoSimpleCategoryGame');

// SIMPLE keeps the @smoke tag so fast CI grep stays lean; INTERVIEW and
// PROFESSIONAL ride the broader @ui suite.
const ONBOARDING_CATEGORIES = [
  { key: 'SIMPLE', tags: ['@ui', '@smoke', '@onboarding'] },
  { key: 'INTERVIEW', tags: ['@ui', '@onboarding'] },
  { key: 'PROFESSIONAL', tags: ['@ui', '@onboarding'] },
];

for (const { key, tags } of ONBOARDING_CATEGORIES) {
  test(`full onboarding flow reaches the game screen (${key})`, { tag: tags }, async ({ page }) => {
    const game = await gotoCategoryGame(page, 'Tester', key);

    await game.expectGameScreenVisible();
  });
}

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
