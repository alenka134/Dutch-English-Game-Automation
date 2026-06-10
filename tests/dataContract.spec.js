const { test, expect } = require('@playwright/test');
const data = require('../data/data.json');

test.describe('data/data.json contract', () => {
  test('phrases is a non-empty array', { tag: ['@unit', '@data'] }, () => {
    expect(Array.isArray(data.phrases)).toBe(true);
    expect(data.phrases.length).toBeGreaterThan(0);
  });

  test('every entry has non-empty dutch and english', { tag: ['@unit', '@data'] }, () => {
    for (const [i, entry] of data.phrases.entries()) {
      const where = `phrases[${i}]`;

      if (Array.isArray(entry.dutch)) {
        expect(entry.dutch.length, `${where}.dutch should be non-empty`).toBeGreaterThan(0);
        for (const [j, d] of entry.dutch.entries()) {
          expect(typeof d, `${where}.dutch[${j}] must be string`).toBe('string');
          expect(d.trim().length, `${where}.dutch[${j}] must be non-empty`).toBeGreaterThan(0);
        }
      } else {
        expect(typeof entry.dutch, `${where}.dutch must be string or string[]`).toBe('string');
        expect(entry.dutch.trim().length, `${where}.dutch must be non-empty`).toBeGreaterThan(0);
      }

      expect(typeof entry.english, `${where}.english must be string`).toBe('string');
      expect(entry.english.trim().length, `${where}.english must be non-empty`).toBeGreaterThan(0);
    }
  });

  test('dutch phrases are unique across entries', { tag: ['@unit', '@data'] }, () => {
    const seen = new Map();
    for (const [i, entry] of data.phrases.entries()) {
      const variants = Array.isArray(entry.dutch) ? entry.dutch : [entry.dutch];
      for (const v of variants) {
        const key = v.trim().toLowerCase();
        if (seen.has(key)) {
          throw new Error(
            `Duplicate Dutch phrase "${v}" at phrases[${i}] (already in phrases[${seen.get(key)}])`,
          );
        }
        seen.set(key, i);
      }
    }
  });
});
