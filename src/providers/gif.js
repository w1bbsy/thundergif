// The GIF shape every Provider returns, so the Picker never sees a Provider's own response layout.

/**
 * @typedef {object} Rendition
 * @property {string} url
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} Gif
 * @property {string} id
 * @property {string} description
 * @property {Rendition} preview small version shown in the Picker
 * @property {Rendition} insert medium version placed in the email
 */

/**
 * @typedef {object} Page
 * @property {Gif[]} gifs
 * @property {number | null} next where the following page starts (a Provider's own offset or page
 *   number, passed back to it unchanged), or null when there are no more
 */

/**
 * What every Provider offers the Picker.
 * @typedef {object} Provider
 * @property {(next?: number) => Promise<Page>} trending
 * @property {(term: string, next?: number) => Promise<Page>} search
 * @property {(ids: string[]) => Promise<Gif[]>} lookup GIFs by ID in the order given, leaving out missing ones
 */

export const PAGE_SIZE = 24;

/**
 * Puts looked-up GIFs back in the order their IDs were asked for, leaving out any not found.
 *
 * @param {string[]} ids
 * @param {Gif[]} gifs
 */
export function inOrder(ids, gifs) {
  const byId = new Map(gifs.map((gif) => [gif.id, gif]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

/**
 * Splits IDs into groups no bigger than a Provider accepts in one lookup.
 *
 * @param {string[]} ids
 * @param {number} size
 */
export function batches(ids, size) {
  return Array.from({ length: Math.ceil(ids.length / size) }, (_, i) => ids.slice(i * size, (i + 1) * size));
}
