// KLIPY Provider: the only place that knows KLIPY's URLs, parameters, and response layout.
import { PAGE_SIZE } from './gif.js';
import { fetchFromProvider } from './errors.js';

const API = 'https://api.klipy.com/api/v1';

/** Host permissions the add-on needs for KLIPY: the API and its media servers. */
export const KLIPY_ORIGINS = [
  'https://api.klipy.com/*',
  'https://static.klipy.com/*',
  'https://static1.klipy.com/*',
  'https://static2.klipy.com/*',
];

/**
 * KLIPY filters by content level rather than rating. Mapping from GIPHY's Tenor migration notes,
 * checked against real KLIPY results.
 * @type {Record<import('../settings/store.js').Rating, string>}
 */
const CONTENT_FILTER = { g: 'high', pg: 'medium', 'pg-13': 'low', r: 'off' };

/**
 * @param {{ key: string, rating: import('../settings/store.js').Rating, fetch: typeof globalThis.fetch }} options
 */
export function klipy({ key, rating, fetch }) {
  /**
   * @param {string} endpoint
   * @param {Record<string, string>} params
   * @param {number} page KLIPY counts pages from 1
   * @returns {Promise<import('./gif.js').Page>}
   */
  async function page(endpoint, params, page) {
    const url = new URL(`${API}/${encodeURIComponent(key)}/gifs/${endpoint}`);
    url.search = new URLSearchParams({
      per_page: String(PAGE_SIZE),
      page: String(page),
      content_filter: CONTENT_FILTER[rating],
      ...params,
    }).toString();
    // KLIPY puts the key in the path and answers a bad one with 404 (or 401/403).
    const body = await fetchFromProvider(fetch, url, (r) => [401, 403, 404].includes(r.status));
    // KLIPY requires its results in the order given, unfiltered.
    return { gifs: body.data.data.map(toGif), next: body.data.has_next ? page + 1 : null };
  }

  return {
    /** @param {number} [next] */
    trending: (next = 1) => page('trending', {}, next),
    /**
     * @param {string} term
     * @param {number} [next]
     */
    search: (term, next = 1) => page('search', { q: term }, next),
  };
}

/**
 * @param {any} item one entry from KLIPY's response
 * @returns {import('./gif.js').Gif}
 */
function toGif(item) {
  const preview = item.file.xs.gif;
  const insert = item.file.md.gif;
  return {
    id: item.slug,
    description: item.title || 'GIF',
    preview: { url: preview.url, width: preview.width, height: preview.height },
    insert: { url: insert.url, width: insert.width, height: insert.height },
  };
}
