// GIPHY Provider: the only place that knows GIPHY's URLs, parameters, and response layout.

import { PAGE_SIZE } from './gif.js';

const API = 'https://api.giphy.com/v1/gifs';

/** Host permissions the add-on needs to reach GIPHY. Media loads as plain images and needs none. */
export const GIPHY_ORIGINS = ['https://api.giphy.com/*'];

/**
 * @param {{ key: string, fetch: typeof globalThis.fetch }} options
 */
export function giphy({ key, fetch }) {
  return {
    /** @returns {Promise<import('./gif.js').Gif[]>} */
    async trending() {
      const url = new URL(`${API}/trending`);
      url.search = new URLSearchParams({ api_key: key, limit: String(PAGE_SIZE), offset: '0', rating: 'pg' }).toString();
      const response = await fetch(url);
      const body = await response.json();
      return body.data.map(toGif);
    },
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
