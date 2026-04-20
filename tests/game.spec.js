const { test, expect } = require('@playwright/test');
const { gotoSimpleCategoryGame } = require('./helpers/gotoSimpleCategoryGame');

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
});
