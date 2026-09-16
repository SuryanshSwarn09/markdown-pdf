import {
  PRINT_STORAGE_KEY,
  DEFAULT_PRINT_OPTIONS,
  PRINT_PRESETS,
  MARGIN_CSS,
  PAPER_SIZE_CSS,
  validatePrintOptions,
  generatePrintCSS,
  getStoredPrintOptions,
  saveStoredPrintOptions,
} from './printOptions.js';
import assert from 'node:assert';

console.log('Running test suite for printOptions...');

// 1. Constants & Presets
assert.strictEqual(PRINT_STORAGE_KEY, 'markdown-pdf:print-options');
assert.strictEqual(DEFAULT_PRINT_OPTIONS.columns, 1);
assert.strictEqual(DEFAULT_PRINT_OPTIONS.paperSize, 'letter');
assert.strictEqual(DEFAULT_PRINT_OPTIONS.margins, 'normal');
assert.strictEqual(DEFAULT_PRINT_OPTIONS.numberedHeadings, false);

assert.strictEqual(PRINT_PRESETS.clean.columns, 1);
assert.strictEqual(PRINT_PRESETS.academic.columns, 2);
assert.strictEqual(PRINT_PRESETS.academic.numberedHeadings, true);
assert.strictEqual(PRINT_PRESETS.formal.columns, 1);
assert.strictEqual(PRINT_PRESETS.formal.numberedHeadings, true);

// 2. Options validation
assert.deepStrictEqual(validatePrintOptions(null), DEFAULT_PRINT_OPTIONS);
assert.deepStrictEqual(validatePrintOptions(undefined), DEFAULT_PRINT_OPTIONS);
assert.deepStrictEqual(validatePrintOptions({}), DEFAULT_PRINT_OPTIONS);

// Custom sanitization
const custom = validatePrintOptions({
  columns: 2,
  paperSize: 'a4',
  margins: 'compact',
  numberedHeadings: true,
  preset: 'academic',
});
assert.strictEqual(custom.columns, 2);
assert.strictEqual(custom.paperSize, 'a4');
assert.strictEqual(custom.margins, 'compact');
assert.strictEqual(custom.numberedHeadings, true);
assert.strictEqual(custom.preset, 'academic');

// Corrupted/invalid fields fallback
const fallback = validatePrintOptions({
  columns: 99,
  paperSize: 'tabloid',
  margins: 'huge',
  preset: 'unknown_preset',
});
assert.strictEqual(fallback.columns, 1);
assert.strictEqual(fallback.paperSize, 'letter');
assert.strictEqual(fallback.margins, 'normal');
assert.strictEqual(fallback.preset, 'custom');

// 3. Print CSS generation
const cleanCSS = generatePrintCSS(DEFAULT_PRINT_OPTIONS);
assert.ok(cleanCSS.includes('size: letter;'));
assert.ok(cleanCSS.includes(`margin: ${MARGIN_CSS.normal};`));
assert.ok(cleanCSS.includes('column-count: 1 !important;'));

const academicCSS = generatePrintCSS(PRINT_PRESETS.academic);
assert.ok(academicCSS.includes(`size: ${PAPER_SIZE_CSS.a4};`));
assert.ok(academicCSS.includes(`margin: ${MARGIN_CSS.compact};`));
assert.ok(academicCSS.includes('column-count: 2 !important;'));

// 4. Persistence with mock localStorage
const mockStorage = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) ?? null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
  },
};

// Initial read with empty storage
assert.deepStrictEqual(getStoredPrintOptions(), DEFAULT_PRINT_OPTIONS);

// Save academic preset and retrieve
saveStoredPrintOptions(PRINT_PRESETS.academic);
const retrieved = getStoredPrintOptions();
assert.strictEqual(retrieved.columns, 2);
assert.strictEqual(retrieved.paperSize, 'a4');
assert.strictEqual(retrieved.margins, 'compact');
assert.strictEqual(retrieved.numberedHeadings, true);

// Corrupted JSON in storage fallback
mockStorage.set(PRINT_STORAGE_KEY, '{ invalid json');
assert.deepStrictEqual(getStoredPrintOptions(), DEFAULT_PRINT_OPTIONS);

// Storage throws exception fallback
globalThis.window.localStorage.getItem = () => { throw new Error('StorageBlocked'); };
assert.deepStrictEqual(getStoredPrintOptions(), DEFAULT_PRINT_OPTIONS);

globalThis.window.localStorage.setItem = () => { throw new Error('StorageQuota'); };
assert.doesNotThrow(() => saveStoredPrintOptions(PRINT_PRESETS.clean));

console.log('All printOptions tests passed successfully!');
