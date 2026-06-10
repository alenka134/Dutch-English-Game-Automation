const { expect } = require('@playwright/test');
const { ROUND_ALERT_LABEL } = require('../pages/CategoryPage');

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Multi-word phrase: tolerate extra spaces between words in UI copy. */
function spacedPhrasePattern(phrase) {
  return String(phrase)
    .trim()
    .split(/\s+/)
    .map(escapeRegExp)
    .join('\\s+');
}

/**
 * Auto-accept `window.alert` / `confirm` / `prompt` so scripted flows do not hang.
 * Register **before** the first action that can open a dialog.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ onDialog?: (dialog: import('@playwright/test').Dialog) => void }} [options]
 *   Optional hook to assert on message text or log order.
 */
function attachAutoAcceptDialogs(page, options = {}) {
  const { onDialog } = options;
  page.on('dialog', async (dialog) => {
    onDialog?.(dialog);
    await dialog.accept();
  });
}

/**
 * Asserts typical game `alert()` content (flexible phrase counts), then accepts.
 * Uses regex for copy so minor spacing / punctuation tweaks in `alert()` text do not break tests.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} name Player name submitted in the name step.
 * @param {{ roundCategory?: string | null }} [options]
 *   Lowercase fragment expected in the round alert (e.g. `simple phrases`).
 *   Pass `null` to only assert `Round:` + a numeric count, not the category label.
 */
function attachDialogHandler(page, name, options = {}) {
  const { roundCategory = ROUND_ALERT_LABEL.SIMPLE } = options;

  page.on('dialog', async (dialog) => {
    const msg = dialog.message();

    // Accept first, then assert. Otherwise a failing expect() inside this
    // listener leaves the dialog open and the test hangs until timeout
    // instead of surfacing the real failure.
    try {
      await dialog.accept();
    } finally {
      if (/welcome/i.test(msg)) {
        expect(msg).toMatch(
          new RegExp(`Welcome\\s*,\\s*${escapeRegExp(name)}\\s*!`, 'i'),
        );
      }

      if (/each\s+round\s+has\s+about/i.test(msg) || /phrases\s+available/i.test(msg)) {
        expect(msg).toMatch(/Simple\s+phrases\s*:\s*\d+/i);
        expect(msg).toMatch(/Interview\s+phrases\s*:\s*\d+/i);
        expect(msg).toMatch(/Professional\s+phrases\s*:\s*\d+/i);
      }

      if (/round\s*:/i.test(msg)) {
        expect(msg).toMatch(/Round\s*:\s*\d+/i);
        if (roundCategory != null && roundCategory !== '') {
          expect(msg).toMatch(new RegExp(spacedPhrasePattern(roundCategory), 'i'));
        }
      }
    }
  });
}

module.exports = { attachAutoAcceptDialogs, attachDialogHandler };
