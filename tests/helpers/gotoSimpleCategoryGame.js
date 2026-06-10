const { attachDialogHandler } = require('../../utils/dialogHandler');
const { HomePage } = require('../../pages/HomePage');
const { CategoryPage, CATEGORY_VALUES, ROUND_ALERT_LABEL } = require('../../pages/CategoryPage');
const { GamePage } = require('../../pages/GamePage');

/**
 * Dialogs + home → name → chosen category → start. Returns a `GamePage` instance.
 * @param {import('@playwright/test').Page} page
 * @param {string} name Same string as passed to `attachDialogHandler`.
 * @param {'SIMPLE'|'INTERVIEW'|'PROFESSIONAL'} [categoryKey='SIMPLE']
 */
async function gotoCategoryGame(page, name, categoryKey = 'SIMPLE') {
  const value = CATEGORY_VALUES[categoryKey];
  const label = ROUND_ALERT_LABEL[categoryKey];
  if (!value || !label) {
    throw new Error(`Unknown category key: ${categoryKey}`);
  }

  attachDialogHandler(page, name, { roundCategory: label });

  const home = new HomePage(page);
  const category = new CategoryPage(page);
  const game = new GamePage(page);

  await home.goto();
  await home.submitName(name);

  await category.expectVisible();
  await category.selectCategoryByValue(value);
  await category.startGame();

  return game;
}

/** Back-compat shorthand for the SIMPLE category. */
async function gotoSimpleCategoryGame(page, name) {
  return gotoCategoryGame(page, name, 'SIMPLE');
}

module.exports = { gotoCategoryGame, gotoSimpleCategoryGame };
