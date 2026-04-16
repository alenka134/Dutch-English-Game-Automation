const { test, expect } = require('@playwright/test');
const testData = require('../data/data.json');

function dutchPhraseFromQuestion(rawQuestion) {
  const match = rawQuestion.match(/"([^"]+)"/);
  if (!match) {
    throw new Error(`No quoted Dutch phrase in question: ${JSON.stringify(rawQuestion.trim())}`);
  }
  return match[1].trim();
}

function entryMatchesDutch(entry, phrase) {
  if (Array.isArray(entry.dutch)) {
    return entry.dutch.some((d) => d.trim() === phrase);
  }
  return entry.dutch.trim() === phrase;
}

function englishForPhrase(dutchPhrase) {
  const match = testData.phrases.find((p) => entryMatchesDutch(p, dutchPhrase));
  if (!match) {
    throw new Error(`No matching phrase in data for: ${JSON.stringify(dutchPhrase)}`);
  }
  return match.english;
}

async function answerCurrentQuestion(page) {
  await expect(page.locator('.game')).toBeVisible();
  const question = (await page.locator('.question').textContent()).trim();
  const dutchPhrase = dutchPhraseFromQuestion(question);
  const correctAnswer = englishForPhrase(dutchPhrase);
  await page.locator(`.choices button:has-text("${correctAnswer}")`).click();
  await expect(page.locator('.result')).toBeVisible();
  await page.locator('#next-btn').click();
}

/** Play until `.question` no longer shows a quoted Dutch phrase (e.g. session summary). */
async function playUntilRoundEnds(page) {
  for (let i = 0; i < 30; i += 1) {
    const raw = ((await page.locator('.question').textContent()) ?? '').trim();
    if (!/"[^"]+"/.test(raw)) {
      return;
    }
    await answerCurrentQuestion(page);
  }
}

test('Top result width matches scoreboard', async ({ page }) => {
  await page.goto('https://dutch-english-phrase-game.netlify.app/');

  // Must register before any action that can open a dialog (e.g. submitting the name)
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.locator('#name').fill('Tester');
  await page.locator('#enter-btn').click();

  const startButton = page.locator('#start-btn');
  await expect(startButton).toBeVisible();
  await startButton.click();

  await playUntilRoundEnds(page);

  const topResult = page.locator('.top-result');
  // Two tables use `.scoreboard`; target player summary. The `<table>` is inset (~740px);
  // its parent `.result` card matches the top banner width (~770px).
  const scoreboardTable = page.locator('table.scoreboard.player-summary-table');

  // Summary may already be visible after the last Next; otherwise use View results from the lobby
  if (!(await topResult.isVisible().catch(() => false))) {
    const viewResults = page.locator('#view-results-btn');
    await expect(viewResults).toBeVisible();
    await viewResults.click();
  }

  await expect(topResult).toBeVisible();
  await expect(scoreboardTable).toBeVisible();

  /** Inner player-summary table width (layout spec). */
  const EXPECTED_WIDTH_PX = 740;

  const topWidth = await topResult.evaluate((el) => el.offsetWidth);
  const tableWidth = await scoreboardTable.evaluate((el) => el.offsetWidth);
  const summaryCardWidth = await scoreboardTable.evaluate(
    (el) => el.parentElement?.offsetWidth ?? 0,
  );

  expect(tableWidth).toBeCloseTo(EXPECTED_WIDTH_PX, 5);
  expect(topWidth).toBeCloseTo(summaryCardWidth, 5);
});
