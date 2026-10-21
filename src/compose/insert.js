import { insertGif } from './insert-gif.js';

/**
 * Places a GIF at the cursor of a compose tab as a linked image.
 *
 * @param {any} browser Thunderbird's add-on API
 * @param {number} tabId compose tab
 * @param {import('../providers/gif.js').Gif} gif
 * @returns {Promise<boolean>} whether the editor accepted the GIF
 */
export async function insertIntoCompose(browser, tabId, gif) {
  await browser.thundergifCompose.allowRemoteImages(tabId);
  const [injection] = await browser.scripting.executeScript({
    target: { tabId },
    func: insertGif,
    args: [{ url: gif.insert.url, width: gif.insert.width, height: gif.insert.height, alt: gif.description }],
  });
  return injection?.result === true;
}
