import { getGiphyKey, setGiphyKey } from './store.js';
import { GIPHY_ORIGINS } from '../providers/giphy.js';

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

  await showAccess(document, browser);
}

/**
 * Shows whether the add-on may reach GIPHY, with a button to allow it if not.
 *
 * @param {Document} document
 * @param {any} browser
 */
async function showAccess(document, browser) {
  const access = /** @type {HTMLElement} */ (document.querySelector('.access'));
  const status = /** @type {HTMLElement} */ (access.querySelector('.access-status'));
  if (await browser.permissions.contains({ origins: GIPHY_ORIGINS })) {
    status.textContent = 'Access to GIPHY allowed';
    access.querySelector('button')?.remove();
    return;
  }
  status.textContent = 'Thundergif needs your permission to reach GIPHY.';
  if (access.querySelector('button')) return;
  const allow = document.createElement('button');
  allow.type = 'button';
  allow.textContent = 'Allow access to GIPHY';
  // Thunderbird only shows the permission prompt in direct response to a click.
  allow.addEventListener('click', async () => {
    await browser.permissions.request({ origins: GIPHY_ORIGINS });
    await showAccess(document, browser);
  });
  access.append(allow);
}
