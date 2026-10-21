import { PROVIDERS, PROVIDER_IDS } from '../providers/providers.js';
import { insertIntoCompose, isPlainText } from '../compose/insert.js';
import { ProviderError } from '../providers/errors.js';
import {
  getProviderKey,
  getRating,
  getActiveProvider,
  setActiveProvider,
  getFavourites,
  setFavourites,
} from '../settings/store.js';

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
  document.querySelector('button.settings')?.addEventListener('click', () => browser.runtime.openOptionsPage());
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
  const withKeys = PROVIDER_IDS.filter((id) => keys[id]);
  const firstId = await getActiveProvider(browser, withKeys);
  if (!firstId) {
    const openSettingsForKey = actionButton(document, 'Open settings', () => browser.runtime.openOptionsPage());
    showMessage(document, 'Add a GIPHY or KLIPY Provider key in settings to start finding GIFs.', openSettingsForKey);
    return;
  }
  /** @type {import('../providers/providers.js').ProviderInfo} */
  let info = PROVIDERS[firstId];
  /** @type {ReturnType<typeof info.create>} */
  let provider = info.create({ key: /** @type {string} */ (keys[firstId]), rating, fetch: env.fetch });
  const attribution = /** @type {HTMLElement} */ (document.querySelector('.attribution'));
  let activeId = firstId;
  /** @type {string[]} newest first */
  let favourites = [];
  const browseTab = /** @type {HTMLButtonElement} */ (document.querySelector('[role="tab"].browse'));
  const favouritesTab = /** @type {HTMLButtonElement} */ (document.querySelector('[role="tab"].favourites'));
  /** @param {HTMLButtonElement} tab */
  const selectTab = (tab) => {
    for (const each of [browseTab, favouritesTab]) each.setAttribute('aria-selected', String(each === tab));
  };

  /** @param {import('../providers/gif.js').Gif} gif */
  const toggleFavourite = (gif) => {
    favourites = favourites.includes(gif.id) ? favourites.filter((id) => id !== gif.id) : [gif.id, ...favourites];
    setFavourites(browser, activeId, favourites);
    return favourites.includes(gif.id);
  };

  const grid = /** @type {HTMLUListElement} */ (document.querySelector('.grid'));
  const more = /** @type {HTMLButtonElement} */ (document.querySelector('button.more'));
  const tiles = (/** @type {import('../providers/gif.js').Gif[]} */ gifs) =>
    gifs.map((gif) =>
      tile(document, gif, () => insert(env, gif), { starred: favourites.includes(gif.id), toggle: () => toggleFavourite(gif) }),
    );
  /** @param {unknown} error */
  const failed = (error) => {
    const kind = error instanceof ProviderError ? error.kind : 'unreachable';
    if (kind === 'rejected') {
      const openSettings = actionButton(document, 'Open settings', () => browser.runtime.openOptionsPage());
      showMessage(document, `${info.name} no longer accepts your Provider key. Check it in settings.`, openSettings);
    } else if (kind === 'limit') {
      showMessage(document, `You have used this hour's ${info.name} requests. Try again later.`);
    } else {
      showMessage(document, `Thundergif could not reach ${info.name}. Try again in a moment.`);
    }
  };

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
    } catch (error) {
      if (mine === generation) failed(error);
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
    } catch (error) {
      if (mine === generation) failed(error);
    } finally {
      loadingMore = false;
    }
  });

  // The term whose results are showing ('' for trending, null for Favourites), so the same
  // search is not repeated.
  /** @type {string | null} */
  let shownTerm = '';
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let typingTimer;

  /** @param {string} term */
  const search = (term) => {
    clearTimeout(typingTimer);
    if (term === shownTerm) return;
    shownTerm = term;
    selectTab(browseTab);
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

  const showFavourites = () => {
    clearTimeout(typingTimer);
    shownTerm = null;
    selectTab(favouritesTab);
    if (favourites.length === 0) {
      generation++;
      grid.replaceChildren();
      setNext(null);
      showMessage(document, 'No Favourites yet. Star a GIF to keep it here.');
      return;
    }
    const ids = [...favourites];
    show(async () => ({ gifs: await provider.lookup(ids), next: null }), 'None of your Favourites are available any more.');
  };
  favouritesTab.addEventListener('click', showFavourites);
  browseTab.addEventListener('click', () => {
    shownTerm = null;
    search(searchBox.value.trim());
  });

  /**
   * Makes a Provider the one the Picker searches, starting again from its trending GIFs.
   * @param {import('../providers/providers.js').ProviderId} id
   */
  const activate = async (id) => {
    activeId = id;
    favourites = await getFavourites(browser, id);
    selectTab(browseTab);
    info = PROVIDERS[id];
    provider = info.create({ key: /** @type {string} */ (keys[id]), rating, fetch: env.fetch });
    searchBox.setAttribute('aria-label', `Search ${info.name}`);
    searchBox.placeholder = `Search ${info.name}`;
    searchBox.value = '';
    clearTimeout(typingTimer);
    shownTerm = '';
    attribution.textContent = info.attribution;
    attribution.hidden = info.attribution === '';
    // Drop the other Provider's results so the two are never mixed.
    generation++;
    grid.replaceChildren();
    setNext(null);
    if (!(await browser.permissions.contains({ origins: info.origins }))) {
      searchBox.disabled = true;
      // Permission prompts are unreliable from a popup, so the settings page (a full tab) asks.
      const openSettings = actionButton(document, 'Open settings', () => browser.runtime.openOptionsPage());
      showMessage(document, `Thundergif needs your permission to reach ${info.name}. Allow it in settings.`, openSettings);
      return;
    }
    searchBox.disabled = false;
    searchBox.focus();
    await show(provider.trending);
  };

  if (withKeys.length > 1) {
    const choice = /** @type {HTMLFieldSetElement} */ (document.querySelector('.providers'));
    choice.replaceChildren(
      ...withKeys.map((id) => {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'provider';
        radio.value = id;
        radio.checked = id === firstId;
        radio.addEventListener('change', () => {
          setActiveProvider(browser, id);
          activate(id);
        });
        label.append(radio, PROVIDERS[id].name);
        return label;
      }),
    );
    choice.hidden = false;
  }
  await activate(firstId);
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
 * @param {{ starred: boolean, toggle: () => boolean }} favourite
 */
function tile(document, gif, onChoose, favourite) {
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
  const star = document.createElement('button');
  star.type = 'button';
  star.className = 'star';
  star.setAttribute('aria-label', `Favourite: ${gif.description}`);
  star.setAttribute('aria-pressed', String(favourite.starred));
  star.textContent = '\u2605';
  star.addEventListener('click', () => star.setAttribute('aria-pressed', String(favourite.toggle())));
  item.append(button, star);
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
