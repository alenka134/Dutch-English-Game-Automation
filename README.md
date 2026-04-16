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

## QA Workflow

This project follows a simple and structured QA workflow:

* **Test plans** → `docs/templates/test-plan.md`
* **Test summaries** → `docs/templates/test-summary.md`
* **Bug tracking** → GitHub Issues (with bug report template)
* **Progress tracking** → GitHub Projects (QA Board)
* **Change history** → `CHANGELOG.md`

### Workflow Loop

1. Define scope (test plan)
2. Run tests (Playwright + manual)
3. Log bugs (GitHub Issues)
4. Fix and verify
5. Write test summary

### Goal

Keep testing:

* simple
* reproducible
* clearly documented
