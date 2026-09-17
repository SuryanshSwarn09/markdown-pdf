import {
  slugifyHeading,
  extractHeadings,
} from './tocGenerator.js';
import assert from 'node:assert';

console.log('Running test suite for tocGenerator (part 1: slugging & extraction)...');

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

console.log('Slugging & extraction tests passed successfully!');
