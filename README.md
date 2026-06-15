# Dutch-English Phrase Game — Test Automation

![QA Tests](https://github.com/alenka134/Dutch-English-Game-Automation/actions/workflows/playwright.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![pytest](https://img.shields.io/badge/pytest-0A9EDC?logo=pytest&logoColor=white)
![Allure](https://img.shields.io/badge/Allure-FF6F61?logo=qameta&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)

> **QA Automation portfolio.** Cross-browser E2E and API test suite for a live web app —
> Page Object Model design, three rendering engines, API smoke checks, CI on every push,
> and Allure reporting. Built to demonstrate test *strategy and maintainability*, not just
> green checkmarks.

End-to-end and API test automation for the [Dutch-English Phrase Game](https://dutch-english-phrase-game.netlify.app/),
a small browser game that quizzes the player on Dutch phrases. The tests run against the
**deployed** site — this repository contains the test suite only, not the application.

The suite combines fast, deterministic checks (data contracts and pure helper logic) with
browser-driven E2E flows across three engines and HTTP smoke tests, wired into CI with
Playwright and Allure reporting.

## Project Overview

The game under test has no public API contract, no test hooks, and no source in this repo —
a realistic "test a third-party web app you don't own" scenario. The goal of this suite is to
verify the **user-facing behaviour that matters** (onboarding, answering, scoring, replay)
while staying resilient to the cosmetic copy and markup drift typical of a hobby app on a
rolling deploy.

Design priorities, in order:

1. **Stability over coverage breadth** — a flaky portfolio suite is worse than a small honest one.
2. **A clear failure story** — when a test fails, it should be obvious whether the bug is in the
   app, the network/deploy, or the test.
3. **Cheap maintenance** — UI text and locators live in one place (page objects), so app churn
   touches one file, not every spec.

## Tech Stack

| Layer | Choice | Notes |
| ----- | ------ | ----- |
| E2E / UI | [Playwright](https://playwright.dev/) (`@playwright/test`) | Chromium, Firefox, WebKit |
| Test design | Page Object Model | Locators and interactions isolated from specs |
| Reporting | Allure + Playwright HTML | Allure for trend/history; HTML for trace drill-down |
| API smoke | pytest + `requests` | Python 3.10, opt-in |
| CI | GitHub Actions | Two parallel jobs (UI + API) |
| Runtime | Node 20 (CommonJS, JSDoc types) | No TypeScript, no build step |

## QA Strategy

### What is tested

- **Onboarding flow (E2E):** name entry → category select → reaching the in-round game screen,
  parametrised across all three categories (`SIMPLE`, `INTERVIEW`, `PROFESSIONAL`).
- **Core gameplay (E2E):** answering correctly advances the question; answering **wrong** still
  shows a result and advances (negative path); **Play again** returns to the category screen and
  a fresh round can be started.
- **Layout regression (E2E):** the result widget width stays aligned with the scoreboard within a
  tolerance — a guard against the layout bug recorded in `LAYOUT_BUG_HANDOFF.md`.
- **Phrase logic (unit, browser-free):** parsing the quoted Dutch phrase out of question text
  (single/double quotes, whitespace), and mapping a phrase to its English answer — including the
  case where one entry lists several Dutch **alternates**.
- **Data contract (browser-free):** `data/data.json` is a non-empty array, every entry has
  non-empty `dutch`/`english`, and Dutch phrases are unique across entries.
- **API smoke (HTTP):** the deployed site returns `200`, serves a non-empty body containing the
  expected title, and responds correctly to browser-like headers.

### What is deliberately *not* tested

- **Scoring arithmetic / exact timer values** — the app exposes no stable hook for these, so
  asserting them would be guessing at internals and inherently flaky. The suite checks that a
  result appears and the round progresses, not the precise number.
- **Visual pixel diffs** — no screenshot baselines; the one layout check uses a numeric width
  tolerance instead, which survives font/rendering differences across the three browsers.
- **The application's own correctness as a product** — this suite validates observable behaviour
  against the data fixture; it does not own or guarantee the game's content.
- **Authentication / persistence / back-end state** — the game has none worth testing here.

### Assumptions

- The phrase fixture in `data/data.json` is kept **in sync** with the deployed content; the data
  contract spec enforces its shape, not its agreement with the live site.
- The live Netlify deploy is reachable. CI explicitly waits for it before the UI job so a cold
  deploy reports as "site not ready" rather than as a test failure.

## Architecture

Page Object Model: specs stay thin and assertion-focused; all locators and interactions live in
page objects, so app changes are absorbed in one place.

```text
pages/                     Page objects (UI surface)
  HomePage.js              Name-entry step
  CategoryPage.js          Category <select> + Start; exports CATEGORY_VALUES
  GamePage.js              In-round UI: timer, question, choices, result, Next, replay, layout
  urls.js                  Default base URL (GAME_URL override)
helpers/
  phraseHelpers.js         Pure, browser-free: parse Dutch from question, map phrase -> English
utils/
  dialogHandler.js         Alert handling: auto-accept, or assert copy + accept
data/
  data.json               Phrase fixture: { phrases: [{ dutch: string|string[], english }] }
tests/
  ui.spec.js               Onboarding per category + layout regression
  game.spec.js             Answer, wrong-answer, replay
  phraseHelpers.spec.js    Unit tests for the pure helpers
  dataContract.spec.js     Fixture shape + uniqueness
  helpers/
    gotoSimpleCategoryGame.js   Flow helper: gotoCategoryGame(page, name, key) -> GamePage
  api/
    test_api.py            pytest HTTP smoke tests (skipped unless RUN_API_TESTS=1)
playwright.config.js       3 browser projects; CI retries=2, local=0; trace/video on failure
.github/workflows/playwright.yml   CI: parallel UI + API jobs
```

Tests carry tags (`@ui`, `@smoke`, `@game`, `@onboarding`, `@layout`, `@unit`, `@data`,
`@replay`) so subsets can be selected with `--grep`.

## How to Run Tests

### Setup

```bash
npm install
npx playwright install
# For the API smoke tests (Python 3.10 to match CI):
python3.10 -m pip install -r tests/api/requirements.txt
```

### UI / E2E (Playwright)

```bash
npm test                                  # all specs, all 3 browsers
npx playwright test --project=chromium    # one browser
npx playwright test --grep @smoke         # by tag
npx playwright test --headed              # watch it run

# Fast, browser-free subset — quick sanity after a refactor:
npx playwright test tests/phraseHelpers.spec.js tests/dataContract.spec.js --project=chromium
```

Override the target site with `GAME_URL`.

### API smoke (pytest)

Opt-in — skipped unless `RUN_API_TESTS=1`. Defaults to production on Netlify; point at a local
back-end with `API_BASE_URL`.

```bash
RUN_API_TESTS=1 python3.10 -m pytest tests/api -v
RUN_API_TESTS=1 API_BASE_URL=http://127.0.0.1:8000 python3.10 -m pytest tests/api -v
```

### Reports (Allure)

Each Playwright run writes raw results to `allure-results/`. Generate and open a static report
(needs Java 17+, same as CI):

```bash
npm run test:allure:report && npm run test:allure:open
```

> `allure-playwright@2` is pinned to match `@playwright/test@1.49`. Allure 3 adapters require
> Playwright ≥ 1.53 — upgrade Playwright first if moving to Allure 3.

## Cross-browser Execution

The same E2E specs run on **Chromium, Firefox, and WebKit** (`playwright.config.js` defines one
project per engine). This is why the layout check uses a numeric width tolerance rather than a
pixel-perfect baseline — it must pass identically on all three rendering engines. A 1280×720
viewport and matching video size are fixed so traces and recordings are consistent across runs.

## CI/CD

Every push and pull request to `master` automatically runs the full suite on GitHub's
servers — no manual steps, results visible on every commit (the badge at the top reflects the
latest run). The workflow (`.github/workflows/playwright.yml`) splits into **two jobs that run
in parallel** for speed:

- **API (pytest)** — Python 3.10, `RUN_API_TESTS=1`, uploads a self-contained HTML report.
- **UI (Playwright)** — Node 20, installs browsers, **waits for the Netlify deploy**, runs all
  three browsers, and uploads the Playwright HTML report plus Allure results (raw + a tarballed
  static site). Screenshots, video, and traces are uploaded only on failure.

CI uses `retries: 2` (locally `0`) with a 30s per-test timeout. Retries mask the one known flaky
assertion (see below) rather than hiding real regressions — failures still surface in the report.

## Key Insights

- **Retries mask one known flake, not the suite.** The onboarding phrase-inventory alert
  (`utils/dialogHandler.js`) can fire before the app populates per-category counts. The lesson
  baked into the conventions: assert alert copy in the **test body**, not by throwing inside the
  `page.on('dialog')` listener, where a failure is hard to attribute. CI retries cover the timing
  gap; the design avoids creating new ones.

- **Copy drift is the enemy of UI assertions.** Alert text is matched with regex (`\d+`, `\s+`)
  so the suite tolerates count and spacing changes that don't represent real bugs. Specs never
  re-parse UI strings by hand — they go through page objects and `phraseHelpers`, keeping text
  knowledge in one place.

- **`Play again` does not do what its name implies.** It returns the player to the *category*
  screen (with the prior selection retained), not straight into a new round — an assumption that
  only surfaced by automating the flow. The replay test encodes the real behaviour, and the
  finding is documented inline rather than silently worked around.

- **Separate the fixture contract from the live site.** The data-contract spec proves the fixture
  is *well-formed and internally unique*; it intentionally does **not** assert the fixture equals
  the deployed content. Conflating the two would make a content edit on the site fail a "data
  shape" test — a misleading signal.

- **AI-assisted review:** an automated diff review pass is run over changes (see `CLAUDE.md`),
  primarily as a guard against locator regressions and dropped guards when page objects change.
  It is a second reviewer, not a gate — findings are triaged, not auto-applied.

---

Supporting docs: test-plan / test-summary templates under `docs/templates/`, change history in
`CHANGELOG.md`, and the layout-bug write-up in `LAYOUT_BUG_HANDOFF.md`.
