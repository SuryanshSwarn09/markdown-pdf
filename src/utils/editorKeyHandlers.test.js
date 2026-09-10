import { handleTabIndentation } from './editorKeyHandlers.js';
import assert from 'node:assert';

console.log('Running test suite for editorKeyHandlers...');

// 1. Single cursor Tab insertion
const singleTab = handleTabIndentation({
  value: 'hello world',
  selectionStart: 5,
  selectionEnd: 5,
  shiftKey: false,
});
assert.strictEqual(singleTab.newText, 'hello   world');
assert.strictEqual(singleTab.newSelectionStart, 7);
assert.strictEqual(singleTab.newSelectionEnd, 7);
assert.strictEqual(singleTab.handled, true);

// 2. Multi-line Tab indentation
const multiText = 'line1\nline2\nline3';
const multiTab = handleTabIndentation({
  value: multiText,
  selectionStart: 2,
  selectionEnd: 8,
  shiftKey: false,
});
assert.strictEqual(multiTab.newText, '  line1\n  line2\nline3');
assert.strictEqual(multiTab.handled, true);

// 3. Multi-line Shift+Tab unindentation
const indentedText = '  line1\n  line2\n  line3';
const multiUnindent = handleTabIndentation({
  value: indentedText,
  selectionStart: 2,
  selectionEnd: 15,
  shiftKey: true,
});
assert.strictEqual(multiUnindent.newText, 'line1\nline2\n  line3');
assert.strictEqual(multiUnindent.handled, true);

// 4. Shift+Tab with 1 leading space
const singleSpaceText = ' line1\n  line2';
const partialUnindent = handleTabIndentation({
  value: singleSpaceText,
  selectionStart: 0,
  selectionEnd: 10,
  shiftKey: true,
});
assert.strictEqual(partialUnindent.newText, 'line1\nline2');
assert.strictEqual(partialUnindent.handled, true);

console.log('All editorKeyHandlers tests passed successfully!');
