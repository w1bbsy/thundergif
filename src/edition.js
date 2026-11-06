// Which Edition is running (ADR 0002). Thundergif Live includes the Experiment that lets drafts
// show GIFs; the ATN edition does not. This is the only switch between them.

/**
 * Whether this Edition includes the Experiment (Thundergif Live) or not (the ATN edition).
 *
 * @param {any} browser Thunderbird's add-on API
 */
export function hasExperiment(browser) {
  return browser.thundergifCompose !== undefined;
}
