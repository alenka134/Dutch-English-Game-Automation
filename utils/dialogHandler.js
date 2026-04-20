const { expect } = require('@playwright/test');

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
 * Matches live app copy: `Welcome, ${name}!` and `Round: N <category lowercased>. …`
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} name Player name submitted in the name step.
 * @param {{ roundCategory?: string | null }} [options]
 *   Lowercase fragment expected in the round alert (e.g. `simple phrases`).
 *   Pass `null` to only assert `Round:` + a numeric count, not the category label.
 */
function attachDialogHandler(page, name, options = {}) {
  const { roundCategory = 'simple phrases' } = options;

  page.on('dialog', async (dialog) => {
    const msg = dialog.message();

    if (msg.includes('Welcome')) {
      expect(msg).toBe(`Welcome, ${name}!`);
    }

    if (msg.includes('Each round has about') || msg.includes('Phrases available right now')) {
      expect(msg).toMatch(/Simple phrases:\s*\d+/i);
      expect(msg).toMatch(/Interview phrases:\s*\d+/i);
      expect(msg).toMatch(/Professional phrases:\s*\d+/i);
    }

    if (msg.includes('Round:')) {
      expect(msg).toMatch(/Round:\s*\d+/i);
      if (roundCategory != null && roundCategory !== '') {
        expect(msg).toMatch(new RegExp(escapeRegExp(roundCategory), 'i'));
      }
    }

    await dialog.accept();
  });
}

module.exports = { attachAutoAcceptDialogs, attachDialogHandler };
