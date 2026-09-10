import { countWords, countCharacters, calculateReadingTime, getDocumentStats } from './documentStats.js';
import assert from 'node:assert';

console.log('Running test suite for documentStats...');

// 1. Empty and null inputs
assert.strictEqual(countWords(''), 0);
assert.strictEqual(countWords(null), 0);
assert.strictEqual(countWords(undefined), 0);
assert.strictEqual(countWords('   \n\t  '), 0);
assert.strictEqual(countCharacters(''), 0);
assert.strictEqual(countCharacters(null), 0);

// 2. Word counting with mixed whitespace and newlines
const sampleText = 'The quick brown fox\njumps over\t the lazy dog.';
assert.strictEqual(countWords(sampleText), 9);
assert.strictEqual(countCharacters(sampleText), sampleText.length);

// 3. Reading time estimation
assert.strictEqual(calculateReadingTime(0), '< 1 min read');
assert.strictEqual(calculateReadingTime(50), '< 1 min read');
assert.strictEqual(calculateReadingTime(199), '< 1 min read');
assert.strictEqual(calculateReadingTime(201), '~2 min read');
assert.strictEqual(calculateReadingTime(650), '~4 min read');

// 4. getDocumentStats aggregate function
const stats = getDocumentStats('Hello world from the markdown editor!');
assert.deepStrictEqual(stats, {
  words: 6,
  characters: 37,
  readingTime: '< 1 min read'
});

console.log('All documentStats tests passed successfully!');
