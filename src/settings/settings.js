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

/**
 * @typedef {object} SettingsEnv
 * @property {Document} document
 * @property {any} browser Thunderbird's add-on API
 */

/** @param {SettingsEnv} env */
export async function startSettings({ document, browser }) {
  const form = /** @type {HTMLFormElement} */ (document.querySelector('form.settings'));
  const status = /** @type {HTMLElement} */ (document.querySelector('.status'));
  const ratingField = /** @type {HTMLSelectElement} */ (document.getElementById('rating'));
  const keyField = (/** @type {string} */ id) => /** @type {HTMLInputElement} */ (document.getElementById(`${id}-key`));

  for (const id of PROVIDER_IDS) keyField(id).value = await getProviderKey(browser, id);
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
    for (const id of PROVIDER_IDS) await setProviderKey(browser, id, keyField(id).value.trim());
    await setRating(browser, /** @type {import('./store.js').Rating} */ (ratingField.value));
    const chosen = /** @type {HTMLInputElement | null} */ (choice.querySelector('input:checked'));
    if (!choice.hidden && chosen) {
      await setActiveProvider(browser, /** @type {import('../providers/providers.js').ProviderId} */ (chosen.value));
    }
    status.textContent = 'Saved';
  });

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
