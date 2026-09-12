import { getSystemTheme, getInitialTheme, saveTheme, THEME_KEY, VALID_THEMES } from './themeUtils.js';
import assert from 'node:assert';

console.log('Running test suite for themeUtils...');

// 1. Constants
assert.strictEqual(THEME_KEY, 'markdown-pdf:theme');
assert.deepStrictEqual(VALID_THEMES, ['light', 'dark']);

// 2. Default execution in non-browser Node environment
assert.strictEqual(getSystemTheme(), 'dark');
assert.strictEqual(getInitialTheme(), 'dark');

// 3. Validation on saveTheme
assert.strictEqual(saveTheme('invalid'), false);
assert.strictEqual(saveTheme(''), false);
assert.strictEqual(saveTheme(null), false);
assert.strictEqual(saveTheme(undefined), false);

// 4. Mock browser environment tests
const mockStorage = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
  },
  matchMedia: (query) => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
};

// With empty storage, should resolve system preference (dark in mock)
assert.strictEqual(getInitialTheme(), 'dark');

// When light is saved, getInitialTheme should return 'light'
assert.strictEqual(saveTheme('light'), true);
assert.strictEqual(mockStorage.get(THEME_KEY), 'light');
assert.strictEqual(getInitialTheme(), 'light');

// When dark is saved, getInitialTheme should return 'dark'
assert.strictEqual(saveTheme('dark'), true);
assert.strictEqual(mockStorage.get(THEME_KEY), 'dark');
assert.strictEqual(getInitialTheme(), 'dark');

// When corrupted value is in storage, fallback to system theme
mockStorage.set(THEME_KEY, 'corrupted_theme');
assert.strictEqual(getInitialTheme(), 'dark');

// Clean up mock
delete globalThis.window;

console.log('All themeUtils tests passed successfully!');
