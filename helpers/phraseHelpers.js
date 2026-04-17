const testData = require('../data/data.json');

const QUOTED_PHRASE_REGEX = /(?:"([^"]+)"|'([^']+)')/;

/**
 * The app may show `Translate this phrase: "…"` or
 * `Pick the correct English translation` plus a quoted Dutch line.
 * @param {string} rawQuestion
 */
function dutchPhraseFromQuestion(rawQuestion) {
  const text = String(rawQuestion ?? '').trim();
  const match = text.match(QUOTED_PHRASE_REGEX);
  if (!match) {
    throw new Error(`No quoted Dutch phrase in question: ${JSON.stringify(text)}`);
  }
  return (match[1] || match[2]).trim();
}

/** @param {{ dutch: string | string[], english: string }} entry @param {string} phrase */
function entryMatchesDutch(entry, phrase) {
  const normalized = phrase.trim();
  if (Array.isArray(entry.dutch)) {
    return entry.dutch.some((d) => d.trim() === normalized);
  }
  return entry.dutch.trim() === normalized;
}

/** @param {string} dutchPhrase */
function englishForPhrase(dutchPhrase) {
  const normalized = String(dutchPhrase ?? '').trim();
  const match = testData.phrases.find((p) => entryMatchesDutch(p, normalized));
  if (!match) {
    throw new Error(`No matching phrase in data for: ${JSON.stringify(normalized)}`);
  }
  return match.english;
}

module.exports = { dutchPhraseFromQuestion, entryMatchesDutch, englishForPhrase };
