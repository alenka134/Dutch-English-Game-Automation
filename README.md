# 🧪 Dutch-English Phrase Game Automation

![Playwright Tests](https://github.com/alenka134/Dutch-English-Game-Automation/actions/workflows/playwright.yml/badge.svg)

Playwright end-to-end tests and lightweight HTTP smoke tests for the [Dutch-English Phrase Game](https://dutch-english-phrase-game.netlify.app/). CI runs both (see **QA Tests (UI + API)** in GitHub Actions).

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

- **GitHub Actions:** open the workflow run → section **Artifacts** → download **api-html-report** or **playwright-html-report** (open `index.html` in a browser). If UI tests **fail**, an extra artifact **playwright-test-results** is uploaded (screenshots, video, trace under `test-results/`). Each job also writes a short summary on the run page (**API** vs **UI**).
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
