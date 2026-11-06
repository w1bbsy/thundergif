// The Providers Thundergif can search, and what the Picker needs to know about each.
import { giphy, GIPHY_ORIGINS, GIPHY_MEDIA_SERVER } from './giphy.js';
import { klipy, KLIPY_ORIGINS, KLIPY_MEDIA_SERVER } from './klipy.js';

/** @typedef {'giphy' | 'klipy'} ProviderId */

/**
 * @typedef {object} ProviderInfo
 * @property {string} name
 * @property {string[]} origins host permissions it needs
 * @property {string} mediaServer the address GIFs are inserted from, as entered in Thunderbird's
 *   remote-content exceptions
 * @property {string} attribution text the Provider requires the Picker to show, if any
 * @property {string} [attributionLogo] the Provider's own attribution mark, bundled with the add-on
 * @property {(options: { key: string, rating: import('../settings/store.js').Rating, fetch: typeof globalThis.fetch }) => import('./gif.js').Provider} create
 */

/** @type {Record<ProviderId, ProviderInfo>} */
export const PROVIDERS = {
  giphy: {
    name: 'GIPHY',
    origins: GIPHY_ORIGINS,
    mediaServer: `https://${GIPHY_MEDIA_SERVER}`,
    attribution: 'Powered By GIPHY',
    attributionLogo: '../icons/powered-by-giphy.png',
    create: giphy,
  },
  klipy: {
    name: 'KLIPY',
    origins: KLIPY_ORIGINS,
    mediaServer: `https://${KLIPY_MEDIA_SERVER}`,
    attribution: '',
    create: klipy,
  },
};

/** In the order they are offered. */
export const PROVIDER_IDS = /** @type {ProviderId[]} */ (Object.keys(PROVIDERS));

/** The Providers' names as a list for messages, e.g. "GIPHY or KLIPY". */
export const PROVIDER_NAMES = PROVIDER_IDS.map((id) => PROVIDERS[id].name).join(' or ');
