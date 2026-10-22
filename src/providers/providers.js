// The Providers Thundergif can search, and what the Picker needs to know about each.
import { giphy, GIPHY_ORIGINS } from './giphy.js';
import { klipy, KLIPY_ORIGINS } from './klipy.js';

/** @typedef {'giphy' | 'klipy'} ProviderId */

/**
 * @typedef {object} ProviderInfo
 * @property {string} name
 * @property {string[]} origins host permissions it needs
 * @property {string} attribution text the Provider requires the Picker to show, if any
 * @property {string} [attributionLogo] the Provider's own attribution mark, bundled with the add-on
 * @property {(options: { key: string, rating: import('../settings/store.js').Rating, fetch: typeof globalThis.fetch }) => import('./gif.js').Provider} create
 */

/** @type {Record<ProviderId, ProviderInfo>} */
export const PROVIDERS = {
  giphy: {
    name: 'GIPHY',
    origins: GIPHY_ORIGINS,
    attribution: 'Powered By GIPHY',
    attributionLogo: '../icons/powered-by-giphy.png',
    create: giphy,
  },
  klipy: { name: 'KLIPY', origins: KLIPY_ORIGINS, attribution: '', create: klipy },
};

/** In the order they are offered. */
export const PROVIDER_IDS = /** @type {ProviderId[]} */ (Object.keys(PROVIDERS));

/** The Providers' names as a list for messages, e.g. "GIPHY or KLIPY". */
export const PROVIDER_NAMES = PROVIDER_IDS.map((id) => PROVIDERS[id].name).join(' or ');
