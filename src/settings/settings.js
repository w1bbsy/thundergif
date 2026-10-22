import {
  getProviderKey,
  setProviderKey,
  getRating,
  setRating,
  RATINGS,
  getActiveProvider,
  setActiveProvider,
} from './store.js';
import { PROVIDERS, PROVIDER_IDS } from '../providers/providers.js';
import { ProviderError } from '../providers/provider-request.js';

/**
 * @typedef {object} SettingsEnv
 * @property {Document} document
 * @property {any} browser Thunderbird's add-on API
 * @property {typeof globalThis.fetch} fetch
 */

/** @param {SettingsEnv} env */
export async function startSettings({ document, browser, fetch }) {
  const form = /** @type {HTMLFormElement} */ (document.querySelector('form.settings'));
  const status = /** @type {HTMLElement} */ (document.querySelector('.status'));
  const ratingField = /** @type {HTMLSelectElement} */ (document.getElementById('rating'));
  const keyField = (/** @type {string} */ id) => /** @type {HTMLInputElement} */ (document.getElementById(`${id}-key`));

  /**
   * The key each Provider was last checked with, so unchanged keys are not checked again.
   * @type {Partial<Record<import('../providers/providers.js').ProviderId, string>>}
   */
  const savedKeys = {};
  for (const id of PROVIDER_IDS) {
    savedKeys[id] = await getProviderKey(browser, id);
    keyField(id).value = savedKeys[id];
  }
  // Choosing a Provider only makes sense once both have keys.
  const choice = /** @type {HTMLFieldSetElement} */ (document.querySelector('.active-provider'));
  const filled = () => PROVIDER_IDS.filter((id) => keyField(id).value.trim() !== '');
  const active = await getActiveProvider(browser, filled());
  for (const id of PROVIDER_IDS) {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'activeProvider';
    radio.value = id;
    radio.checked = id === active;
    label.append(radio, PROVIDERS[id].name);
    choice.append(label);
  }
  const showChoice = () => (choice.hidden = filled().length < 2);
  showChoice();
  form.addEventListener('input', showChoice);

  ratingField.replaceChildren(...RATINGS.map(({ value, label }) => new Option(label, value)));
  ratingField.value = await getRating(browser);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const rating = /** @type {import('./store.js').Rating} */ (ratingField.value);
    for (const id of PROVIDER_IDS) await setProviderKey(browser, id, keyField(id).value.trim());
    await setRating(browser, rating);
    const chosen = /** @type {HTMLInputElement | null} */ (choice.querySelector('input:checked'));
    if (!choice.hidden && chosen) {
      await setActiveProvider(browser, /** @type {import('../providers/providers.js').ProviderId} */ (chosen.value));
    }
    status.textContent = 'Saved';
    // Check only keys that changed, with one request each, so the hourly limit is spared.
    for (const id of PROVIDER_IDS) {
      const key = keyField(id).value.trim();
      const keyStatus = /** @type {HTMLElement} */ (document.getElementById(`${id}-key-status`));
      if (key === savedKeys[id]) continue;
      if (key === '') {
        savedKeys[id] = key;
        keyStatus.textContent = '';
        continue;
      }
      const result = await checkKey(browser, PROVIDERS[id], key, rating, fetch);
      keyStatus.textContent = result.text;
      // Only a definite answer counts as checked; otherwise the next save tries again.
      if (result.settled) savedKeys[id] = key;
    }
  });

  // Links leave Thunderbird for the user's own browser rather than opening inside it.
  for (const link of document.querySelectorAll('a[href^="https://"]')) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      browser.windows.openDefaultBrowser(/** @type {HTMLAnchorElement} */ (link).href);
    });
  }

  const access = /** @type {HTMLElement} */ (document.querySelector('.access'));
  for (const id of PROVIDER_IDS) {
    const row = document.createElement('p');
    access.append(row);
    await showAccess(document, browser, row, PROVIDERS[id]);
  }
}

/**
 * Shows whether the add-on may reach a Provider, with a button to allow it if not.
 *
 * @param {Document} document
 * @param {any} browser
 * @param {HTMLElement} row
 * @param {import('../providers/providers.js').ProviderInfo} provider
 */
async function showAccess(document, browser, row, provider) {
  if (await browser.permissions.contains({ origins: provider.origins })) {
    row.replaceChildren(`Access to ${provider.name} allowed`);
    return;
  }
  const allow = document.createElement('button');
  allow.type = 'button';
  allow.textContent = `Allow access to ${provider.name}`;
  // Thunderbird only shows the permission prompt in direct response to a click.
  allow.addEventListener('click', async () => {
    await browser.permissions.request({ origins: provider.origins });
    await showAccess(document, browser, row, provider);
  });
  row.replaceChildren(`Thundergif needs your permission to reach ${provider.name}. `, allow);
}

/**
 * Runs one test request with a Provider key and describes the outcome. Settled means the key is
 * known to work or known to be rejected.
 *
 * @param {any} browser
 * @param {import('../providers/providers.js').ProviderInfo} provider
 * @param {string} key
 * @param {import('./store.js').Rating} rating
 * @param {typeof globalThis.fetch} fetch
 * @returns {Promise<{ text: string, settled: boolean }>}
 */
async function checkKey(browser, provider, key, rating, fetch) {
  const { name } = provider;
  if (!(await browser.permissions.contains({ origins: provider.origins }))) {
    return { text: `${name}: Saved. Allow access to ${name} below so the key can be checked.`, settled: false };
  }
  try {
    await provider.create({ key, rating, fetch }).trending();
    return { text: `${name}: Saved, working`, settled: true };
  } catch (error) {
    const kind = error instanceof ProviderError ? error.kind : 'unreachable';
    if (kind === 'rejected') return { text: `${name}: Key rejected`, settled: true };
    if (kind === 'limit') {
      return { text: `${name}: Saved, but the hourly limit is used up, so the key could not be checked yet`, settled: false };
    }
    return { text: `${name}: Saved, but ${name} could not be reached to check the key`, settled: false };
  }
}
