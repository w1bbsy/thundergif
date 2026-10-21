import { PROVIDERS, PROVIDER_IDS } from '../providers/providers.js';
import { insertIntoCompose, isPlainText } from '../compose/insert.js';
import { getProviderKey, getRating } from '../settings/store.js';

/**
 * @typedef {object} PickerEnv
 * @property {Document} document
 * @property {any} browser Thunderbird's add-on API
 * @property {typeof fetch} fetch
 * @property {() => void} close
 * @property {number} [typingPauseMs] how long typing must pause before a search runs
 */

/** @param {PickerEnv} env */
export async function startPicker(env) {
  const { document, browser } = env;
  const searchBox = /** @type {HTMLInputElement} */ (document.querySelector('form.search input'));
  const composeTab = await findComposeTab(browser);
  if (composeTab && (await isPlainText(browser, composeTab.id))) {
    /** @type {HTMLElement} */ (document.querySelector('.note')).hidden = false;
  }
  const rating = await getRating(browser);
  /** @type {Partial<Record<import('../providers/providers.js').ProviderId, string>>} */
  const keys = {};
  for (const id of PROVIDER_IDS) {
    const key = await getProviderKey(browser, id);
    if (key) keys[id] = key;
  }
  const activeId = PROVIDER_IDS.find((id) => keys[id]);
  if (!activeId) {
    const openSettingsForKey = actionButton(document, 'Open settings', () => browser.runtime.openOptionsPage());
    showMessage(document, 'Add a GIPHY or KLIPY Provider key in settings to start finding GIFs.', openSettingsForKey);
    return;
  }
  const info = PROVIDERS[activeId];
  const provider = info.create({ key: /** @type {string} */ (keys[activeId]), rating, fetch: env.fetch });
  searchBox.setAttribute('aria-label', `Search ${info.name}`);
  searchBox.placeholder = `Search ${info.name}`;
  const attribution = /** @type {HTMLElement} */ (document.querySelector('.attribution'));
  attribution.textContent = info.attribution;
  attribution.hidden = info.attribution === '';

  const grid = /** @type {HTMLUListElement} */ (document.querySelector('.grid'));
  const more = /** @type {HTMLButtonElement} */ (document.querySelector('button.more'));
  const tiles = (/** @type {import('../providers/gif.js').Gif[]} */ gifs) =>
    gifs.map((gif) => tile(document, gif, () => insert(env, gif)));
  const unreachable = () => showMessage(document, `Thundergif could not reach ${info.name}. Try again in a moment.`);

  /** @typedef {(next?: number) => Promise<import('../providers/gif.js').Page>} PageSource */
  /** @type {{ source: PageSource, next: number | null }} */
  let listing = { source: provider.trending, next: null };
  // Each new listing bumps this, so replies for an older listing are ignored when they arrive.
  let generation = 0;
  let loadingMore = false;

  /** @param {number | null} next */
  const setNext = (next) => {
    listing.next = next;
    more.hidden = next === null;
  };

  /**
   * @param {PageSource} source
   * @param {string} [emptyText] what to say when there are no results
   */
  const show = async (source, emptyText = 'No GIFs to show right now.') => {
    const mine = ++generation;
    hideMessage(document);
    try {
      const page = await source();
      if (mine !== generation) return;
      grid.replaceChildren(...tiles(page.gifs));
      listing = { source, next: null };
      setNext(page.next);
      if (page.gifs.length === 0) showMessage(document, emptyText);
    } catch {
      if (mine === generation) unreachable();
    }
  };

  more.addEventListener('click', async () => {
    if (loadingMore || listing.next === null) return;
    loadingMore = true;
    const mine = generation;
    try {
      const page = await listing.source(listing.next);
      if (mine !== generation) return;
      grid.append(...tiles(page.gifs));
      setNext(page.next);
    } catch {
      if (mine === generation) unreachable();
    } finally {
      loadingMore = false;
    }
  });

  // The term whose results are showing ('' for trending), so the same search is not repeated.
  let shownTerm = '';
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let typingTimer;

  /** @param {string} term */
  const search = (term) => {
    clearTimeout(typingTimer);
    if (term === shownTerm) return;
    shownTerm = term;
    if (term === '') show(provider.trending);
    else show((next) => provider.search(term, next), `No GIFs found for "${term}". Try different words.`);
  };

  const form = /** @type {HTMLFormElement} */ (document.querySelector('form.search'));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search(searchBox.value.trim());
  });
  // Search as the user types, but only once they pause, to spare the Provider's hourly limit.
  // Emptying the box goes back to trending straight away.
  searchBox.addEventListener('input', () => {
    const term = searchBox.value.trim();
    clearTimeout(typingTimer);
    if (term === '') search('');
    else typingTimer = setTimeout(() => search(term), env.typingPauseMs ?? 500);
  });

  if (await browser.permissions.contains({ origins: info.origins })) {
    searchBox.disabled = false;
    searchBox.focus();
    await show(provider.trending);
    return;
  }
  // Permission prompts are unreliable from a popup, so the settings page (a full tab) asks.
  const openSettings = actionButton(document, 'Open settings', () => browser.runtime.openOptionsPage());
  showMessage(document, `Thundergif needs your permission to reach ${info.name}. Allow it in settings.`, openSettings);
}

/**
 * @param {PickerEnv} env
 * @param {import('../providers/gif.js').Gif} gif
 */
async function insert(env, gif) {
  const tab = await findComposeTab(env.browser);
  if (tab && (await insertIntoCompose(env.browser, tab.id, gif))) {
    env.close();
    return;
  }
  showMessage(env.document, 'Thundergif could not insert the GIF. Click in the body of your email and try again.');
}

/**
 * @param {Document} document
 * @param {import('../providers/gif.js').Gif} gif
 * @param {() => void} onChoose
 */
function tile(document, gif, onChoose) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  const img = document.createElement('img');
  img.src = gif.preview.url;
  img.alt = gif.description;
  img.width = gif.preview.width;
  img.height = gif.preview.height;
  button.append(img);
  button.addEventListener('click', onChoose);
  item.append(button);
  return item;
}

/**
 * @param {Document} document
 * @param {string} text
 * @param {HTMLElement} [action]
 */
function showMessage(document, text, action) {
  const message = messageArea(document);
  const words = document.createElement('span');
  words.textContent = text;
  message.replaceChildren(words, ...(action ? [action] : []));
  message.hidden = false;
}

/** @param {Document} document */
function hideMessage(document) {
  const message = messageArea(document);
  message.hidden = true;
  message.replaceChildren();
}

/** @param {Document} document */
function messageArea(document) {
  return /** @type {HTMLElement} */ (document.querySelector('.message'));
}

/**
 * @param {Document} document
 * @param {string} label
 * @param {() => void} onClick
 */
function actionButton(document, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

/**
 * The compose tab this Picker belongs to, or null if it is not attached to one.
 *
 * @param {any} browser
 * @returns {Promise<{ id: number } | null>}
 */
async function findComposeTab(browser) {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.type === 'messageCompose' ? tab : null;
}
