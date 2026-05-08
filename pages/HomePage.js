const DEFAULT_BASE_URL = require('./urls');

/**
 * Name entry step: label + textbox + Enter.
 */
class HomePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page, baseURL = DEFAULT_BASE_URL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  /** Label-associated field (`<label for="name">`). Prefer over role-only textbox queries. See `locator-tools/output/locator-inventory.md`. */
  nameInput() {
    return this.page.getByLabel(/what is your name/i);
  }

  /** Stable `id="enter-btn"` (icon/copy safe). */
  enterButton() {
    return this.page.locator('#enter-btn');
  }

  async goto() {
    await this.page.goto(this.baseURL);
  }

  /** Fill name and click Enter (triggers welcome + phrase-summary alerts if handlers are attached). */
  async submitName(name) {
    await this.nameInput().fill(name);
    await this.enterButton().click();
  }
}

module.exports = { HomePage };
