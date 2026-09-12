import { sanitizeAIMath } from './mathSanitizer.js';
import assert from 'node:assert';

console.log('Running test suite for sanitizeAIMath...');

// Test 1: Flaw A - Code blocks must NOT be modified
const codeBlockInput = `\`\`\`javascript
const regex = /\\[a-z\\]/;
const arr = [
  "item1",
  "item2"
];
function test() {
  return \\(5 + 2\\);
}
\`\`\``;
const codeBlockOutput = sanitizeAIMath(codeBlockInput);
assert.strictEqual(codeBlockOutput, codeBlockInput, 'Flaw A failed: Fenced code block was corrupted');

// Test 2: Flaw A - Inline code must NOT be modified
const inlineCodeInput = 'Here is regex: `/\\[0-9\\]/` and inline code: `const x = \\(a + b\\);`';
const inlineCodeOutput = sanitizeAIMath(inlineCodeInput);
assert.strictEqual(inlineCodeOutput, inlineCodeInput, 'Flaw A failed: Inline code was corrupted');

// Test 3: Flaw B - Standalone JSON array must NOT be turned into $$ math
const jsonInput = `[
  {"name": "test", "id": 1},
  {"name": "test2", "id": 2}
]`;
const jsonOutput = sanitizeAIMath(jsonInput);
assert.strictEqual(jsonOutput, jsonInput, 'Flaw B failed: JSON array was corrupted into math delimiters');
assert.ok(!jsonOutput.includes('$$'), 'Flaw B failed: JSON contains $$');

// Test 4: Flaw C - Unpaired delimiters must NOT swallow document
const unpairedInput = 'This is an isolated \\( parenthesis that has no closing delimiter.\nAnother line.';
const unpairedOutput = sanitizeAIMath(unpairedInput);
assert.strictEqual(unpairedOutput, unpairedInput, 'Flaw C failed: Unpaired delimiter was converted to dangling $');
assert.ok(!unpairedOutput.includes('$'), 'Flaw C failed: Output contains dangling $');

// Test 5: Paired AI display math \[ ... \] is converted to $$ ... $$
const displayMathInput = `Here is display math:
\\[
  x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
\\]`;
const displayMathOutput = sanitizeAIMath(displayMathInput);
assert.ok(displayMathOutput.includes('$$\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$'), 'Display math conversion failed');
assert.ok(!displayMathOutput.includes('\\['), 'Display math still contains \\[');
assert.ok(!displayMathOutput.includes('\\]'), 'Display math still contains \\]');

// Test 6: Paired AI inline math \( ... \) is converted to $ ... $
const inlineMathInput = 'Let \\(E = mc^2\\) be the mass-energy equivalence.';
const inlineMathOutput = sanitizeAIMath(inlineMathInput);
assert.strictEqual(inlineMathOutput, 'Let $E = mc^2$ be the mass-energy equivalence.');

// Test 7: Mixed document with code blocks, JSON, and math formulas
const mixedInput = `
# Title

\`\`\`json
[
  "do not touch"
]
\`\`\`

Here is formula \\(a^2 + b^2 = c^2\\) and code \`\\[not math\\]\`.

\\[
  \\sum_{i=1}^n i = \\frac{n(n+1)}{2}
\\]
`;

const mixedOutput = sanitizeAIMath(mixedInput);
assert.ok(mixedOutput.includes('```json\n[\n  "do not touch"\n]\n```'), 'Mixed test: Code block corrupted');
assert.ok(mixedOutput.includes('`\\[not math\\]`'), 'Mixed test: Inline code corrupted');
assert.ok(mixedOutput.includes('$a^2 + b^2 = c^2$'), 'Mixed test: Inline math conversion failed');
assert.ok(mixedOutput.includes('$$\n\\sum_{i=1}^n i = \\frac{n(n+1)}{2}\n$$'), 'Mixed test: Display math conversion failed');

// Test 8: Empty and non-string inputs
assert.strictEqual(sanitizeAIMath(''), '');
assert.strictEqual(sanitizeAIMath(null), '');
assert.strictEqual(sanitizeAIMath(undefined), '');

// Test 9: Multiple inline code spans on a single line
const multiInline = 'Code `[1]` and code `[2]` and `(3)`.';
assert.strictEqual(sanitizeAIMath(multiInline), multiInline);

// Test 10: Paragraph boundary isolation (stray backticks across blank lines do not swallow equations)
const strayBacktickInput = `Here is a stray \` backtick in paragraph 1.

\\[
  E = mc^2
\\]

Another stray \` backtick in paragraph 3.`;

const strayBacktickOutput = sanitizeAIMath(strayBacktickInput);
assert.ok(strayBacktickOutput.includes('$$\nE = mc^2\n$$'), 'Equation between paragraph breaks should be converted despite stray backticks');
assert.ok(strayBacktickOutput.includes('stray ` backtick in paragraph 1'));
assert.ok(strayBacktickOutput.includes('stray ` backtick in paragraph 3'));

console.log('All sanitizeAIMath tests passed successfully!');
