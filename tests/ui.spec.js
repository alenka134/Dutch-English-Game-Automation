const { test, expect } = require('@playwright/test');
const { GameAppPage } = require('../pages/GameAppPage');

test('Top result width matches scoreboard', async ({ page }) => {
  const game = new GameAppPage(page);

  game.acceptDialogs();
  await game.goto();
  await game.enterNameAndContinue('Tester');
  await game.startGameFromLobby();
  await game.expectGameVisible();

  await game.playUntilRoundEnds();

  await game.openViewResultsIfNeeded();

  await expect(game.topResult).toBeVisible();
  await expect(game.scoreboardPlayerTable).toBeVisible();

  const topWidth = await game.topResult.evaluate((el) => el.offsetWidth);
  const scoreWidth = await game.scoreboardPlayerTable.evaluate((el) => el.offsetWidth);

  expect(Math.abs(topWidth - scoreWidth)).toBeLessThan(10);
});
