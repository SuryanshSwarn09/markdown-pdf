/**
 * Editor keyboard shortcuts and indentation utility.
 * Handles Tab and Shift+Tab 2-space indentation for single-line and multi-line selections.
 */

const INDENT = '  '; // 2 spaces

/**
 * Computes new text and selection ranges when Tab or Shift+Tab is pressed in an editor.
 *
 * @param {object} params
 * @param {string} params.value - Current editor text.
 * @param {number} params.selectionStart - Start index of selection.
 * @param {number} params.selectionEnd - End index of selection.
 * @param {boolean} [params.shiftKey=false] - Whether Shift key was held (for unindent).
 * @returns {{ newText: string, newSelectionStart: number, newSelectionEnd: number, handled: boolean }}
 */
export function handleTabIndentation({ value, selectionStart, selectionEnd, shiftKey = false }) {
  if (typeof value !== 'string') {
    return { newText: value, newSelectionStart: selectionStart, newSelectionEnd: selectionEnd, handled: false };
  }

  // Single-line cursor without selection
  if (selectionStart === selectionEnd && !shiftKey) {
    const newText = value.substring(0, selectionStart) + INDENT + value.substring(selectionEnd);
    const newCursor = selectionStart + INDENT.length;
    return {
      newText,
      newSelectionStart: newCursor,
      newSelectionEnd: newCursor,
      handled: true,
    };
  }

  // Multi-line selection or Shift+Tab on single line
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineEndPos = value.indexOf('\n', selectionEnd);
  const lineEnd = lineEndPos === -1 ? value.length : lineEndPos;

  const textBefore = value.substring(0, lineStart);
  const selectedLinesBlock = value.substring(lineStart, lineEnd);
  const textAfter = value.substring(lineEnd);

  const lines = selectedLinesBlock.split('\n');

  if (shiftKey) {
    // Unindent: remove up to 2 leading spaces per line
    let removedBeforeStart = 0;
    let totalRemoved = 0;

    const unindentedLines = lines.map((line, idx) => {
      const match = line.match(/^ {1,2}/);
      if (match) {
        const count = match[0].length;
        totalRemoved += count;
        if (idx === 0) {
          removedBeforeStart = Math.min(count, selectionStart - lineStart);
        }
        return line.slice(count);
      }
      return line;
    });

    const newText = textBefore + unindentedLines.join('\n') + textAfter;
    const newSelectionStart = Math.max(lineStart, selectionStart - removedBeforeStart);
    const newSelectionEnd = Math.max(newSelectionStart, selectionEnd - totalRemoved);

    return {
      newText,
      newSelectionStart,
      newSelectionEnd,
      handled: true,
    };
  }

  // Indent: add 2 spaces to each line
  const indentedLines = lines.map((line) => INDENT + line);
  const newText = textBefore + indentedLines.join('\n') + textAfter;
  const addedTotal = INDENT.length * lines.length;

  return {
    newText,
    newSelectionStart: selectionStart + INDENT.length,
    newSelectionEnd: selectionEnd + addedTotal,
    handled: true,
  };
}
