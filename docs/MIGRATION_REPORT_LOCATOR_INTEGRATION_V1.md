# Migration report — Locator integration v1

**Branch:** `locator-integration-v1`  
**Source artifacts:** `dutch_english_game/locator-tools/output/` (`locator-inventory.md`, `unstable-locators.md`, `playwright-pageobjects.ts`, `navigation-map.md`)  
**Scope:** Safe, incremental locator hardening inside **DutchEnglishAutomation** only. No changes to production game source, CI workflow structure, reporters, or Playwright config shape.

---

## 1. Framework analysis (baseline)

| Area | Style observed |
|------|----------------|
| Language | CommonJS `.js`, Playwright Test |
| Pages | Thin classes: `HomePage`, `CategoryPage`, `GamePage` (+ `urls.js`) |
| Flow helper | `tests/helpers/gotoSimpleCategoryGame.js` wires dialogs → home → category → game |
| Dialogs | `utils/dialogHandler.js` — **`attachDialogHandler`** (assertive) + **`attachAutoAcceptDialogs`** |
| Fixture data | `data/data.json` drives `englishForPhrase` / quoted-Dutch extraction |
| Allure | `playwright.config.js` — **`allure-playwright`** unchanged |
| Selector strategy | Predominantly **role/name** queries; gameplay choices use **fixture-driven exact button names** (aligned with MCQ mitigation in `unstable-locators.md`) |

### Main stability risks (pre-change)

| Risk | Evidence |
|------|----------|
| Pause / Continue churn | Inventory flags toggling DOM on `#pause-btn` |
| Icons + punctuation on CTAs | `getByRole` on “Start Game” / icons could drift vs `#start-btn` |
| Timer assertions on full sentence | “Time left” copy could change translations; **`#timer`** is narrower |
| Native `alert()` ordering | Already mitigated by `attachDialogHandler` |

---

## 2. What was reused

- Existing page object class names and public methods (`submitName`, `expectVisible`, `startGame`, `answerCurrentQuestion`, `playUntilRoundEnds`, …).
- `gotoSimpleCategoryGame` flow and `attachDialogHandler` assertions.
- `phraseHelpers` + tests (no behavioural change required for this migration).
- Allure reporter block and CI-facing reporter rules in **`playwright.config.js`** — **not edited**.

---

## 3. What was improved ( locator mapping )

Integrated guidance from generated TS page objects **only by translating stable patterns into existing JS APIs** — no duplicate TypeScript page layer introduced.

---

## 4. Locator replacements — before → after

| Surface | Before | After | Rationale (artifact) |
|---------|--------|-------|---------------------|
| Name field | `getByRole('textbox', { name: … })` | `getByLabel(/what is your name/i)` | Label association — primary strategy in inventory |
| Enter | `getByRole('button', { name: 'Enter' })` | `#enter-btn` | Stable id (`locator-inventory.md` 10) |
| Category `<select>` | `getByLabel(/Select Phrase Category/i)` | `#category-selector` | Stable id + still valid control node |
| Start game | `getByRole('button', { name: /Start Game/i })` | `#start-btn` | Avoid punctuation/icon brittleness (`unstable-locators`) |
| Next | `getByRole('button', { name: 'Next' })` | `#next-btn` | Stable id |
| View results | `getByRole('button', { name: /View results/i })` | `#view-results-btn` | Lives outside `.game`; id-stable |
| Game visible assertion | Visible text `/Time left/i` | Visible `#timer` + `toHaveText(/\d+/)` | Timer digit check avoids headline copy churn (`unstable-locators` timer guidance) |

**Intentionally unchanged (already stable / fixture-driven)**

- `.game`, `.question`, `.choices`, `.result` scaffolding.
- `choices.getByRole('button', { name: englishLabel })` with helper-resolved labels (no `nth-child`).

---

## 5. Files modified

| File | Change |
|------|--------|
| `pages/HomePage.js` | Label-based name field + `#enter-btn` |
| `pages/CategoryPage.js` | `#category-selector`, `#start-btn` |
| `pages/GamePage.js` | `#next-btn`, `#view-results-btn`, `#timer`-based visibility |

**New**

| File | Purpose |
|------|---------|
| `docs/MIGRATION_REPORT_LOCATOR_INTEGRATION_V1.md` | This report |

---

## 6. Risks / unstable areas still present

| Area | Notes |
|------|-------|
| Native alerts | Still environment-dependent ordering; mitigated by existing handler, not DOM locators |
| Random Dutch variant rows | `dutch: string[]` in JSON — phrase helper already matches any variant |
| `localStorage` scoreboard | Layout test depends on post-game DOM; not addressed here |
| Speech / TTS | Not covered by current suite |
| Resume `(n/m)` button | Not referenced in tests; if added later use `#round-progress-btn` per inventory |

---

## 7. Validation checklist

Run locally after `npm ci`:

```bash
npx playwright test
```

Allure (`allure-results/`) continues to populate via existing Playwright reporters.

---

## 8. Suggested next steps (non-blocking)

1. Optional accessors on `GamePage` for **`#pause-btn`**, **`#stop-btn`**, **`#stop-modal`**, **`#stop-back-btn`** using the same incremental style — only when pause/stop E2E coverage is added.
2. If copy changes for onboarding, consider smoke assertion on **`h1`/role heading** aligned with inventory (currently not asserted in specs).
3. Keep `locator-tools/output/` as the authoring reference when the game UI changes; reconcile this migration report in future PRs.
