import { getGiphyKey, setGiphyKey } from './store.js';

/**
 * @typedef {object} SettingsEnv
 * @property {Document} document
 * @property {any} browser Thunderbird's add-on API
 */

/** @param {SettingsEnv} env */
export async function startSettings({ document, browser }) {
  const form = /** @type {HTMLFormElement} */ (document.querySelector('form.settings'));
  const keyField = /** @type {HTMLInputElement} */ (document.getElementById('giphy-key'));
  const status = /** @type {HTMLElement} */ (document.querySelector('.status'));

  keyField.value = await getGiphyKey(browser);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await setGiphyKey(browser, keyField.value.trim());
    status.textContent = 'Saved';
  });
}
