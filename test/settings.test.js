import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { loadPage, fakeThunderbird, fakeNetwork } from './fakes.js';
import { startSettings } from '../src/settings/settings.js';

const giphyWorks = { prefix: 'https://api.giphy.com/v1/gifs/', fixture: 'giphy-trending.json' };
const klipyWorks = { prefix: 'https://api.klipy.com/api/v1/', fixture: 'klipy-trending.json' };
const answer = (prefix, status, json) => ({ prefix, status, json });

async function openSettings({ storage = {}, granted = true, routes = [giphyWorks, klipyWorks] } = {}) {
  loadPage('settings/settings.html');
  const tb = fakeThunderbird({ storage, granted });
  const net = fakeNetwork(routes);
  await startSettings({ document, browser: tb.browser, fetch: net.fetch });
  return { ...tb, ...net };
}

/** Types a key into a Provider's field and saves. */
async function saveKey(provider, key) {
  await userEvent.type(screen.getByLabelText(`${provider} Provider key`), key);
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
}

describe('Settings page', () => {
  it('saves a GIPHY Provider key to local storage', async () => {
    const { stored } = await openSettings();

    await userEvent.type(screen.getByLabelText('GIPHY Provider key'), '  abc123  ');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(stored.giphyKey).toBe('abc123');
  });

  it('shows the GIPHY Provider key already saved', async () => {
    await openSettings({ storage: { giphyKey: 'saved-key' } });

    expect(screen.getByLabelText('GIPHY Provider key').value).toBe('saved-key');
  });

  it('asks for access to GIPHY when it is not allowed, then confirms it', async () => {
    await openSettings({ granted: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Allow access to GIPHY' }));

    expect(await screen.findByText('Access to GIPHY allowed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Allow access to GIPHY' })).toBeNull();
  });

  it('does not offer the access button when access to GIPHY is already allowed', async () => {
    await openSettings({ granted: true });

    expect(await screen.findByText('Access to GIPHY allowed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Allow access to GIPHY' })).toBeNull();
  });

  it('offers the four Ratings with PG chosen when none has been saved', async () => {
    await openSettings();

    const rating = screen.getByLabelText('Rating');
    expect(Array.from(rating.options, (o) => o.textContent)).toEqual(['G', 'PG', 'PG-13', 'R']);
    expect(rating.selectedOptions[0].textContent).toBe('PG');
  });

  it('saves the chosen Rating', async () => {
    const { stored } = await openSettings({ storage: { giphyKey: 'saved-key' } });

    await userEvent.selectOptions(screen.getByLabelText('Rating'), 'PG-13');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(stored.rating).toBe('pg-13');
    expect(stored.giphyKey).toBe('saved-key');
  });

  it('shows the Rating already saved', async () => {
    await openSettings({ storage: { rating: 'r' } });

    expect(screen.getByLabelText('Rating').selectedOptions[0].textContent).toBe('R');
  });

  it('saves a KLIPY Provider key alongside the GIPHY one', async () => {
    const { stored } = await openSettings({ storage: { giphyKey: 'giphy-key' } });

    await userEvent.type(screen.getByLabelText('KLIPY Provider key'), 'klipy-key');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(stored.klipyKey).toBe('klipy-key');
    expect(stored.giphyKey).toBe('giphy-key');
  });

  it('asks for access to KLIPY separately from GIPHY', async () => {
    await openSettings({ granted: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Allow access to KLIPY' }));

    expect(await screen.findByText('Access to KLIPY allowed')).toBeTruthy();
  });

  it('lets the user choose the active Provider when both keys are saved', async () => {
    const { stored } = await openSettings({ storage: { giphyKey: 'g', klipyKey: 'k' } });

    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(stored.activeProvider).toBe('klipy');
  });

  it('offers no Provider choice with only one key saved', async () => {
    await openSettings({ storage: { giphyKey: 'g' } });

    expect(screen.queryByRole('radio')).toBeNull();
  });
});

describe('Checking a Provider key when it is saved', () => {
  it('runs one test search with a new GIPHY key and says it works', async () => {
    const { requests } = await openSettings();

    await saveKey('GIPHY', 'new-key');

    expect(await screen.findByText('GIPHY: Saved, working')).toBeTruthy();
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get('api_key')).toBe('new-key');
  });

  it('does not test keys that have not changed', async () => {
    const { requests } = await openSettings({ storage: { giphyKey: 'old-key' } });

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByText('Saved');
    expect(requests).toHaveLength(0);
  });

  it.each([
    ['GIPHY', answer('https://api.giphy.com/', 401, { meta: { status: 401, msg: 'Unauthorized' } })],
    ['KLIPY', answer('https://api.klipy.com/', 404, { result: false, errors: { message: ['The provided API key is invalid.'] } })],
  ])('says a rejected %s key was rejected', async (provider, route) => {
    await openSettings({ routes: [route] });

    await saveKey(provider, 'wrong-key');

    expect(await screen.findByText(`${provider}: Key rejected`)).toBeTruthy();
  });

  it.each(['GIPHY', 'KLIPY'])('reports the hourly limit for %s rather than blaming the key', async (provider) => {
    const prefix = provider === 'GIPHY' ? 'https://api.giphy.com/' : 'https://api.klipy.com/';
    await openSettings({ routes: [answer(prefix, 429, {})] });

    await saveKey(provider, 'some-key');

    expect(await screen.findByText(`${provider}: Saved, but the hourly limit is used up, so the key could not be checked yet`)).toBeTruthy();
  });

  it.each(['GIPHY', 'KLIPY'])('reports %s being unreachable rather than blaming the key', async (provider) => {
    const prefix = provider === 'GIPHY' ? 'https://api.giphy.com/' : 'https://api.klipy.com/';
    await openSettings({ routes: [answer(prefix, 503, {})] });

    await saveKey(provider, 'some-key');

    expect(await screen.findByText(`${provider}: Saved, but ${provider} could not be reached to check the key`)).toBeTruthy();
  });
});
