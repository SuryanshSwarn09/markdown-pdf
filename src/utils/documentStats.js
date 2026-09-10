/**
 * Document statistics utility for calculating word count, character count,
 * and estimated reading time from markdown text.
 */

/**
 * Counts the number of words in a markdown or plain text string.
 *
 * @param {string} text - Raw input text.
 * @returns {number} Total word count.
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match contiguous non-whitespace sequences
  const words = trimmed.split(/\s+/);
  return words.length;
}

/**
 * Counts total characters in a string.
 *
 * @param {string} text - Raw input text.
 * @returns {number} Total character count.
 */
export function countCharacters(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.length;
}

/**
 * Calculates estimated reading time based on an average adult reading speed of 200 WPM.
 *
 * @param {number} wordCount - Total number of words.
 * @returns {string} Human-readable reading time estimate (e.g. "< 1 min read", "3 min read").
 */
export function calculateReadingTime(wordCount) {
  if (!wordCount || wordCount < 0) return '< 1 min read';
  const minutes = Math.ceil(wordCount / 200);
  if (minutes <= 1) return '< 1 min read';
  return `~${minutes} min read`;
}

/**
 * Computes comprehensive document statistics for a given text.
 *
 * @param {string} text - Raw document string.
 * @returns {{ words: number, characters: number, readingTime: string }}
 */
export function getDocumentStats(text) {
  const words = countWords(text);
  const characters = countCharacters(text);
  const readingTime = calculateReadingTime(words);
  return { words, characters, readingTime };
}
