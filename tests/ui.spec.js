const { test, expect } = require('@playwright/test');

test('Top result width matches scoreboard', async ({ page }) => {
  await page.goto('https://dutch-english-phrase-game.netlify.app/');

  // TODO: navigate to final screen

  const topResult = page.locator('.top-result');
  const scoreboard = page.locator('.scoreboard');

  const topWidth = await topResult.evaluate((el) => el.offsetWidth);
  const scoreWidth = await scoreboard.evaluate((el) => el.offsetWidth);

  expect(topWidth).toBeCloseTo(scoreWidth, 5);
});
