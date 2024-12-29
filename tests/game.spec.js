const { test, expect } = require('@playwright/test');

// Load the JSON data
const testData = require('../data/data.json'); // Adjust this path if needed

test.describe('Dutch-English Phrase Game Automation', () => {
  test('Verify the game flow', async ({ page }) => {
    // Navigate to the game
    await page.goto('https://dutch-english-phrase-game.netlify.app/');

    // Enter the player's name
    const nameInput = page.locator('#name');
    const enterButton = page.locator('#enter-btn');

    await nameInput.fill('Test Player'); // Replace with any test name
    await enterButton.click();

    // Verify that the Start button is visible
    const startButton = page.locator('#start-btn');
    await expect(startButton).toBeVisible();
    console.log('Entered name and verified Start button is visible.');

    // Start the game
    await startButton.click();

    // Verify the Game UI is displayed
    const gameDiv = page.locator('.game');
    await expect(gameDiv).toBeVisible();
    console.log('Game started, and game UI is visible.');

    // Get the first question
    const question = (await page.locator('.question').textContent()).trim();
    console.log(`Question displayed: ${question}`);

    // Extract the Dutch phrase from the question and find the correct answer
    const currentPhrase = question.replace('Translate this phrase: "', '').replace('"', '').trim();
    const correctAnswer = testData.phrases.find(p => p.dutch.trim() === currentPhrase)?.english;

    if (!correctAnswer) {
      throw new Error(`No matching phrase found for the question: "${currentPhrase}"`);
    }
    console.log(`Correct Answer: ${correctAnswer}`);

    // Click the button with the correct answer
    const correctChoiceButton = page.locator(`.choices button:has-text("${correctAnswer}")`);
    await correctChoiceButton.click();
    console.log(`Clicked the correct answer: ${correctAnswer}`);

    // Verify feedback result
    const resultDiv = page.locator('.result');
    await expect(resultDiv).toBeVisible();

    const resultText = (await resultDiv.textContent()).trim();
    console.log(`Result displayed: ${resultText}`);

    // Click the Next button
    const nextButton = page.locator('#next-btn');
    await nextButton.click();

    // Verify a new question appears
    const newQuestion = (await page.locator('.question').textContent()).trim();
    expect(newQuestion).not.toBe(question);
    console.log(`New question displayed: ${newQuestion}`);

    // End the test after verifying the first question cycle
    console.log('Ending test after first question cycle.');
  });
});
