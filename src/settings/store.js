// The one place that knows how settings are laid out in the add-on's local storage.

/** @param {any} browser */
export async function getGiphyKey(browser) {
  const { giphyKey = '' } = await browser.storage.local.get('giphyKey');
  return /** @type {string} */ (giphyKey);
}

/**
 * @param {any} browser
 * @param {string} key
 */
export async function setGiphyKey(browser, key) {
  await browser.storage.local.set({ giphyKey: key });
}
