# CLAUDE.md

Guidance for AI-assisted development in this repository.

## Project overview

End-to-end and API test automation for the **Dutch-English Phrase Game**
(`https://dutch-english-phrase-game.netlify.app/`). Tests run against the
**deployed** site — there is no app source in this repo, only the test suite.

- **UI tests:** Playwright (`@playwright/test`), Page Object Model, Allure reporting.
- **API tests:** pytest + `requests` HTTP smoke tests (opt-in via `RUN_API_TESTS=1`).
- Target URL is overridable with the `GAME_URL` (UI) / `API_BASE_URL` (API) env vars.

## Architecture

Page Object Model. Specs stay thin; all locators and interactions live in page objects.

| Path | Role |
|------|------|
| `pages/HomePage.js` | Name-entry step: name field + Enter. |
| `pages/CategoryPage.js` | Category `<select>` + Start; exports `CATEGORY_VALUES`, `ROUND_ALERT_LABEL`. |
| `pages/GamePage.js` | In-round UI: timer, question, choices, result, Next, Play again, layout widgets. |
| `pages/urls.js` | Default base URL (`GAME_URL` override). |
| `utils/dialogHandler.js` | `attachAutoAcceptDialogs` (accept only) and `attachDialogHandler` (assert alert copy + accept). |
| `helpers/phraseHelpers.js` | Browser-free: parse Dutch from question text; map phrase → English via `data/data.json`. |
| `tests/helpers/gotoSimpleCategoryGame.js` | Flow helper: `gotoCategoryGame(page, name, key)` + `gotoSimpleCategoryGame` shorthand. Returns a `GamePage`. |
| `data/data.json` | Phrase fixture (`{ phrases: [{ dutch: string\|string[], english: string }] }`). |

## Test structure

`tests/` holds four Playwright spec files + the API suite:

- **Browser-free (fast, deterministic):** `tests/phraseHelpers.spec.js`, `tests/dataContract.spec.js`.
- **UI / E2E:** `tests/ui.spec.js` (onboarding per category, layout), `tests/game.spec.js` (answer, wrong-answer, replay).
- **API:** `tests/api/test_api.py` (skipped unless `RUN_API_TESTS=1`).

Tests carry `@tag`s (`@ui`, `@smoke`, `@game`, `@onboarding`, `@layout`, `@unit`, `@data`, `@replay`) — filter with `--grep @smoke`.

## Coding conventions

- CommonJS (`require`/`module.exports`); Node 20; no TypeScript (JSDoc types only).
- **Locators: prefer stable `#id` selectors** over text/role matching (see the inline
  comments citing the locator inventory). Role+name matching is a last resort and is
  substring-based — guard against strict-mode multi-match.
- Specs must not re-parse UI text by hand — go through page objects + `phraseHelpers`.
- Alert assertions use regex (`\d+`, `\s+`) so minor copy/spacing drift doesn't break tests.
- Phrase lookups trim whitespace; `data.json` may use a `dutch` **array of alternates**.

## Execution commands

```bash
npm test                       # all Playwright specs, all 3 browsers
npx playwright test --project=chromium          # one browser
npx playwright test --grep @smoke               # by tag
npx playwright test tests/phraseHelpers.spec.js tests/dataContract.spec.js --project=chromium  # fast unit/contract only
RUN_API_TESTS=1 npm run test:api                # API smoke tests (otherwise skipped)
npm run test:allure:report && npm run test:allure:open   # Allure report (needs Java 17+)
```

No linter or type-checker is configured (no ESLint/Prettier/tsconfig). If adding one,
wire it into `package.json` scripts and the CI workflow.

## CI/CD

`.github/workflows/playwright.yml` — runs on push/PR to `master`, two parallel jobs:

- **API (pytest)** — Python 3.10, `RUN_API_TESTS=1`, HTML report artifact.
- **UI (Playwright)** — Node 20, installs browsers, waits for Netlify, runs all 3 browsers,
  uploads Playwright HTML report + Allure (raw results and a tarballed static site).

`playwright.config.js`: `retries: 2` in CI / `0` locally; 30s timeout; trace/video/screenshot
retained on failure in CI.

## Maintenance guidelines

- **UI tests depend on the live Netlify deploy** — failures can be the site/network, not the tests.
  Reproduce locally before assuming a regression.
- **Known flaky test:** onboarding's phrase-inventory alert assertion
  (`utils/dialogHandler.js`, `Simple/Interview/Professional phrases: \d+`) can fire before the
  app populates per-category counts (`"Phrases available right now:"` with an empty list).
  CI `retries: 2` masks it. Prefer asserting alert copy in the test body over throwing inside
  the `page.on('dialog')` listener.
- After editing locators, run the quick browser-free + smoke subset before the full matrix.
- Keep `data/data.json` in sync with the deployed content; `dataContract.spec.js` enforces
  shape and Dutch-phrase uniqueness.
- New flow helpers belong in `tests/helpers/`; new reusable interactions belong on a page object.
