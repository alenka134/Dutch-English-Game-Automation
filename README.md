# 🧪 Dutch-English Phrase Game Automation

![Playwright Tests](https://github.com/alenka134/Dutch-English-Game-Automation/actions/workflows/playwright.yml/badge.svg)

Playwright end-to-end tests (with a **Page Object Model** in `pages/`, shared helpers in `helpers/`), **Allure** UI reporting, and lightweight API smoke tests for the [Dutch-English Phrase Game](https://dutch-english-phrase-game.netlify.app/). CI runs API + UI on **master** (see **QA Tests (UI + API)** in GitHub Actions).

---

## Test layout (POM + Allure)

| Path | Role |
|------|------|
| `pages/GameAppPage.js` | Page Object: locators, navigation, and game flows (lobby → play → results). |
| `helpers/phraseHelpers.js` | Pure helpers (no Playwright): quoted Dutch in question text → phrase string; phrase → English via `data/data.json`. |
| `tests/game.spec.js`, `tests/ui.spec.js` | E2E specs: thin layers over `GameAppPage` + assertions. |
| `tests/phraseHelpers.spec.js` | Fast checks that parsing and `data/data.json` matching behave as expected (no browser). |

### Helper contract (`helpers/phraseHelpers.js`)

- **`dutchPhraseFromQuestion(rawQuestion)`** — Reads the Dutch snippet from the live question string. Supports **double-quoted** and **single-quoted** phrases; trims whitespace; throws if no quoted segment is found.
- **`englishForPhrase(dutchPhrase)`** — Looks up the English answer in **`data/data.json`** (`phrases[]`). Trims input; throws if nothing matches.
- **`entryMatchesDutch(entry, phrase)`** — Used internally for lookup; supports `entry.dutch` as a string or an array of alternates; compares trimmed strings.

Specs should not re-parse questions by hand: use **`GameAppPage`** methods or these helpers so UI text changes stay in one place.

### Page object API (`pages/GameAppPage.js`)

- **URL:** default production Netlify URL; override with env **`GAME_URL`** (full URL including trailing path if needed).
- **Flow:** `goto()` → `enterNameAndContinue(name)` → `startGameFromLobby()` (visible + **enabled** start button) → `expectGameVisible()` (`.game`, **10s** timeout for slower engines).
- **Question / answer:** `getQuestionText()`, `getCurrentDutchPhrase()`, `getCorrectEnglishAnswer()`, then `choiceButtonForEnglish(text)` or the combined **`answerCurrentQuestion()`** (expects result + clicks **Next**).
- **Round / summary:** `playUntilRoundEnds()` stops when the question no longer contains a quoted phrase; **`openViewResultsIfNeeded()`** uses **View results** when the top banner is not visible yet.
- **Dialogs:** call **`acceptDialogs()`** once before steps that can trigger `window` dialogs (e.g. some flows in `ui.spec.js`).

**Allure (Playwright):** each run writes `allure-results/`. Generate and open a static report locally (needs **Java 17+** on your machine, same as CI):

```bash
npm test
npm run test:allure:report
npm run test:allure:open
```

**Note:** `allure-playwright@2` matches the current `@playwright/test@1.49`. Newer **Allure 3** adapters expect `@playwright/test >= 1.53`; upgrade Playwright when you want to move to Allure 3.

---

## 🚀 Setup

Clone the repository:

```bash
git clone https://github.com/alenka134/Dutch-English-Game-Automation.git
cd Dutch-English-Game-Automation
```

Install **JavaScript** dependencies (Playwright):

```bash
npm install
npx playwright install
```

Install **Python** dependencies for API smoke tests (use **Python 3.10** to match the project’s interpreter):

```bash
python3.10 -m pip install -r tests/api/requirements.txt
```

---

## Running tests

### UI (Playwright)

```bash
npm test
```

Optional:

```bash
npx playwright test --project=chromium
npx playwright test --headed
```

Run only helper + main UI specs (quick sanity after refactors):

```bash
npx playwright test tests/phraseHelpers.spec.js tests/game.spec.js tests/ui.spec.js --workers=1
```

### API (pytest)

By default these hit **production** on Netlify. You must set `RUN_API_TESTS=1` or the tests are skipped.

```bash
export RUN_API_TESTS=1
python3.10 -m pytest tests/api -v
```

Local backend instead of Netlify:

```bash
export RUN_API_TESTS=1
export API_BASE_URL=http://127.0.0.1:8000
python3.10 -m pytest tests/api -v
```

On macOS, use `python3.10` (not `python`) if `python` is not on your `PATH`.

### UI + API (locally, sequential)

In CI, **API and UI run in parallel** (two jobs) for speed. Locally you can run both in two terminals, or sequentially:

```bash
export RUN_API_TESTS=1
python3.10 -m pytest tests/api -v && npx playwright test
```

### HTML reports (local)

**API (pytest-html):**

```bash
mkdir -p reports/api
export RUN_API_TESTS=1
python3.10 -m pytest tests/api -v --html=reports/api/index.html --self-contained-html
# Open reports/api/index.html in a browser
```

**UI (Playwright):** `playwright.config.js` turns on the HTML reporter when **`CI` is set** (same as GitHub Actions). For a local report that matches CI:

```bash
CI=true npx playwright test
# Open playwright-report/index.html (or: npx playwright show-report)
```

Quick one-off HTML without setting `CI`: `npx playwright test --reporter=html` (then open `playwright-report/index.html`).

---

## Verify before `git push` (VS Code terminal)

In **Terminal → New Terminal**, from the repo root run the same checks CI runs (API + UI). No need to generate HTML for a quick check.

```bash
cd /path/to/DutchEnglishAutomation   # or your clone folder
export RUN_API_TESTS=1
python3.10 -m pytest tests/api -v && npx playwright test
```

Review changes, then push:

```bash
git status
git diff
git push origin <your-branch>
```

### Git caveman: `master` on GitHub = `master` on your Mac

**You changed files → send to GitHub:**

```bash
git checkout master
git add -A
git commit -m "describe change"
git push origin master
```

**GitHub changed (you edited on web, other PC, or merged PR) → pull into local `master`:**

```bash
git checkout master
git pull origin master
```

Same branch name (`master`) locally and on `origin`; `pull` updates your Mac to match GitHub.

---

## CI reports & [QA Board](https://github.com/users/alenka134/projects/1)

- **GitHub Actions:** open the workflow run → section **Artifacts** → **api-html-report**, **playwright-html-report** (open `index.html`), **allure-results** (raw), **allure-report-site.tgz** (full Allure HTML: extract with `tar -xzf allure-report-site.tgz`, then open `index.html` in that folder). If UI tests **fail**, **playwright-test-results** includes screenshots, video, and traces under `test-results/`. Each job also writes a short summary on the run page (**API** vs **UI**).
- **Projects (QA Board):** the board tracks **issues and work items**, not embedded HTML. Use it for bugs and tasks; use **Actions → Artifacts** for full HTML test output. The workflow badge in this README reflects whether **both** jobs passed.

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
