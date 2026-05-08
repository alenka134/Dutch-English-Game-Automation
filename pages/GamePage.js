const { expect } = require('@playwright/test');
const { dutchPhraseFromQuestion, englishForPhrase } = require('../helpers/phraseHelpers');

const QUESTION_QUOTE_REGEX = /['"][^'"]+['"]/;

/**
 * In-round UI: timer, question, choices, result, next, layout summary widgets.
 */
class GamePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.root = page.locator('.game');
    this.question = this.root.locator('.question');
    this.choices = this.root.locator('.choices');
    this.result = this.root.locator('.result');
    /** `#next-btn` — stable id (`unstable-locators.md`: avoid Pause/Continue name churn). */
    this.nextButton = page.locator('#next-btn');
    /** `#view-results-btn` sits outside `.game` in markup; anchor at page level. */
    this.viewResultsButton = page.locator('#view-results-btn');
    this.topResult = page.locator('.top-result');
    this.scoreboardPlayerTable = page.locator('table.scoreboard.player-summary-table');
  }

  async expectGameScreenVisible() {
    await expect(this.root).toBeVisible({ timeout: 10_000 });
    /** Prefer `#timer` over copy-only matchers (`locator-inventory.md` stability 8+). Regex avoids exact second races. */
    await expect(this.root.locator('#timer')).toHaveText(/\d+/);
  }

  async getQuestionText() {
    const raw = await this.question.textContent();
    return (raw ?? '').trim();
  }

  async getCurrentDutchPhrase() {
    return dutchPhraseFromQuestion(await this.getQuestionText());
  }

  async getCorrectEnglishAnswer() {
    return englishForPhrase(await this.getCurrentDutchPhrase());
  }

  /** @param {string} englishLabel */
  choiceButton(englishLabel) {
    return this.choices.getByRole('button', { name: englishLabel });
  }

  async expectResultVisible() {
    await expect(this.result).toBeVisible();
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async answerCurrentQuestion() {
    await this.expectGameScreenVisible();
    const correct = await this.getCorrectEnglishAnswer();
    await this.choiceButton(correct).click();
    await this.expectResultVisible();
    await this.clickNext();
  }

  /** Stops when the question no longer shows a quoted Dutch phrase (session summary / end). */
  async playUntilRoundEnds(maxRounds = 30) {
    for (let i = 0; i < maxRounds; i += 1) {
      const raw = await this.getQuestionText();
      if (!QUESTION_QUOTE_REGEX.test(raw)) {
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

module.exports = { GamePage };
