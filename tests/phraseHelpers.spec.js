const { test, expect } = require('@playwright/test');
const { dutchPhraseFromQuestion, englishForPhrase, entryMatchesDutch } = require('../helpers/phraseHelpers');

test.describe('phraseHelpers', () => {
  test('extracts a Dutch phrase from text with double quotes', () => {
    const question = 'Translate this phrase: "Goedemorgen"';
    expect(dutchPhraseFromQuestion(question)).toBe('Goedemorgen');
  });

  test('extracts a Dutch phrase from text with single quotes', () => {
    const question = "Pick the correct English translation for 'Dank je wel'";
    expect(dutchPhraseFromQuestion(question)).toBe('Dank je wel');
  });

  test('throws when the question has no quoted phrase', () => {
    expect(() => dutchPhraseFromQuestion('No phrase here')).toThrow('No quoted Dutch phrase in question');
  });

  test('finds the correct English translation for a phrase', () => {
    const english = englishForPhrase('Goedemorgen');
    expect(english).toBe('Good morning');
  });

  test('entryMatchesDutch handles array and string values', () => {
    expect(entryMatchesDutch({ dutch: ['a', 'b'], english: 'x' }, 'b')).toBe(true);
    expect(entryMatchesDutch({ dutch: 'hello', english: 'x' }, 'hello')).toBe(true);
    expect(entryMatchesDutch({ dutch: ' hello ', english: 'x' }, 'hello')).toBe(true);
  });
});