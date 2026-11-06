import { insertGif } from './insert-gif.js';
import { insertLink } from './insert-link.js';
import { hasExperiment } from '../edition.js';

/**
 * Whether the compose tab is writing a plain-text email, where images cannot go inline.
 *
 * @param {any} browser Thunderbird's add-on API
 * @param {number} tabId compose tab
 */
export async function isPlainText(browser, tabId) {
  const details = await browser.compose.getComposeDetails(tabId);
  return details.isPlainText === true;
}

/**
 * Places a GIF at the cursor of a compose tab: as a linked image in HTML emails, or as its
 * link in plain-text emails.
 *
 * @param {any} browser Thunderbird's add-on API
 * @param {number} tabId compose tab
 * @param {import('../providers/gif.js').Gif} gif
 * @returns {Promise<boolean>} whether the editor accepted the GIF
 */
export async function insertIntoCompose(browser, tabId, gif) {
  if (await isPlainText(browser, tabId)) {
    return runInEditor(browser, tabId, insertLink, [gif.insert.url]);
  }
  // Thundergif Live's Experiment lets the draft show the GIF; the ATN edition has no Experiment,
  // so its GIFs are blocked in the draft (recipients still see them). See ADR 0002.
  if (hasExperiment(browser)) await browser.thundergifCompose.allowRemoteImages(tabId);
  return runInEditor(browser, tabId, insertGif, [
    { url: gif.insert.url, width: gif.insert.width, height: gif.insert.height, alt: gif.description },
  ]);
}

/**
 * Runs a self-contained function in the compose editor and reports whether it succeeded.
 *
 * @param {any} browser
 * @param {number} tabId
 * @param {(...args: any[]) => boolean} func
 * @param {any[]} args
 */
async function runInEditor(browser, tabId, func, args) {
  const [injection] = await browser.scripting.executeScript({ target: { tabId }, func, args });
  return injection?.result === true;
}
