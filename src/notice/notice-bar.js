// The Notice bar: in the ATN edition only, explains that GIFs show as a blank box while writing
// (there is no Experiment to unblock them; ADR 0002) but recipients see them.
import { hasExperiment } from '../compose/insert.js';
import { getNoticeDismissed, setNoticeDismissed } from '../settings/store.js';

/**
 * Fills and shows the Notice bar in `bar` when this is the ATN edition and the user has not
 * dismissed it.
 *
 * @param {Document} document
 * @param {any} browser Thunderbird's add-on API
 * @param {HTMLElement} bar
 * @param {{ showSteps?: () => void }} [options] showSteps leads to the steps for showing GIFs while
 *   writing; leave it out where those steps are already on the page
 */
export async function showNoticeBar(document, browser, bar, { showSteps } = {}) {
  if (hasExperiment(browser) || (await getNoticeDismissed(browser))) return;
  const text = document.createElement('span');
  text.textContent = 'GIFs show as a blank box while you write, but your recipients see them.';
  bar.replaceChildren(text);
  if (showSteps) bar.append(' ', linkButton(document, 'Show them while writing', showSteps));
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'dismiss';
  dismiss.textContent = 'Dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss this notice');
  dismiss.addEventListener('click', async () => {
    bar.hidden = true;
    bar.replaceChildren();
    await setNoticeDismissed(browser);
  });
  bar.append(dismiss);
  bar.hidden = false;
}

/**
 * @param {Document} document
 * @param {string} label
 * @param {() => void} onClick
 */
function linkButton(document, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'link';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}
