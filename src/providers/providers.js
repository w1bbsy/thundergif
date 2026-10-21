// The Providers Thundergif can search, and what the Picker needs to know about each.
import { giphy, GIPHY_ORIGINS } from './giphy.js';
import { klipy, KLIPY_ORIGINS } from './klipy.js';

/** @typedef {'giphy' | 'klipy'} ProviderId */

/**
 * @typedef {object} ProviderInfo
 * @property {string} name
 * @property {string[]} origins host permissions it needs
 * @property {string} attribution text the Provider requires the Picker to show, if any
 * @property {typeof giphy} create
 */

/** @type {Record<ProviderId, ProviderInfo>} */
export const PROVIDERS = {
  giphy: { name: 'GIPHY', origins: GIPHY_ORIGINS, attribution: 'Powered By GIPHY', create: giphy },
  klipy: { name: 'KLIPY', origins: KLIPY_ORIGINS, attribution: '', create: klipy },
};

/** In the order they are offered. */
export const PROVIDER_IDS = /** @type {ProviderId[]} */ (Object.keys(PROVIDERS));
