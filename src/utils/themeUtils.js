/**
 * Theme persistence and OS color-scheme detection utilities.
 */

export const THEME_KEY = 'markdown-pdf:theme';
export const VALID_THEMES = ['light', 'dark'];

/**
 * Detects the user's operating system color scheme preference.
 * Defaults to 'dark' if matchMedia is unavailable or in non-browser environments.
 *
 * @returns {'light' | 'dark'}
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Resolves the initial theme on application mount.
 * Checks localStorage first, falling back to the OS system preference.
 *
 * @returns {'light' | 'dark'}
 */
export function getInitialTheme() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (VALID_THEMES.includes(stored)) {
        return stored;
      }
    } catch {
      // LocalStorage access restricted or threw; fall back to system theme
    }
  }
  return getSystemTheme();
}

/**
 * Persists the user's chosen theme to localStorage.
 *
 * @param {'light' | 'dark'} theme
 * @returns {boolean} True if saved successfully
 */
export function saveTheme(theme) {
  if (!VALID_THEMES.includes(theme)) {
    return false;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
