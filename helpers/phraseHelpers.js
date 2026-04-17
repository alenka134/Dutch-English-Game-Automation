const testData = require('../data/data.json');

/**
 * The app may show e.g. `Translate this phrase: "…"` or
 * `Pick the correct English translation` plus a quoted Dutch line.
 * @param {string} rawQuestion
 */
function dutchPhraseFromQuestion(rawQuestion) {
  const match = rawQuestion.match(/"([^"]+)"/);
  if (!match) {
    throw new Error(`No quoted Dutch phrase in question: ${JSON.stringify(rawQuestion.trim())}`);
  }
  return match[1].trim();
}

/** @param {{ dutch: string | string[], english: string }} entry @param {string} phrase */
function entryMatchesDutch(entry, phrase) {
  if (Array.isArray(entry.dutch)) {
    return entry.dutch.some((d) => d.trim() === phrase);
  }
  return entry.dutch.trim() === phrase;
}

/** @param {string} dutchPhrase */
function englishForPhrase(dutchPhrase) {
  const match = testData.phrases.find((p) => entryMatchesDutch(p, dutchPhrase));
  if (!match) {
    throw new Error(`No matching phrase in data for: ${JSON.stringify(dutchPhrase)}`);
  }
  return match.english;
}

module.exports = { dutchPhraseFromQuestion, entryMatchesDutch, englishForPhrase };
