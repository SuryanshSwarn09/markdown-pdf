/**
 * Sanitizes AI-generated LaTeX math delimiters in Markdown text without
 * corrupting code blocks, inline code, or JSON data.
 *
 * Rectifies:
 * - Flaw A: Code blocks and inline code are protected by placeholder tokenization.
 * - Flaw B: Destructive bare bracket replacement (^\s*\[\s*$) is eliminated,
 *   preserving JSON arrays, to-do lists, and plain text brackets.
 * - Flaw C: Uses strictly paired LaTeX delimiters (\[...\] and \(...\)) to prevent
 *   unpaired single delimiters from corrupting the rest of the document into math.
 *
 * @param {string} markdown - Raw input markdown string.
 * @returns {string} Sanitized markdown string with KaTeX-compatible delimiters.
 */
export function sanitizeAIMath(markdown) {
  if (typeof markdown !== 'string' || !markdown) {
    return markdown || '';
  }

  // Generate a unique token prefix per invocation to prevent collisions with user content
  const tokenPrefix = `@@_CODE_BLOCK_${Date.now()}_${Math.random().toString(36).slice(2)}_`;
  const codeTokens = [];

  // 1. Mask fenced code blocks (both ``` and ~~~, including unclosed blocks at EOF)
  let text = markdown.replace(/(?:```[\s\S]*?```|~~~[\s\S]*?~~~|```[\s\S]*$|~~~[\s\S]*$)/g, (match) => {
    const token = `${tokenPrefix}${codeTokens.length}@@`;
    codeTokens.push(match);
    return token;
  });

  // 2. Mask inline code spans (`...` or ``...``), isolated within paragraph boundaries
  text = text.replace(/(?<!`)(`+)(?:(?!\n\s*\n)[\s\S])*?\1(?!`)/g, (match) => {
    const token = `${tokenPrefix}${codeTokens.length}@@`;
    codeTokens.push(match);
    return token;
  });

  // 3. Convert paired display math: \[ ... \] -> $$ ... $$
  // Handles multi-line equations and single-line display equations
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => {
    const trimmed = formula.trim();
    return trimmed ? `$$\n${trimmed}\n$$` : '';
  });

  // 4. Convert paired inline math: \( ... \) -> $ ... $
  // Constrained to non-newline spans to prevent runaway matching across paragraphs
  text = text.replace(/\\\(([^\n]+?)\\\)/g, (match, formula) => {
    const trimmed = formula.trim();
    return trimmed ? `$${trimmed}$` : match;
  });

  // 5. Restore masked code blocks and inline code
  if (codeTokens.length > 0) {
    text = text.replace(new RegExp(`${tokenPrefix}(\\d+)@@`, 'g'), (_, index) => {
      const idx = Number(index);
      return idx in codeTokens ? codeTokens[idx] : '';
    });
  }

  return text;
}
