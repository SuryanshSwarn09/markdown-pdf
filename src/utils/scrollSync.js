/**
 * Computes the normalized scroll progress percentage [0, 1] for a container.
 * 
 * @param {number} scrollTop - Current scrollTop in pixels
 * @param {number} scrollHeight - Total scrollable height in pixels
 * @param {number} clientHeight - Visible viewport height in pixels
 * @returns {number} Normalized progress between 0 and 1
 */
export function calculateScrollPercentage(scrollTop, scrollHeight, clientHeight) {
  if (typeof scrollTop !== 'number' || typeof scrollHeight !== 'number' || typeof clientHeight !== 'number') {
    return 0;
  }
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) {
    return 0;
  }
  const rawRatio = scrollTop / maxScroll;
  return Math.min(Math.max(rawRatio, 0), 1);
}

/**
 * Computes the target scrollTop in pixels from a normalized percentage.
 * 
 * @param {number} percentage - Normalized progress [0, 1]
 * @param {number} targetScrollHeight - Target element total scrollable height in pixels
 * @param {number} targetClientHeight - Target element visible viewport height in pixels
 * @returns {number} Calculated target scrollTop in pixels
 */
export function calculateTargetScrollTop(percentage, targetScrollHeight, targetClientHeight) {
  if (typeof percentage !== 'number' || typeof targetScrollHeight !== 'number' || typeof targetClientHeight !== 'number') {
    return 0;
  }
  const maxTargetScroll = targetScrollHeight - targetClientHeight;
  if (maxTargetScroll <= 0) {
    return 0;
  }
  const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
  return Math.round(clampedPercentage * maxTargetScroll);
}

export const SYNC_SCROLL_KEY = 'markdown-pdf:sync-scroll';

/**
 * Retrieves the user's sync scroll preference from localStorage.
 * Defaults to true if unconfigured or inaccessible.
 * 
 * @returns {boolean} Whether synchronized scrolling is enabled
 */
export function getSyncScrollPreference() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(SYNC_SCROLL_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {
      // LocalStorage access restricted (e.g. private browsing)
    }
  }
  return true;
}

/**
 * Persists the user's sync scroll preference to localStorage.
 * 
 * @param {boolean} enabled - Whether synchronized scrolling is enabled
 */
export function saveSyncScrollPreference(enabled) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(SYNC_SCROLL_KEY, String(Boolean(enabled)));
    } catch {
      // Ignore quota/security errors
    }
  }
}

