const { test, expect } = require('@playwright/test');
const { GameAppPage } = require('../pages/GameAppPage');
const { dutchPhraseFromQuestion, englishForPhrase } = require('../helpers/phraseHelpers');

test.describe('Dutch-English Phrase Game', () => {
  test('enters name, answers first question, advances', async ({ page }) => {
    const game = new GameAppPage(page);

    await game.goto();
    await game.enterNameAndContinue('Test Player');
    await game.startGameFromLobby();
    await game.expectGameVisible();

    const questionLocator = game.question;
    const question = (await questionLocator.textContent()).trim();
    const dutchPhrase = dutchPhraseFromQuestion(question);
    const correctAnswer = englishForPhrase(dutchPhrase);

    await game.choiceButtonForEnglish(correctAnswer).click();
    await expect(game.result).toBeVisible();
    await game.clickNext();

    const newQuestion = (await questionLocator.textContent()).trim();
    expect(newQuestion).not.toBe(question);
  });
});
