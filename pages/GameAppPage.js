const { expect } = require('@playwright/test');
const { dutchPhraseFromQuestion, englishForPhrase } = require('../helpers/phraseHelpers');

const DEFAULT_GAME_URL = 'https://dutch-english-phrase-game.netlify.app/';

/**
 * Page Object for the Dutch–English Phrase Game (Netlify).
 */
class GameAppPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page, gameUrl = DEFAULT_GAME_URL) {
    this.page = page;
    this.gameUrl = gameUrl;
    this.nameInput = page.locator('#name');
    this.enterButton = page.locator('#enter-btn');
    this.startButton = page.locator('#start-btn');
    this.gameRoot = page.locator('.game');
    this.question = page.locator('.question');
    this.result = page.locator('.result');
    this.nextButton = page.locator('#next-btn');
    this.viewResultsButton = page.locator('#view-results-btn');
    this.topResult = page.locator('.top-result');
    this.scoreboardPlayerTable = page.locator('table.scoreboard.player-summary-table');
  }

  /** Register before actions that can open `window` dialogs. */
  acceptDialogs() {
    this.page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  async goto() {
    await this.page.goto(this.gameUrl);
  }

  /** @param {string} name */
  async enterNameAndContinue(name) {
    await this.nameInput.fill(name);
    await this.enterButton.click();
  }

  async startGameFromLobby() {
    await expect(this.startButton).toBeVisible();
    await this.startButton.click();
  }

  async expectGameVisible() {
    await expect(this.gameRoot).toBeVisible();
  }

  /** @param {string} englishLabel */
  choiceButtonForEnglish(englishLabel) {
    return this.page.locator(`.choices button:has-text("${englishLabel}")`);
  }

  async expectResultVisible() {
    await expect(this.result).toBeVisible();
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async answerCurrentQuestion() {
    await this.expectGameVisible();
    const question = (await this.question.textContent()).trim();
    const dutchPhrase = dutchPhraseFromQuestion(question);
    const correctAnswer = englishForPhrase(dutchPhrase);
    await this.choiceButtonForEnglish(correctAnswer).click();
    await this.expectResultVisible();
    await this.clickNext();
  }

  /** Play until `.question` no longer shows a quoted Dutch phrase (e.g. session summary). */
  async playUntilRoundEnds(maxRounds = 30) {
    for (let i = 0; i < maxRounds; i += 1) {
      const raw = ((await this.question.textContent()) ?? '').trim();
      if (!/"[^"]+"/.test(raw)) {
        return;
      }
      await this.answerCurrentQuestion();
    }
  }

  async openViewResultsIfNeeded() {
    if (!(await this.topResult.isVisible().catch(() => false))) {
      await expect(this.viewResultsButton).toBeVisible();
      await this.viewResultsButton.click();
    }
  }
}

module.exports = { GameAppPage, DEFAULT_GAME_URL };
