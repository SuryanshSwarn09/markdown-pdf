import {
  slugifyHeading,
  extractHeadings,
  generateTOCMarkdown,
  insertOrUpdateTOC,
  TOC_START_COMMENT,
  TOC_END_COMMENT,
} from './tocGenerator.js';
import assert from 'node:assert';

console.log('Running test suite for tocGenerator...');

// 1. Heading slugification tests
assert.strictEqual(slugifyHeading('Hello World'), 'hello-world');
assert.strictEqual(slugifyHeading('  Quick Start & Setup!  '), 'quick-start-setup');
assert.strictEqual(slugifyHeading('[API Guide](https://api.com/doc)'), 'api-guide');
assert.strictEqual(slugifyHeading('Code `console.log()` & Math $E=mc^2$'), 'code-consolelog-math-emc2');
assert.strictEqual(slugifyHeading('<span>Highlighted</span> Header'), 'highlighted-header');
assert.strictEqual(slugifyHeading(''), 'section');
assert.strictEqual(slugifyHeading('!@#$%^&*()_+'), 'section');
assert.strictEqual(slugifyHeading(null), 'section');
assert.strictEqual(slugifyHeading(undefined), 'section');

// Duplicate slug disambiguation with Map
const slugMap = new Map();
assert.strictEqual(slugifyHeading('Introduction', slugMap), 'introduction');
assert.strictEqual(slugifyHeading('Introduction', slugMap), 'introduction-1');
assert.strictEqual(slugifyHeading('Introduction', slugMap), 'introduction-2');
assert.strictEqual(slugifyHeading('Getting Started', slugMap), 'getting-started');
assert.strictEqual(slugifyHeading('Getting Started', slugMap), 'getting-started-1');

// Duplicate slug disambiguation with Set
const slugSet = new Set();
assert.strictEqual(slugifyHeading('Overview', slugSet), 'overview');
assert.strictEqual(slugifyHeading('Overview', slugSet), 'overview-1');
assert.strictEqual(slugifyHeading('Overview', slugSet), 'overview-2');

// 2. Heading extraction tests
const sampleMd = `
# Project Title

Here is some introductory text.

## Features & Architecture

Details about architecture.

### Micro-services

Sub-sub section.

#### Deep Section (H4)

This is level 4.

\`\`\`python
# This is a Python comment inside code block
def hello():
    # Another comment
    return True
\`\`\`

~~~bash
# Bash script comment
echo "hello"
~~~

$$
# Math block comment / matrix
E = mc^2
$$

## Installation & Setup

Step 1...

### Prerequisites

Node.js...

## Table of Contents

Existing TOC heading should be ignored.

## Conclusion #
`;

const headings = extractHeadings(sampleMd);

assert.strictEqual(headings.length, 6);

assert.deepStrictEqual(headings[0], {
  level: 1,
  text: 'Project Title',
  slug: 'project-title',
  raw: '# Project Title',
});

assert.deepStrictEqual(headings[1], {
  level: 2,
  text: 'Features & Architecture',
  slug: 'features-architecture',
  raw: '## Features & Architecture',
});

assert.deepStrictEqual(headings[2], {
  level: 3,
  text: 'Micro-services',
  slug: 'micro-services',
  raw: '### Micro-services',
});

// H4 was skipped because default maxDepth is 3
// Code block comments were skipped!
// Math block comments were skipped!

assert.deepStrictEqual(headings[3], {
  level: 2,
  text: 'Installation & Setup',
  slug: 'installation-setup',
  raw: '## Installation & Setup',
});

assert.deepStrictEqual(headings[4], {
  level: 3,
  text: 'Prerequisites',
  slug: 'prerequisites',
  raw: '### Prerequisites',
});

// "## Table of Contents" was skipped because skipTocHeading is true!

assert.deepStrictEqual(headings[5], {
  level: 2,
  text: 'Conclusion',
  slug: 'conclusion',
  raw: '## Conclusion #',
});

// Custom maxDepth test
const allHeadings = extractHeadings(sampleMd, { maxDepth: 4 });
assert.strictEqual(allHeadings.length, 7);
assert.strictEqual(allHeadings[3].level, 4);
assert.strictEqual(allHeadings[3].text, 'Deep Section (H4)');

// Empty or invalid input
assert.deepStrictEqual(extractHeadings(''), []);
assert.deepStrictEqual(extractHeadings(null), []);
assert.deepStrictEqual(extractHeadings(undefined), []);

// 3. TOC Markdown Generation tests
const testHeadings = [
  { level: 1, text: 'Introduction', slug: 'introduction' },
  { level: 2, text: 'Architecture', slug: 'architecture' },
  { level: 3, text: 'Components', slug: 'components' },
  { level: 2, text: 'Deployment', slug: 'deployment' },
];

