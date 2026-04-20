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

  nameInput() {
    return this.page.getByRole('textbox', { name: /what is your name/i });
  }

  enterButton() {
    return this.page.getByRole('button', { name: 'Enter' });
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
