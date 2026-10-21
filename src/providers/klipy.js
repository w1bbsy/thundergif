// KLIPY Provider: the only place that knows KLIPY's URLs, parameters, and response layout.
import { PAGE_SIZE, inOrder, batches } from './gif.js';
import { fetchFromProvider } from './provider-request.js';

const API = 'https://api.klipy.com/api/v1';
/** KLIPY does not document a lookup limit, so slugs are sent in modest groups. */
const LOOKUP_LIMIT = 50;
/** KLIPY puts the key in the path and answers a bad one with 404 (or 401/403). */
const keyRejected = (/** @type {Response} */ r) => [401, 403, 404].includes(r.status);

/** Host permissions the add-on needs for KLIPY: the API and its media servers. */
export const KLIPY_ORIGINS = [
  'https://api.klipy.com/*',
  'https://static.klipy.com/*',
  'https://static1.klipy.com/*',
  'https://static2.klipy.com/*',
];

/**
 * KLIPY filters by content level rather than rating. Mapping from GIPHY's Tenor migration notes;
 * spot-checked against real KLIPY results (only "high" visibly filtered in that check).
 * @type {Record<import('../settings/store.js').Rating, string>}
 */
const CONTENT_FILTER = { g: 'high', pg: 'medium', 'pg-13': 'low', r: 'off' };

/**
 * @param {{ key: string, rating: import('../settings/store.js').Rating, fetch: typeof globalThis.fetch }} options
 * @returns {import('./gif.js').Provider}
 */
export function klipy({ key, rating, fetch }) {
  /**
   * @param {string} endpoint
   * @param {Record<string, string>} params
   * @param {number} page KLIPY counts pages from 1
   * @returns {Promise<import('./gif.js').Page>}
   */
  async function page(endpoint, params, page) {
    const url = endpointUrl(endpoint);
    url.search = new URLSearchParams({
      per_page: String(PAGE_SIZE),
      page: String(page),
      content_filter: CONTENT_FILTER[rating],
      ...params,
    }).toString();
    const body = await fetchFromProvider(fetch, url, keyRejected);
    // KLIPY requires its results in the order given, unfiltered.
    return { gifs: body.data.data.map(toGif), next: body.data.has_next ? page + 1 : null };
  }

  /** @param {string} endpoint */
  const endpointUrl = (endpoint) => new URL(`${API}/${encodeURIComponent(key)}/gifs/${endpoint}`);

  return {
    /**
     * Looks GIFs up by slug, in the order given; slugs KLIPY no longer has are left out.
     * @param {string[]} ids
     * @returns {Promise<import('./gif.js').Gif[]>}
     */
    async lookup(ids) {
      const found = [];
      for (const batch of batches(ids, LOOKUP_LIMIT)) {
        const url = endpointUrl('items');
        url.search = new URLSearchParams({ slugs: batch.join(',') }).toString();
        const body = await fetchFromProvider(fetch, url, keyRejected);
        found.push(...body.data.data.map(toGif));
      }
      return inOrder(ids, found);
    },
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
    // KLIPY adds a per-request suffix to slugs in search results (e.g. "--kImauHA87"); the
    // lasting slug without it is what the items lookup returns, so that is the ID kept.
    id: String(item.slug).replace(/--k[A-Za-z0-9]{8}$/, ''),
    description: item.title || 'GIF',
    preview: { url: preview.url, width: preview.width, height: preview.height },
    insert: { url: insert.url, width: insert.width, height: insert.height },
  };
}
