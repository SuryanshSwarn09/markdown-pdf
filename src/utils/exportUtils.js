/**
 * Export utilities for document naming, standalone HTML generation,
 * file downloading, and rich clipboard interaction.
 */

/**
 * Extracts a human-readable title from markdown content.
 * Prioritizes top-level headings (# Heading), followed by subheadings,
 * and falls back to the first non-empty line of text.
 *
 * @param {string} markdown - Raw markdown string
 * @returns {string} Clean document title
 */
export function extractDocTitle(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return 'Untitled Document';
  }

  const lines = markdown.split('\n');

  // 1. Look for primary heading (# Title)
  for (const line of lines) {
    const trimmed = line.trim();
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      return cleanTitleString(h1Match[1]);
    }
  }

  // 2. Look for secondary headings (## Title, ### Title)
  for (const line of lines) {
    const trimmed = line.trim();
    const hMatch = trimmed.match(/^#{2,6}\s+(.+)$/);
    if (hMatch) {
      return cleanTitleString(hMatch[1]);
    }
  }

  // 3. Fallback to first non-empty line outside of code blocks and frontmatter
  let inCodeFence = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence || trimmed.startsWith('---')) {
      continue;
    }
    if (trimmed) {
      return cleanTitleString(trimmed);
    }
  }

  return 'Untitled Document';
}

/**
 * Strips markdown formatting syntax (bold, italic, links, code, math) from a title string.
 *
 * @param {string} raw
 * @returns {string}
 */
function cleanTitleString(raw) {
  return raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/[*_~`$]/g, '') // remove formatting symbols
    .replace(/\\/g, '') // remove backslashes
    .trim()
    .slice(0, 100);
}

/**
 * Converts a document title into a filesystem-safe, clean slug.
 * Example: "Quantum Computing & Algorithms: 2026!" -> "quantum-computing-algorithms-2026"
 *
 * @param {string} title
 * @returns {string}
 */
export function slugifyTitle(title) {
  if (!title || typeof title !== 'string') {
    return 'document';
  }

  const slug = title
    .toLowerCase()
    .replace(/['"’“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.slice(0, 60) || 'document';
}

/**
 * Generates a self-contained, publication-ready standalone HTML5 document.
 * Inlines typography styling, code highlighting themes, and KaTeX math support.
 *
 * @param {object} options
 * @param {string} options.title - Document title
 * @param {string} options.contentHTML - Sanitized rendered HTML content
 * @param {string} [options.customStyles] - Optional extra CSS rules
 * @returns {string} Full HTML5 document string
 */
export function generateStandaloneHTML({ title, contentHTML, customStyles = '' }) {
  const safeTitle = (title || 'Markdown Document')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net; img-src data: https: http:;">
  <title>${safeTitle}</title>
  <!-- KaTeX Stylesheet for Mathematical Equations -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" crossorigin="anonymous">
  <style>
    /* Standalone Publication Typography */
    :root {
      --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --text-color: #1a1a1a;
      --bg-color: #ffffff;
      --accent-color: #0071e3;
      --code-bg: #f6f8fa;
      --border-color: #d0d7de;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-main);
      color: var(--text-color);
      background-color: var(--bg-color);
      line-height: 1.6;
      padding: 40px 20px;
    }

    .markdown-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #111111;
      margin-top: 1.4em;
      margin-bottom: 0.6em;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; margin-top: 0; }
    h2 { font-size: 1.55rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25em; }
    h3 { font-size: 1.25rem; }
    h4 { font-size: 1.05rem; }

    p, ul, ol, blockquote, table, pre {
      margin-bottom: 1.1em;
    }

    p { font-size: 1.05rem; }

    ul, ol {
      padding-left: 2em;
    }

    li { margin-bottom: 0.3em; }

    a {
      color: var(--accent-color);
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }

    blockquote {
      border-left: 4px solid var(--accent-color);
      padding: 12px 20px;
      background-color: #f8fafc;
      color: #475569;
      font-style: italic;
      border-radius: 0 8px 8px 0;
    }

    pre {
      background-color: var(--code-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    code {
      font-family: var(--font-mono);
      font-size: 0.9em;
      background-color: rgba(175, 184, 193, 0.2);
      padding: 0.2em 0.4em;
      border-radius: 4px;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
    }

    /* Syntax Highlighting Colors */
    .hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #cf222e; font-weight: 600; }
    .hljs-string, .hljs-title, .hljs-section { color: #0a3069; }
    .hljs-comment, .hljs-quote { color: #6e7781; font-style: italic; }
    .hljs-number, .hljs-literal { color: #0550ae; }
    .hljs-type, .hljs-class { color: #953800; }
    .hljs-attr, .hljs-attribute { color: #116329; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5em;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 10px 14px;
      text-align: left;
    }

    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: #fbfcfd;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }

    hr {
      height: 1px;
      background-color: var(--border-color);
      border: none;
      margin: 28px 0;
    }

    .katex-display {
      margin: 1.2em 0;
      overflow-x: auto;
      overflow-y: hidden;
    }

    /* Print Styles */
    @page { margin: 15mm 15mm 20mm 15mm; size: auto; }
    @media print {
      body { padding: 0; font-size: 10.5pt; }
      .markdown-container { max-width: 100%; }
      pre, code { font-size: 9.5pt; }
      h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
      pre, table, blockquote, .katex-display { page-break-inside: avoid; break-inside: avoid; }
    }
    ${customStyles}
  </style>
</head>
<body>
  <main class="markdown-container">
    ${contentHTML || ''}
  </main>
</body>
</html>`;
}

/**
 * Triggers a client-side file download using a Blob.
 *
 * @param {object} options
 * @param {string} options.content - File content
 * @param {string} options.filename - Downloaded filename (e.g. "notes.md")
 * @param {string} [options.mimeType] - MIME type
 */
export function downloadBlob({ content, filename, mimeType = 'text/plain;charset=utf-8' }) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);

  return true;
}

/**
 * Copies rich HTML to the clipboard so it can be pasted into
 * rich text editors (Medium, Dev.to, Google Docs, Apple Mail, etc.)
 * with formatting and styles intact.
 *
 * @param {string} contentHTML - Sanitized rendered HTML content
 * @returns {Promise<boolean>} Resolves to true if successful
 */
export async function copyRichHTML(contentHTML) {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Try Modern Clipboard API with text/html & text/plain blobs
  if (navigator?.clipboard?.write && typeof window.ClipboardItem !== 'undefined') {
    try {
      const htmlBlob = new Blob([contentHTML], { type: 'text/html' });
      const textBlob = new Blob([contentHTML], { type: 'text/plain' });
      await navigator.clipboard.write([
        new window.ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      return true;
    } catch {
      // Fallback to text copy if write() failed or was blocked by browser permissions
    }
  }

  // 2. Fallback to navigator.clipboard.writeText
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(contentHTML);
      return true;
    } catch {
      // Fall through to execCommand
    }
  }

  // 3. Legacy document.execCommand fallback
  try {
    const textarea = document.createElement('textarea');
    textarea.value = contentHTML;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
