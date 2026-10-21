import { PROVIDERS, PROVIDER_IDS, PROVIDER_NAMES } from '../providers/providers.js';
import { insertIntoCompose, isPlainText } from '../compose/insert.js';
import { ProviderError } from '../providers/provider-request.js';
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
  document.querySelector('main.picker')?.addEventListener('keydown', (event) => keyboard(env, searchBox, /** @type {KeyboardEvent} */ (event)));
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
    showMessage(document, `Add a ${PROVIDER_NAMES} Provider key in settings to start finding GIFs.`, openSettingsForKey);
    return;
  }
  /** @type {import('../providers/providers.js').ProviderInfo} */
  let info = PROVIDERS[firstId];
  /** @type {import('../providers/gif.js').Provider} */
  let provider = info.create({ key: /** @type {string} */ (keys[firstId]), rating, fetch: env.fetch });
  const attribution = /** @type {HTMLElement} */ (document.querySelector('.attribution'));
  let activeId = firstId;
  /**
   * Each Provider's Favourite IDs, newest first, once loaded.
   * @type {Partial<Record<import('../providers/providers.js').ProviderId, string[]>>}
   */
  const favouritesOf = {};
  const browseTab = /** @type {HTMLButtonElement} */ (document.querySelector('[role="tab"].browse'));
  const favouritesTab = /** @type {HTMLButtonElement} */ (document.querySelector('[role="tab"].favourites'));
  /** @param {HTMLButtonElement} tab */
  const selectTab = (tab) => {
    for (const each of [browseTab, favouritesTab]) each.setAttribute('aria-selected', String(each === tab));
  };

  /**
   * Stars or unstars a GIF in the list of the Provider it came from, which may no longer be the
   * active one if the user has just switched.
   * @param {import('../providers/providers.js').ProviderId} id
   * @param {import('../providers/gif.js').Gif} gif
   */
  const toggleFavourite = (id, gif) => {
    const list = favouritesOf[id] ?? [];
    const updated = list.includes(gif.id) ? list.filter((each) => each !== gif.id) : [gif.id, ...list];
    favouritesOf[id] = updated;
    setFavourites(browser, id, updated);
    return updated.includes(gif.id);
  };

  const grid = /** @type {HTMLUListElement} */ (document.querySelector('.grid'));
  const more = /** @type {HTMLButtonElement} */ (document.querySelector('button.more'));
  const tiles = (/** @type {import('../providers/gif.js').Gif[]} */ gifs) => {
    const id = activeId;
    return gifs.map((gif) =>
      tile(document, gif, () => insert(env, gif), {
        starred: (favouritesOf[id] ?? []).includes(gif.id),
        toggle: () => toggleFavourite(id, gif),
      }),
    );
  };
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
      if (mine === generation) loadingMore = false;
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
    const favourites = favouritesOf[activeId] ?? [];
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

  let activation = 0;
  /**
   * Makes a Provider the one the Picker searches, starting again from its trending GIFs.
   * @param {import('../providers/providers.js').ProviderId} id
   */
  const activate = async (id) => {
    // A later switch wins if the user changes Provider again while this one is still loading.
    const mine = ++activation;
    const favourites = favouritesOf[id] ?? (await getFavourites(browser, id));
    if (mine !== activation) return;
    favouritesOf[id] = favourites;
    activeId = id;
    loadingMore = false;
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
    const allowed = await browser.permissions.contains({ origins: info.origins });
    if (mine !== activation) return;
    if (!allowed) {
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

/** How many tiles make one row of the grid. */
const COLUMNS = 3;

/**
 * Keyboard use: Escape closes the Picker, the down arrow moves from the search box into the
 * results, and the arrow keys move between tiles (Enter on a tile inserts it, as for any button).
 *
 * @param {PickerEnv} env
 * @param {HTMLInputElement} searchBox
 * @param {KeyboardEvent} event
 */
function keyboard(env, searchBox, event) {
  if (event.key === 'Escape') {
    env.close();
    return;
  }
  const tiles = /** @type {HTMLButtonElement[]} */ ([...env.document.querySelectorAll('.grid li > button:not(.star)')]);
  const focused = env.document.activeElement;
  /** @param {number} index */
  const focusTile = (index) => {
    event.preventDefault();
    tiles[Math.max(0, Math.min(index, tiles.length - 1))]?.focus();
  };
  if (focused === searchBox) {
    if (event.key === 'ArrowDown' && tiles.length > 0) focusTile(0);
    return;
  }
  // A focused star moves as if its tile had focus.
  const tileButton = focused?.classList.contains('star') ? focused.parentElement?.querySelector('button:not(.star)') : focused;
  const at = tiles.indexOf(/** @type {HTMLButtonElement} */ (tileButton));
  if (at === -1) return;
  if (event.key === 'ArrowRight') focusTile(at + 1);
  else if (event.key === 'ArrowLeft') focusTile(at - 1);
  else if (event.key === 'ArrowDown') focusTile(at + COLUMNS);
  else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (at < COLUMNS) searchBox.focus();
    else focusTile(at - COLUMNS);
  }
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