const tocOutput = generateTOCMarkdown(testHeadings);
assert.strictEqual(
  tocOutput,
  `## Table of Contents

- [Introduction](#introduction)
  - [Architecture](#architecture)
    - [Components](#components)
  - [Deployment](#deployment)
`
);

// Without title
const noTitleToc = generateTOCMarkdown(testHeadings, { title: false });
assert.strictEqual(
  noTitleToc,
  `- [Introduction](#introduction)
  - [Architecture](#architecture)
    - [Components](#components)
  - [Deployment](#deployment)
`
);

// Relative indentation when document starts at H2 (no H1)
const h2Headings = [
  { level: 2, text: 'Section A', slug: 'section-a' },
  { level: 3, text: 'Sub A.1', slug: 'sub-a1' },
];
const relToc = generateTOCMarkdown(h2Headings, { title: false });
assert.strictEqual(
  relToc,
  `- [Section A](#section-a)
  - [Sub A.1](#sub-a1)
`
);

// Direct markdown string input to generateTOCMarkdown
const directToc = generateTOCMarkdown('# Direct Title\n## Direct Section');
assert.strictEqual(
  directToc,
  `## Table of Contents

- [Direct Title](#direct-title)
  - [Direct Section](#direct-section)
`
);

// Empty headings returns empty string
assert.strictEqual(generateTOCMarkdown([]), '');
assert.strictEqual(generateTOCMarkdown('No headings at all in this text'), '');

// 4. Smart TOC Insertion and Update tests
assert.strictEqual(TOC_START_COMMENT, '<!-- toc -->');
assert.strictEqual(TOC_END_COMMENT, '<!-- /toc -->');

const sampleTocText = generateTOCMarkdown(testHeadings);

// Insertion beneath top H1 heading when no cursor selection provided
const docWithH1 = `# My Document

First paragraph of text.

## Architecture
Some details.`;

const insertedBeneathH1 = insertOrUpdateTOC(docWithH1, sampleTocText);
assert.strictEqual(insertedBeneathH1.updated, false);
assert.ok(insertedBeneathH1.text.startsWith('# My Document\n\n<!-- toc -->\n## Table of Contents'));
assert.ok(insertedBeneathH1.text.includes('First paragraph of text.'));

// Updating an existing comment-wrapped TOC block
const docWithExistingCommentToc = `# My Document

<!-- toc -->
## Table of Contents
- [Old Title](#old-title)
<!-- /toc -->

First paragraph of text.

## Architecture`;

const updatedCommentToc = insertOrUpdateTOC(docWithExistingCommentToc, sampleTocText);
assert.strictEqual(updatedCommentToc.updated, true);
assert.ok(!updatedCommentToc.text.includes('Old Title'));
assert.ok(updatedCommentToc.text.includes('- [Introduction](#introduction)'));
assert.ok(updatedCommentToc.text.includes('First paragraph of text.'));

// Updating an existing heading-based TOC block (without comments)
const docWithExistingHeadingToc = `# My Document

## Table of Contents

- [Old Title](#old-title)
- [Old Section](#old-section)

## Architecture
Content here.`;

const updatedHeadingToc = insertOrUpdateTOC(docWithExistingHeadingToc, sampleTocText);
assert.strictEqual(updatedHeadingToc.updated, true);
assert.ok(!updatedHeadingToc.text.includes('Old Title'));
assert.ok(updatedHeadingToc.text.includes('- [Introduction](#introduction)'));
assert.ok(updatedHeadingToc.text.includes('## Architecture\nContent here.'));

// Insertion at specific selection range (cursor position)
const docForCursor = `First line\n\nSecond line`;
const insertedAtCursor = insertOrUpdateTOC(docForCursor, sampleTocText, { start: 12, end: 12 });
assert.strictEqual(insertedAtCursor.updated, false);
assert.ok(insertedAtCursor.text.includes('First line\n\n<!-- toc -->'));
assert.ok(insertedAtCursor.text.includes('Second line'));

// Insertion when document has no H1 title (prepends at top)
const docWithoutH1 = `## Section 1\nContent.\n## Section 2`;
const prependedToc = insertOrUpdateTOC(docWithoutH1, sampleTocText);
assert.strictEqual(prependedToc.updated, false);
assert.ok(prependedToc.text.startsWith('<!-- toc -->\n## Table of Contents'));

// Empty TOC string returns original document untouched
const untouched = insertOrUpdateTOC(docWithH1, '');
assert.strictEqual(untouched.text, docWithH1);

console.log('All tocGenerator tests passed successfully!');
