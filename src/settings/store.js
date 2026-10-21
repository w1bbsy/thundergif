// The one place that knows how settings are laid out in the add-on's local storage.

/**
 * @param {any} browser
 * @param {import('../providers/providers.js').ProviderId} provider
 * @returns {Promise<string>}
 */
export async function getProviderKey(browser, provider) {
  const name = `${provider}Key`;
  const { [name]: key = '' } = await browser.storage.local.get(name);
  return key;
}

/**
 * @param {any} browser
 * @param {import('../providers/providers.js').ProviderId} provider
 * @param {string} key
 */
export async function setProviderKey(browser, provider, key) {
  await browser.storage.local.set({ [`${provider}Key`]: key });
}

/**
 * The content rating ceiling for results, from most to least strict.
 * @typedef {'g' | 'pg' | 'pg-13' | 'r'} Rating
 */

/** @type {{ value: Rating, label: string }[]} */
export const RATINGS = [
  { value: 'g', label: 'G' },
  { value: 'pg', label: 'PG' },
  { value: 'pg-13', label: 'PG-13' },
  { value: 'r', label: 'R' },
];

const DEFAULT_RATING = 'pg';

/**
 * @param {any} browser
 * @returns {Promise<Rating>}
 */
export async function getRating(browser) {
  const { rating } = await browser.storage.local.get('rating');
  return RATINGS.some((r) => r.value === rating) ? rating : DEFAULT_RATING;
}

/**
 * @param {any} browser
 * @param {Rating} rating
 */
export async function setRating(browser, rating) {
  await browser.storage.local.set({ rating });
}

/**
 * The Provider to search: the one last chosen if it still has a key, otherwise the first that does.
 *
 * @param {any} browser
 * @param {import('../providers/providers.js').ProviderId[]} withKeys Providers that have a key, in order
 * @returns {Promise<import('../providers/providers.js').ProviderId | undefined>}
 */
export async function getActiveProvider(browser, withKeys) {
  const { activeProvider } = await browser.storage.local.get('activeProvider');
  return withKeys.includes(activeProvider) ? activeProvider : withKeys[0];
}

/**
 * @param {any} browser
 * @param {import('../providers/providers.js').ProviderId} provider
 */
export async function setActiveProvider(browser, provider) {
  await browser.storage.local.set({ activeProvider: provider });
}

/**
 * The IDs of a Provider's Favourites, newest first. Only IDs are kept, never media URLs.
 *
 * @param {any} browser
 * @param {import('../providers/providers.js').ProviderId} provider
 * @returns {Promise<string[]>}
 */
export async function getFavourites(browser, provider) {
  const { favourites = {} } = await browser.storage.local.get('favourites');
  return favourites[provider] ?? [];
}

/**
 * @param {any} browser
 * @param {import('../providers/providers.js').ProviderId} provider
 * @param {string[]} ids
 */
export async function setFavourites(browser, provider, ids) {
  const { favourites = {} } = await browser.storage.local.get('favourites');
  await browser.storage.local.set({ favourites: { ...favourites, [provider]: ids } });
}
