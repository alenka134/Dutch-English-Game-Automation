const { attachDialogHandler } = require('../../utils/dialogHandler');
const { HomePage } = require('../../pages/HomePage');
const { CategoryPage, CATEGORY_VALUES, ROUND_ALERT_LABEL } = require('../../pages/CategoryPage');
const { GamePage } = require('../../pages/GamePage');

/**
 * Dialogs + home → name → SIMPLE category → start. Returns a `GamePage` instance.
 * @param {import('@playwright/test').Page} page
 * @param {string} name Same string as passed to `attachDialogHandler`.
 */
async function gotoSimpleCategoryGame(page, name) {
  attachDialogHandler(page, name, { roundCategory: ROUND_ALERT_LABEL.SIMPLE });

  const home = new HomePage(page);
  const category = new CategoryPage(page);
  const game = new GamePage(page);

  await home.goto();
  await home.submitName(name);

  await category.expectVisible();
  await category.selectCategoryByValue(CATEGORY_VALUES.SIMPLE);
  await category.startGame();

  return game;
}

module.exports = { gotoSimpleCategoryGame };
