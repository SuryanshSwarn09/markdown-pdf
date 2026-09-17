/**
 * Utilities for parsing markdown headings, generating slugified anchors,
 * and formatting Table of Contents (TOC) with instant navigation.
 */

/**
 * Converts heading text into a URL/anchor-friendly slug (GitHub-compatible).
 *
 * @param {string} text - The raw heading text.
 * @param {Map<string, number>|Set<string>} [slugCounts] - Tracking structure for disambiguating duplicates.
 * @returns {string} The slugified anchor ID.
 */
export function slugifyHeading(text, slugCounts) {
  if (!text || typeof text !== 'string') {
    return 'section';
  }

  // 1. Remove Markdown links [Label](url) -> Label
  let cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // 3. Remove inline code and math delimiters
  cleaned = cleaned.replace(/[`$]/g, '');

  // 4. Normalize to lowercase and remove non-alphanumeric chars (preserving whitespace and hyphens)
  cleaned = cleaned
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

  let baseSlug = cleaned || 'section';

  // 5. Handle duplicate slugs by appending -1, -2, etc.
  if (slugCounts instanceof Map) {
    const currentCount = slugCounts.get(baseSlug) || 0;
    slugCounts.set(baseSlug, currentCount + 1);
    if (currentCount > 0) {
      return `${baseSlug}-${currentCount}`;
    }
    return baseSlug;
  }

  if (slugCounts instanceof Set) {
    let finalSlug = baseSlug;
    let counter = 1;
    while (slugCounts.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugCounts.add(finalSlug);
    return finalSlug;
  }

  return baseSlug;
}
