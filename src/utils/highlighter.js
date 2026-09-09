import hljs from 'highlight.js/lib/core';

// 1. Core Web Languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);

/**
 * Highlights a block of code using registered languages with a safe fallback to plaintext.
 *
 * @param {string} code - Raw code string to format.
 * @param {string} [lang] - Language identifier (e.g. 'javascript', 'py', 'html').
 * @returns {string} Highlighted HTML string.
 */
export function highlightCode(code, lang) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  return hljs.highlight(code, { language }).value;
}

/**
 * Checks whether a given language is registered in the modular highlighter.
 *
 * @param {string} lang - Language identifier to test.
 * @returns {boolean} True if the language is supported.
 */
export function isLanguageSupported(lang) {
  return Boolean(lang && hljs.getLanguage(lang));
}

export default hljs;
