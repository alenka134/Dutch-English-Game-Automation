const { expect } = require('@playwright/test');

/** Category `<select>` + “Start Game!” (outside `.game` until play starts). */
class CategoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.panel = page.locator('.category-selection');
    /** `#category-selector` — stable id; keeps label semantics via `for` association in app HTML. */
    this.categorySelect = page.locator('#category-selector');
    /** `#start-btn` — avoids flaky matches on icon-only or punctuation drift (`Start Game!`). */
    this.startButton = page.locator('#start-btn');
  }

  async expectVisible() {
    await expect(this.panel).toBeVisible();
    await expect(this.categorySelect).toBeVisible();
    await expect(this.startButton).toBeVisible();
  }

  /**
   * @param {string} value Option `value` from the app (`simple_phrases`, `interview_phrases`, `professional_phrases`).
   */
  async selectCategoryByValue(value) {
    await this.categorySelect.selectOption(value);
  }

  async startGame() {
    await expect(this.startButton).toBeEnabled();
    await this.startButton.click();
  }
}

/** Stable category keys from `script.js` / Netlify `data.json`. */
const CATEGORY_VALUES = {
  SIMPLE: 'simple_phrases',
  INTERVIEW: 'interview_phrases',
  PROFESSIONAL: 'professional_phrases',
};

/** Lowercase label in the round `alert()` (`categoryLabel(key).toLowerCase()` in the app). */
const ROUND_ALERT_LABEL = {
  SIMPLE: 'simple phrases',
  INTERVIEW: 'interview phrases',
  PROFESSIONAL: 'professional phrases',
};

module.exports = { CategoryPage, CATEGORY_VALUES, ROUND_ALERT_LABEL };
