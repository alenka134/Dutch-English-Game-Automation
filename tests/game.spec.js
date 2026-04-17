const { test, expect } = require('@playwright/test');
const { GameAppPage } = require('../pages/GameAppPage');

test.describe('Dutch-English Phrase Game', () => {
  test('enters name, answers first question, advances', async ({ page }) => {
    const game = new GameAppPage(page);

    await game.goto();
    await game.enterNameAndContinue('Test Player');
    await game.startGameFromLobby();
    await game.expectGameVisible();

    const firstQuestion = await game.getQuestionText();
    await game.answerCurrentQuestion();

    const nextQuestion = await game.getQuestionText();
    expect(nextQuestion).not.toBe(firstQuestion);
  });
});
