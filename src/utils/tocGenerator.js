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

/**
 * Safely masks code blocks and display math blocks so their internal lines
 * (e.g. # Python comments) are not mistaken for Markdown headings.
 *
 * @param {string} markdown
 * @returns {string} Markdown with masked code and math blocks
 */
function maskNonHeadingBlocks(markdown) {
  // Mask ``` ... ``` code blocks
  let masked = markdown.replace(/(```[\s\S]*?```)/g, (match) => {
    return match.replace(/^[ \t]*#/gm, ' _MASKED_HASH_');
  });

  // Mask ~~~ ... ~~~ code blocks
  masked = masked.replace(/(~~~[\s\S]*?~~~)/g, (match) => {
    return match.replace(/^[ \t]*#/gm, ' _MASKED_HASH_');
  });

  // Mask $$ ... $$ math blocks
  masked = masked.replace(/(\$\$[\s\S]*?\$\$)/g, (match) => {
    return match.replace(/^[ \t]*#/gm, ' _MASKED_HASH_');
  });

  return masked;
}

/**
 * Extracts markdown headings from text, skipping code blocks, math equations,
 * and optional self-referencing Table of Contents headings.
 *
 * @param {string} markdown - The markdown content.
 * @param {Object} [options]
 * @param {number} [options.minDepth=1] - Minimum heading level (e.g. 1 for #).
 * @param {number} [options.maxDepth=3] - Maximum heading level (e.g. 3 for ###).
 * @param {boolean} [options.skipTocHeading=true] - Whether to exclude "Table of Contents" headings.
 * @returns {Array<{ level: number, text: string, slug: string, raw: string }>}
 */
export function extractHeadings(markdown, options = {}) {
  if (!markdown || typeof markdown !== 'string') {
    return [];
  }

  const {
    minDepth = 1,
    maxDepth = 3,
    skipTocHeading = true,
  } = options;

  const masked = maskNonHeadingBlocks(markdown);
  const lines = masked.split(/\r?\n/);
  const headings = [];
  const slugCounts = new Map();

  const headingRegex = /^(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(headingRegex);
    if (!match) continue;

    const hashes = match[1];
    const level = hashes.length;

    if (level < minDepth || level > maxDepth) {
      continue;
    }

    const rawHeadingText = match[2].trim();
    // Clean display title (stripping markdown links if appropriate, but keeping readable text)
    const cleanDisplay = rawHeadingText
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [Label](url) -> Label
      .replace(/<[^>]*>/g, '') // remove html
      .trim();

    // Check if this is the Table of Contents heading itself
    if (skipTocHeading) {
      const lower = cleanDisplay.toLowerCase();
      if (lower === 'table of contents' || lower === 'contents' || lower === 'toc') {
        continue;
      }
    }

    const slug = slugifyHeading(rawHeadingText, slugCounts);

    headings.push({
      level,
      text: cleanDisplay,
      slug,
      raw: line,
    });
  }

  return headings;
}
