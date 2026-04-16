# Handoff: results layout (fix in Dutch–English **game** repo)

## Where automation stopped

- **Test:** `tests/ui.spec.js` — `Top result width matches scoreboard`
- **Check:** Compare **element widths** (no hard-coded px):
  - `.top-result` → `offsetWidth` as `topWidth`
  - `table.scoreboard.player-summary-table` → `offsetWidth` as `scoreWidth`
- **Assertion:** `Math.abs(topWidth - scoreWidth) < 10` (10px tolerance)

## What to fix in the **game** (not this repo)

Align the **session/results** layout so the **top summary strip** and the **player-summary table** share the same content width (within **10px**).

- **Selectors to touch:** `.top-result`, and the player summary `table.scoreboard.player-summary-table` (and whatever wrapper controls their width — e.g. `.result`, flex/grid parents).
- **Observed when testing:** Chromium often showed ~**770px** vs ~**740px** (~**30px** gap). WebKit can diverge much more — treat cross-browser checks in the game after CSS changes.

## How to re-check

From this repo:

```bash
npx playwright test tests/ui.spec.js
```

## Playwright config note

`playwright.config.js` uses a fixed `viewport` / `video.size` (1280×720) and `deviceScaleFactor: 1` for stable layout and recordings.
