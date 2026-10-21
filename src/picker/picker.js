import { giphy, GIPHY_ORIGINS } from '../providers/giphy.js';
import { insertIntoCompose } from '../compose/insert.js';
import { getGiphyKey } from '../settings/store.js';

/**
 * @typedef {object} PickerEnv
 * @property {Document} document
 * @property {any} browser Thunderbird's add-on API
 * @property {typeof fetch} fetch
 * @property {() => void} close
 */

/** @param {PickerEnv} env */
export async function startPicker(env) {
  const { document, browser } = env;
  const giphyKey = await getGiphyKey(browser);
  if (!giphyKey) {
    const openSettingsForKey = actionButton(document, 'Open settings', () => browser.runtime.openOptionsPage());
    showMessage(document, 'Add a GIPHY Provider key in settings to start finding GIFs.', openSettingsForKey);
    return;
  }
  const provider = giphy({ key: giphyKey, fetch: env.fetch });

  const showTrending = async () => {
    hideMessage(document);
    const gifs = await provider.trending();
    const grid = /** @type {HTMLUListElement} */ (document.querySelector('.grid'));
    grid.replaceChildren(...gifs.map((gif) => tile(document, gif, () => insert(env, gif))));
  };

  if (await browser.permissions.contains({ origins: GIPHY_ORIGINS })) {
    await showTrending();
    return;
  }
  // Permission prompts are unreliable from a popup, so the settings page (a full tab) asks.
  const openSettings = actionButton(document, 'Open settings', () => browser.runtime.openOptionsPage());
  showMessage(document, 'Thundergif needs your permission to reach GIPHY. Allow it in settings.', openSettings);
}

/**
 * @param {PickerEnv} env
 * @param {import('../providers/gif.js').Gif} gif
 */
async function insert(env, gif) {
  const [tab] = await env.browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.type === 'messageCompose' && (await insertIntoCompose(env.browser, tab.id, gif))) {
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
