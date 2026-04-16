# 🧪 Dutch-English Phrase Game Automation

![Playwright Tests](https://github.com/alenka134/Dutch-English-Game-Automation/actions/workflows/playwright.yml/badge.svg)

Playwright end-to-end tests for the [Dutch-English Phrase Game](https://dutch-english-phrase-game.netlify.app/).

---

## 🚀 Setup

Clone the repository:

```bash
git clone https://github.com/alenka134/Dutch-English-Game-Automation.git
cd Dutch-English-Game-Automation
````

Install dependencies:

```bash
npm install
npx playwright install
```

Run tests:

```bash
npm test
```

Optional:

```bash
npx playwright test --project=chromium
npx playwright test --headed
```

---

## 🧪 QA Workflow

This project follows a simple QA workflow:

* Test plans → `docs/templates/test-plan.md`
* Test summaries → `docs/templates/test-summary.md`
* Bug tracking → GitHub Issues (bug report template)
* Progress tracking → GitHub Projects (QA Board)
* Change history → `CHANGELOG.md`

### Workflow

1. Define test scope
2. Run automated tests
3. Log bugs in GitHub Issues
4. Fix and verify
5. Document results in test summary

---

### 🎯 Goal

Keep testing simple, reproducible, and well documented.
