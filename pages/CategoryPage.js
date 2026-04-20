const { expect } = require('@playwright/test');

/** Category `<select>` + “Start Game!” (outside `.game` until play starts). */
class CategoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.panel = page.locator('.category-selection');
    this.categorySelect = page.getByLabel(/Select Phrase Category/i);
    this.startButton = page.getByRole('button', { name: /Start Game/i });
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

module.exports = { CategoryPage, CATEGORY_VALUES };
