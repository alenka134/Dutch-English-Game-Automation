const { test, expect } = require('@playwright/test');
const { attachDialogHandler } = require('../utils/dialogHandler');
const { HomePage } = require('../pages/HomePage');
const { CategoryPage, CATEGORY_VALUES, ROUND_ALERT_LABEL } = require('../pages/CategoryPage');
const { GamePage } = require('../pages/GamePage');

test.describe('Dutch-English Phrase Game', () => {
  test('enters name, answers first question, advances', async ({ page }) => {
    attachDialogHandler(page, 'Test Player', { roundCategory: ROUND_ALERT_LABEL.SIMPLE });

    const home = new HomePage(page);
    const category = new CategoryPage(page);
    const game = new GamePage(page);

    await home.goto();
    await home.submitName('Test Player');
    await category.expectVisible();
    await category.selectCategoryByValue(CATEGORY_VALUES.SIMPLE);
    await category.startGame();
    await game.expectGameScreenVisible();

    const firstQuestion = await game.getQuestionText();
    await game.answerCurrentQuestion();

    const nextQuestion = await game.getQuestionText();
    expect(nextQuestion).not.toBe(firstQuestion);
  });
});
