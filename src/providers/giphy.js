// GIPHY Provider: the only place that knows GIPHY's URLs, parameters, and response layout.

import { PAGE_SIZE } from './gif.js';

const API = 'https://api.giphy.com/v1/gifs';

/**
 * Host permissions the add-on needs for GIPHY: the API, plus the media servers, because a GIF
 * placed in the compose editor by the add-on is loaded on the add-on's behalf.
 */
export const GIPHY_ORIGINS = [
  'https://api.giphy.com/*',
  'https://media.giphy.com/*',
  'https://media0.giphy.com/*',
  'https://media1.giphy.com/*',
  'https://media2.giphy.com/*',
  'https://media3.giphy.com/*',
  'https://media4.giphy.com/*',
  'https://i.giphy.com/*',
];

/**
 * @param {{ key: string, rating: import('../settings/store.js').Rating, fetch: typeof globalThis.fetch }} options
 */
export function giphy({ key, rating, fetch }) {
  /**
   * @param {string} endpoint
   * @param {Record<string, string>} params
   * @param {number} offset
   * @returns {Promise<import('./gif.js').Page>}
   */
  async function page(endpoint, params, offset) {
    const url = new URL(`${API}/${endpoint}`);
    url.search = new URLSearchParams({
      api_key: key,
      limit: String(PAGE_SIZE),
      offset: String(offset),
      // GIPHY's rating values match Thundergif's Rating values.
      rating,
      ...params,
    }).toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error(`GIPHY responded ${response.status}`);
    const body = await response.json();
    const { offset: start, count, total_count: total } = body.pagination;
    return { gifs: body.data.map(toGif), next: count > 0 && start + count < total ? start + count : null };
  }

  return {
    /** @param {number} [offset] */
    trending: (offset = 0) => page('trending', {}, offset),
    /**
     * @param {string} term
     * @param {number} [offset]
     */
    search: (term, offset = 0) => page('search', { q: term }, offset),
  };
}

/**
 * @param {any} item one entry from GIPHY's response
 * @returns {import('./gif.js').Gif}
 */
function toGif(item) {
  const preview = item.images.fixed_width_small;
  const insert = item.images.downsized;
  return {
    id: item.id,
    description: item.alt_text || item.title || 'GIF',
    preview: { url: preview.url, width: Number(preview.width), height: Number(preview.height) },
    insert: { url: insert.url, width: Number(insert.width), height: Number(insert.height) },
  };
}
