const { test, expect } = require('@playwright/test');
const { gotoSimpleCategoryGame } = require('./helpers/gotoSimpleCategoryGame');
const { CategoryPage } = require('../pages/CategoryPage');

test.describe('Dutch-English Phrase Game', () => {
  test('enters name, answers first question, advances', { tag: ['@ui', '@game', '@smoke'] }, async ({
    page,
  }) => {
    const game = await gotoSimpleCategoryGame(page, 'Test Player');

    await game.expectGameScreenVisible();

    const firstQuestion = await game.getQuestionText();
    await game.answerCurrentQuestion();

    const nextQuestion = await game.getQuestionText();
    expect(nextQuestion).not.toBe(firstQuestion);
  });

  test('selecting a wrong answer still shows result and advances', { tag: ['@ui', '@game'] }, async ({
    page,
  }) => {
    const game = await gotoSimpleCategoryGame(page, 'Wrong Tester');

    await game.expectGameScreenVisible();

    const firstQuestion = await game.getQuestionText();
    await game.answerCurrentQuestionWrong();
    await game.clickNext();

    const nextQuestion = await game.getQuestionText();
    expect(nextQuestion).not.toBe(firstQuestion);
  });

  test('Play again starts a fresh round after results', { tag: ['@ui', '@game', '@replay'] }, async ({
    page,
  }) => {
    test.slow(); // full round + replay can exceed the default 30s budget.
    const game = await gotoSimpleCategoryGame(page, 'Replay Tester');

    await game.expectGameScreenVisible();
    await game.playUntilRoundEnds();
    await game.openViewResultsIfNeeded();

    await expect(game.topResult).toBeVisible();

    await game.clickPlayAgain();

    // "Play again" returns to the category screen (with the prior selection
    // retained), not straight back into the game. The user has to click
    // Start Game! again.
    const category = new CategoryPage(page);
    await category.expectVisible();
    await category.startGame();

    await game.expectGameScreenVisible();
    const replayDutch = await game.getCurrentDutchPhrase();
    expect(replayDutch.length).toBeGreaterThan(0);
  });
});
