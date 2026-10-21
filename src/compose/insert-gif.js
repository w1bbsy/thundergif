/**
 * Runs inside the compose editor via scripting.executeScript, so it must be self-contained:
 * no imports and no references to anything outside its own body.
 *
 * Uses the editor's insertImage command, which takes only the image URL (no markup is parsed)
 * and keeps the insertion in the editor's undo history.
 *
 * @param {{ url: string, width: number, height: number, alt: string }} gif
 * @returns {boolean} whether the editor accepted the GIF
 */
export function insertGif(gif) {
  const before = new Set(document.images);
  if (!document.execCommand('insertImage', false, gif.url)) return false;

  const img = Array.from(document.images).find((image) => !before.has(image));
  if (!img) return false;
  img.setAttribute('alt', gif.alt);
  img.setAttribute('width', String(gif.width));
  img.setAttribute('height', String(gif.height));
  // Keep the GIF as a link to the Provider instead of embedding a copy when the email is sent.
  img.setAttribute('moz-do-not-send', 'true');
  return true;
}
