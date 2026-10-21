import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { GIPHY_KEY, gridTiles, openPicker } from './picker-harness.js';

const KLIPY_KEY = 'test-klipy-key';
const giphyAnswer = (status, json = {}) => ({ prefix: 'https://api.giphy.com/', status, json });
const klipyAnswer = (status, json = {}) => ({ prefix: 'https://api.klipy.com/', status, json });
const setups = {
  GIPHY: { storage: { giphyKey: GIPHY_KEY }, answer: giphyAnswer, rejected: giphyAnswer(401, { meta: { status: 401 } }) },
  KLIPY: {
    storage: { klipyKey: KLIPY_KEY },
    answer: klipyAnswer,
    rejected: klipyAnswer(404, { result: false, errors: { message: ['The provided API key is invalid.'] } }),
  },
};

describe.each(Object.keys(setups))('Picker messages when %s fails', (provider) => {
  const { storage, answer, rejected } = setups[provider];

  it('says the key is no longer accepted, with a way to settings', async () => {
    const { browser } = await openPicker({ storage, routes: [rejected] });
    let opened = false;
    browser.runtime.openOptionsPage = async () => (opened = true);

    const message = await screen.findByText(`${provider} no longer accepts your Provider key. Check it in settings.`);
    await userEvent.click(within(message.closest('.message')).getByRole('button', { name: 'Open settings' }));

    expect(opened).toBe(true);
  });

  it('says the hourly limit has been reached', async () => {
    await openPicker({ storage, routes: [answer(429)] });

    expect(await screen.findByText(`You have used this hour's ${provider} requests. Try again later.`)).toBeTruthy();
  });

  it('says the Provider could not be reached', async () => {
    await openPicker({ storage, routes: [answer(503)] });

    expect(await screen.findByText(`Thundergif could not reach ${provider}. Try again in a moment.`)).toBeTruthy();
  });
});

describe('Settings link in the Picker', () => {
  it('is always there', async () => {
    const { browser } = await openPicker();
    await gridTiles();
    let opened = false;
    browser.runtime.openOptionsPage = async () => (opened = true);

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(opened).toBe(true);
  });
});
