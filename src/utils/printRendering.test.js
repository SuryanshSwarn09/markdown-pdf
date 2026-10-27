import { 
  DEFAULT_PRINT_OPTIONS, 
  PRINT_PRESETS, 
  generatePrintCSS, 
  validatePrintOptions,
  getComputedMargins 
} from './printOptions.js';
import assert from 'node:assert';
import fs from 'node:fs';

console.log('Running test suite for print layout rendering & media queries...');

// 1. Standard Clean preset verification
const cleanCSS = generatePrintCSS(PRINT_PRESETS.clean);
assert.ok(cleanCSS.includes('size: letter;'));
assert.ok(cleanCSS.includes('margin: 15mm 15mm 20mm 15mm;'));
assert.ok(cleanCSS.includes('column-count: 1 !important;'));
assert.ok(!cleanCSS.includes('@bottom-right'));

// 2. Academic 2-Column with running header and footer
const academicCSS = generatePrintCSS(PRINT_PRESETS.academic);
assert.ok(academicCSS.includes('size: A4;'));
assert.ok(academicCSS.includes('margin: 18mm 10mm 18mm 10mm;'));
assert.ok(academicCSS.includes('column-count: 2 !important;'));
assert.ok(academicCSS.includes('@bottom-right'));
assert.ok(academicCSS.includes('content: "Page " counter(page);'));

// 3. Technical Report 1-Column with running header and footer
const formalCSS = generatePrintCSS(PRINT_PRESETS.formal);
assert.ok(formalCSS.includes('size: A4;'));
assert.ok(formalCSS.includes('margin: 22mm 15mm 24mm 15mm;'));
assert.ok(formalCSS.includes('column-count: 1 !important;'));
assert.ok(formalCSS.includes('@bottom-right'));

// 4. Custom combination with wide margins
const wideOptions = validatePrintOptions({
  paperSize: 'letter',
  margins: 'wide',
  showHeader: true,
  showFooter: true,
  headerText: 'Antigravity Research Group • Confidential',
  footerText: 'Internal Use Only',
  showPageNumbers: true,
});
const wideCSS = generatePrintCSS(wideOptions);
assert.ok(wideCSS.includes('size: letter;'));
assert.ok(wideCSS.includes('margin: 30mm 25mm 32mm 25mm;'));
assert.ok(wideCSS.includes('@bottom-right'));
assert.ok(wideCSS.includes('content: "Page " counter(page);'));

// 5. Margin allocation matrix
assert.strictEqual(getComputedMargins('normal', false, false), '15mm 15mm 20mm 15mm');
assert.strictEqual(getComputedMargins('normal', true, false), '22mm 15mm 20mm 15mm');
assert.strictEqual(getComputedMargins('normal', false, true), '15mm 15mm 24mm 15mm');
assert.strictEqual(getComputedMargins('normal', true, true), '22mm 15mm 24mm 15mm');

assert.strictEqual(getComputedMargins('compact', false, false), '10mm 10mm 12mm 10mm');
assert.strictEqual(getComputedMargins('compact', true, true), '18mm 10mm 18mm 10mm');

assert.strictEqual(getComputedMargins('wide', false, false), '25mm 25mm 25mm 25mm');
assert.strictEqual(getComputedMargins('wide', true, true), '30mm 25mm 32mm 25mm');

// 6. Verify print stylesheet table contrast, pagination, and running header offsets
const stylesCSS = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf-8');
assert.ok(stylesCSS.includes('color: #0f172a !important;'), 'Print styles must enforce dark text for table headers');
assert.ok(stylesCSS.includes('color: #1e293b !important;'), 'Print styles must enforce dark text for table cells');
assert.ok(stylesCSS.includes('page-break-inside: auto !important;'), 'Print styles must allow tables to paginate across pages');
assert.ok(stylesCSS.includes('column-span: all !important;'), 'Print styles must allow tables to span columns in multi-column layouts');
assert.ok(stylesCSS.includes('display: table-header-group !important;'), 'Print styles must repeat table thead on each page');
assert.ok(stylesCSS.includes('break-after: avoid-page !important;'), 'Print styles must avoid heading orphans across pages');
assert.ok(stylesCSS.includes('top: -13mm !important;'), 'Print running header must be offset into the top margin');
assert.ok(stylesCSS.includes('bottom: -13mm !important;'), 'Print running footer must be offset into the bottom margin');

console.log('All print layout rendering tests passed successfully!');

