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
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

/**
 * Generates a formatted, hyperlinked Markdown list for Table of Contents.
 *
 * @param {Array<{ level: number, text: string, slug: string }>|string} headingsOrMarkdown
 * @param {Object} [options]
 * @param {string|boolean} [options.title='## Table of Contents'] - Header title to prepend.
 * @param {number} [options.indentSpaces=2] - Spaces per nesting level.
 * @param {string} [options.bullet='-'] - Markdown list bullet.
 * @returns {string} Formatted Markdown TOC string.
 */
export function generateTOCMarkdown(headingsOrMarkdown, options = {}) {
  let headings = headingsOrMarkdown;
  if (typeof headingsOrMarkdown === 'string') {
    headings = extractHeadings(headingsOrMarkdown, options);
  }

  if (!Array.isArray(headings) || headings.length === 0) {
    return '';
  }

  const {
    title = '## Table of Contents',
    indentSpaces = 2,
    bullet = '-',
  } = options;

  // Find minimum heading depth to normalize root indentation
  const minLevel = Math.min(...headings.map(h => h.level));

  const items = headings.map(h => {
    const indentLevel = Math.max(0, h.level - minLevel);
    const indent = ' '.repeat(indentLevel * indentSpaces);
    return `${indent}${bullet} [${h.text}](#${h.slug})`;
  });

  const listBody = items.join('\n');

  if (title && typeof title === 'string' && title.trim()) {
    return `${title.trim()}\n\n${listBody}\n`;
  }

  return `${listBody}\n`;
}

export const TOC_START_COMMENT = '<!-- toc -->';
export const TOC_END_COMMENT = '<!-- /toc -->';

/**
 * Inserts a new Table of Contents or updates an existing TOC block in markdown.
 *
 * @param {string} currentMarkdown - Current document content.
 * @param {string} tocContent - TOC markdown string to insert.
 * @param {Object} [selection] - User's current cursor or selection range.
 * @param {number} [selection.start]
 * @param {number} [selection.end]
 * @returns {{ text: string, start: number, end: number, updated: boolean }}
 */
export function insertOrUpdateTOC(currentMarkdown, tocContent, selection = {}) {
  if (!tocContent || !tocContent.trim()) {
    return {
      text: currentMarkdown,
      start: selection.start || 0,
      end: selection.end || 0,
      updated: false,
    };
  }

  const wrappedTOC = `${TOC_START_COMMENT}\n${tocContent.trim()}\n${TOC_END_COMMENT}`;

  // 1. Check for comment-delimited TOC block
  const commentRegex = /<!--\s*toc\s*-->[\s\S]*?<!--\s*\/toc\s*-->/i;
  const commentMatch = currentMarkdown.match(commentRegex);
  if (commentMatch && commentMatch.index !== undefined) {
    const startIndex = commentMatch.index;
    const endIndex = startIndex + commentMatch[0].length;
    const newText = currentMarkdown.slice(0, startIndex) + wrappedTOC + currentMarkdown.slice(endIndex);
    return {
      text: newText,
      start: startIndex,
      end: startIndex + wrappedTOC.length,
      updated: true,
    };
  }

  // 2. Check for heading-based TOC block (e.g. ## Table of Contents\n\n- [Heading]...)
  const headingTocRegex = /(^|\n)(#{1,3}\s+(?:Table of Contents|Contents)\s*\n[\s\S]*?)(?=\n#{1,3}\s+|$)/i;
  const headingMatch = currentMarkdown.match(headingTocRegex);
  if (headingMatch && headingMatch.index !== undefined) {
    const prefixLen = headingMatch[1].length;
    const startIndex = headingMatch.index + prefixLen;
    const matchedContent = headingMatch[2];
    const endIndex = startIndex + matchedContent.length;
    const newText = currentMarkdown.slice(0, startIndex) + wrappedTOC + currentMarkdown.slice(endIndex);
    return {
      text: newText,
      start: startIndex,
      end: startIndex + wrappedTOC.length,
      updated: true,
    };
  }

  // 3. If explicit selection is provided and not at index 0, insert at cursor position
  const { start, end } = selection;
  if (typeof start === 'number' && typeof end === 'number' && (start > 0 || end > 0)) {
    const prefix = start > 0 && currentMarkdown[start - 1] !== '\n' ? '\n\n' : '';
    const suffix = end < currentMarkdown.length && currentMarkdown[end] !== '\n' ? '\n\n' : '\n';
    const insertion = `${prefix}${wrappedTOC}${suffix}`;
    const newText = currentMarkdown.slice(0, start) + insertion + currentMarkdown.slice(end);
    return {
      text: newText,
      start,
      end: start + insertion.length,
      updated: false,
    };
  }

  // 4. Default placement: If document starts with an H1 title, place right beneath it
  const h1Match = currentMarkdown.match(/^#[ \t]+[^\r\n]+(?:\r?\n)*/);
  if (h1Match) {
    const insertPos = h1Match[0].length;
    const insertion = `\n${wrappedTOC}\n\n`;
    const newText = currentMarkdown.slice(0, insertPos) + insertion + currentMarkdown.slice(insertPos);
    return {
      text: newText,
      start: insertPos,
      end: insertPos + insertion.length,
      updated: false,
    };
  }

  // 5. Fallback: Prepend at the beginning
  const insertion = `${wrappedTOC}\n\n`;
  const newText = insertion + currentMarkdown;
  return {
    text: newText,
    start: 0,
    end: insertion.length,
    updated: false,
  };
}
