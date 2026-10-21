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

export const PAGE_SIZE = 24;
