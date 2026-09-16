/**
 * Print layout customizer defaults, presets, and configuration maps.
 */

export const PRINT_STORAGE_KEY = 'markdown-pdf:print-options';

export const MARGIN_CSS = {
  normal: '15mm 15mm 20mm 15mm',
  compact: '10mm 10mm 12mm 10mm',
  wide: '25mm 25mm 25mm 25mm',
};

export const PAPER_SIZE_CSS = {
  a4: 'A4',
  letter: 'letter',
};

export const PRINT_PRESETS = {
  clean: {
    id: 'clean',
    name: 'Standard Document',
    description: '1-Column clean layout on Letter paper with comfortable margins',
    columns: 1,
    paperSize: 'letter',
    margins: 'normal',
    numberedHeadings: false,
  },
  academic: {
    id: 'academic',
    name: 'Academic Paper (2-Col)',
    description: 'IEEE/ACM style 2-column flow on A4 paper with numbered sections',
    columns: 2,
    paperSize: 'a4',
    margins: 'compact',
    numberedHeadings: true,
  },
  formal: {
    id: 'formal',
    name: 'Technical Report',
    description: 'Formal 1-column layout on A4 with numbered hierarchical headings',
    columns: 1,
    paperSize: 'a4',
    margins: 'normal',
    numberedHeadings: true,
  },
};

export const DEFAULT_PRINT_OPTIONS = {
  columns: 1,
  paperSize: 'letter',
  margins: 'normal',
  numberedHeadings: false,
  preset: 'clean',
};

/**
 * Validates and sanitizes a print options object.
 *
 * @param {Partial<typeof DEFAULT_PRINT_OPTIONS>} options
 * @returns {typeof DEFAULT_PRINT_OPTIONS}
 */
export function validatePrintOptions(options = {}) {
  const columns = options && (options.columns === 2 || options.columns === '2') ? 2 : 1;
  const paperSize = options && options.paperSize === 'a4' ? 'a4' : 'letter';
  const margins = options && (options.margins === 'compact' || options.margins === 'wide') 
    ? options.margins 
    : 'normal';
  const numberedHeadings = Boolean(options && options.numberedHeadings);
  const preset = options && PRINT_PRESETS[options.preset] ? options.preset : 'custom';

  return {
    columns,
    paperSize,
    margins,
    numberedHeadings,
    preset,
  };
}

/**
 * Generates dynamic @page and column styling CSS for the customized print job.
 * 
 * @param {Partial<typeof DEFAULT_PRINT_OPTIONS>} options
 * @returns {string} Clean CSS string for @page and print layout
 */
export function generatePrintCSS(options) {
  const valid = validatePrintOptions(options);
  const pageSize = PAPER_SIZE_CSS[valid.paperSize] || 'letter';
  const marginValue = MARGIN_CSS[valid.margins] || MARGIN_CSS.normal;
  const columns = valid.columns;

  return `
@page {
  size: ${pageSize};
  margin: ${marginValue};
}
@media print {
  .preview-output {
    column-count: ${columns} !important;
  }
}
`.trim();
}

/**
 * Retrieves the stored print options from localStorage or falls back to DEFAULT_PRINT_OPTIONS.
 * 
 * @returns {typeof DEFAULT_PRINT_OPTIONS}
 */
export function getStoredPrintOptions() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(PRINT_STORAGE_KEY);
      if (raw) {
        return validatePrintOptions(JSON.parse(raw));
      }
    } catch {
      // Ignore JSON parse or storage access errors
    }
  }
  return { ...DEFAULT_PRINT_OPTIONS };
}

/**
 * Persists the user's customized print options to localStorage.
 * 
 * @param {Partial<typeof DEFAULT_PRINT_OPTIONS>} options
 */
export function saveStoredPrintOptions(options) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const valid = validatePrintOptions(options);
      window.localStorage.setItem(PRINT_STORAGE_KEY, JSON.stringify(valid));
    } catch {
      // Ignore quota/security errors
    }
  }
}

