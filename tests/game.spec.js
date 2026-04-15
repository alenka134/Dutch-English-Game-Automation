const { test, expect } = require('@playwright/test');
const testData = require('../data/data.json');

const GAME_URL = 'https://dutch-english-phrase-game.netlify.app/';

/**
 * The app may show e.g. `Translate this phrase: "…"` or
 * `Pick the correct English translation` plus a quoted Dutch line.
 * @param {string} rawQuestion
 */
function dutchPhraseFromQuestion(rawQuestion) {
  const match = rawQuestion.match(/"([^"]+)"/);
  if (!match) {
    throw new Error(`No quoted Dutch phrase in question: ${JSON.stringify(rawQuestion.trim())}`);
  }
  return match[1].trim();
}

/** @param {{ dutch: string | string[], english: string }} entry @param {string} phrase */
function entryMatchesDutch(entry, phrase) {
  if (Array.isArray(entry.dutch)) {
    return entry.dutch.some((d) => d.trim() === phrase);
  }
  return entry.dutch.trim() === phrase;
}

/** @param {string} dutchPhrase */
function englishForPhrase(dutchPhrase) {
  const match = testData.phrases.find((p) => entryMatchesDutch(p, dutchPhrase));
  if (!match) {
    throw new Error(`No matching phrase in data for: ${JSON.stringify(dutchPhrase)}`);
  }
  return match.english;
}

test.describe('Dutch-English Phrase Game', () => {
  test('enters name, answers first question, advances', async ({ page }) => {
    await page.goto(GAME_URL);

    await page.locator('#name').fill('Test Player');
    await page.locator('#enter-btn').click();

    const startButton = page.locator('#start-btn');
    await expect(startButton).toBeVisible();
    await startButton.click();

    await expect(page.locator('.game')).toBeVisible();

    const questionLocator = page.locator('.question');
    const question = (await questionLocator.textContent()).trim();
    const dutchPhrase = dutchPhraseFromQuestion(question);
    const correctAnswer = englishForPhrase(dutchPhrase);

    await page.locator(`.choices button:has-text("${correctAnswer}")`).click();

    const resultDiv = page.locator('.result');
    await expect(resultDiv).toBeVisible();

    await page.locator('#next-btn').click();

    const newQuestion = (await questionLocator.textContent()).trim();
    expect(newQuestion).not.toBe(question);
  });
});
