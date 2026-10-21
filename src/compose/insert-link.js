/**
 * Runs inside the compose editor via scripting.executeScript, so it must be self-contained.
 * Types the GIF's link at the cursor; insertText keeps the editor's undo history.
 *
 * @param {string} url
 * @returns {boolean} whether the editor accepted the text
 */
export function insertLink(url) {
  return document.execCommand('insertText', false, url);
}
