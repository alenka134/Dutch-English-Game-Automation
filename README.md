# Dutch-English Phrase Game Automation

Playwright end-to-end tests for the [Dutch-English Phrase Game](https://dutch-english-phrase-game.netlify.app/).

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/alenka134/Dutch-English-Game-Automation.git
   cd Dutch-English-Game-Automation
   ```

2. Install dependencies and browsers, then run tests:

   ```bash
   npm install
   npx playwright install
   npm test
   ```

   Use `npx playwright test --project=chromium` to run only Chromium. Add `--headed` to see the browser.
