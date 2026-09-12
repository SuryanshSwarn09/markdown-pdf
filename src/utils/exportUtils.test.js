import { extractDocTitle, slugifyTitle, generateStandaloneHTML, downloadBlob, copyRichHTML } from './exportUtils.js';
import assert from 'node:assert';

console.log('Running test suite for exportUtils...');

// 1. extractDocTitle tests
assert.strictEqual(extractDocTitle(''), 'Untitled Document');
assert.strictEqual(extractDocTitle(null), 'Untitled Document');
assert.strictEqual(extractDocTitle(undefined), 'Untitled Document');
assert.strictEqual(extractDocTitle('   \n\n  '), 'Untitled Document');

// H1 Heading extraction
assert.strictEqual(
  extractDocTitle('# My Awesome Document\nSome content here...'),
  'My Awesome Document'
);

// Formatting stripping in titles
assert.strictEqual(
  extractDocTitle('# **Quantum** _Computing_ [Guide](https://example.com) & `Code`'),
  'Quantum Computing Guide & Code'
);

// Fallback to H2 when H1 absent
assert.strictEqual(
  extractDocTitle('Intro text before heading\n\n## Sub Section Title\nMore text'),
  'Sub Section Title'
);

// Fallback to first text line when no headings exist
assert.strictEqual(
  extractDocTitle('```js\nconsole.log(1);\n```\nFirst actual text line\nSecond line'),
  'First actual text line'
);

// 2. slugifyTitle tests
assert.strictEqual(slugifyTitle(''), 'document');
assert.strictEqual(slugifyTitle(null), 'document');
assert.strictEqual(slugifyTitle(undefined), 'document');

assert.strictEqual(
  slugifyTitle('Quantum Computing & AI: The 2026 Roadmap!'),
  'quantum-computing-ai-the-2026-roadmap'
);

assert.strictEqual(
  slugifyTitle("Developer's \"Quick\" Guide to Markdown & PDF"),
  'developers-quick-guide-to-markdown-pdf'
);

assert.strictEqual(
  slugifyTitle('   ---Multiple---Hyphens---And---Spaces---   '),
  'multiple-hyphens-and-spaces'
);

// Slug truncation limit (max 60 chars)
const longTitle = 'A very long title that exceeds the sixty character limit for filesystem slugs and needs to be safely truncated';
const slug = slugifyTitle(longTitle);
assert.ok(slug.length <= 60);
assert.strictEqual(slug.startsWith('a-very-long-title'), true);

// 3. generateStandaloneHTML tests
const standaloneHTML = generateStandaloneHTML({
  title: 'Quantum & Math: "Preview"',
  contentHTML: '<h1>Heading</h1><p>Equation: <span class="katex">x = y</span></p>',
});

// Checks for standard HTML5 structure
assert.ok(standaloneHTML.startsWith('<!DOCTYPE html>'));
assert.ok(standaloneHTML.includes('<meta charset="UTF-8">'));
assert.ok(standaloneHTML.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0">'));

// Checks for strict standalone CSP meta tag
assert.ok(standaloneHTML.includes('http-equiv="Content-Security-Policy"'));
assert.ok(standaloneHTML.includes("default-src 'none'"));

// Checks title escaping
assert.ok(standaloneHTML.includes('<title>Quantum &amp; Math: &quot;Preview&quot;</title>'));

// Checks KaTeX CSS linkage
assert.ok(standaloneHTML.includes('katex@0.16.22/dist/katex.min.css'));

// Checks typography & print styles inclusion
assert.ok(standaloneHTML.includes('font-family: var(--font-main);'));
assert.ok(standaloneHTML.includes('@media print'));
assert.ok(standaloneHTML.includes('.hljs-keyword'));

// Checks customStyles sanitization against style breakout
const sanitizedStylesHTML = generateStandaloneHTML({
  title: 'Style Injection Test',
  contentHTML: '<p>text</p>',
  customStyles: 'body { color: red; }</style><script>alert(1)</script>',
});
assert.ok(!sanitizedStylesHTML.includes('</style><script>'));

// Checks rendered content container
assert.ok(standaloneHTML.includes('<main class="markdown-container">'));
assert.ok(standaloneHTML.includes('<h1>Heading</h1><p>Equation: <span class="katex">x = y</span></p>'));

// 4. Safe non-browser fallbacks
assert.strictEqual(downloadBlob({ content: 'test', filename: 'test.md' }), false);
copyRichHTML('<p>test</p>').then((res) => {
  assert.strictEqual(res, false);
});

console.log('All exportUtils tests passed successfully!');
