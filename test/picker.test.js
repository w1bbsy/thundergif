import { describe, it, expect } from 'vitest';
import { screen, within, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import giphyTrendingFixture from './fixtures/giphy-trending.json';
import { loadPage, fakeThunderbird, fakeNetwork } from './fakes.js';
import { startPicker } from '../src/picker/picker.js';

const GIPHY_KEY = 'test-giphy-key';
const firstGif = giphyTrendingFixture.data[0];
const giphyTrending = { prefix: 'https://api.giphy.com/v1/gifs/trending', fixture: 'giphy-trending.json' };

async function openPicker({ storage = { giphyKey: GIPHY_KEY }, granted = true, editorAccepts = true, routes = [giphyTrending] } = {}) {
  loadPage('picker/picker.html');
  const tb = fakeThunderbird({ storage, granted, editorAccepts });
  const net = fakeNetwork(routes);
  const closed = { value: false };
  await startPicker({ document, browser: tb.browser, fetch: net.fetch, close: () => (closed.value = true) });
  return { ...tb, ...net, closed };
}

describe('Picker with a GIPHY Provider key', () => {
  it('shows 24 GIPHY trending GIFs as small previews when it opens', async () => {
    await openPicker();

    const results = await screen.findByRole('list', { name: 'GIFs' });
    const tiles = within(results).getAllByRole('button');
    expect(tiles).toHaveLength(24);
    const firstPreview = within(tiles[0]).getByRole('img');
    expect(firstPreview.getAttribute('src')).toMatch(/^https:\/\/media\d\.giphy\.com\/.+\/100w\.gif/);
  });

  it('shows "Powered By GIPHY" while GIPHY is the Provider', async () => {
    await openPicker();

    expect(await screen.findByText('Powered By GIPHY')).toBeTruthy();
  });

  it('asks GIPHY for 24 trending GIFs at PG with the stored Provider key', async () => {
    const { requests } = await openPicker();

    await screen.findByRole('list', { name: 'GIFs' });
    expect(requests).toHaveLength(1);
    const params = requests[0].searchParams;
    expect(params.get('api_key')).toBe(GIPHY_KEY);
    expect(params.get('limit')).toBe('24');
    expect(params.get('rating')).toBe('pg');
  });

  it('inserts the medium version as a link at the cursor when a GIF is clicked, then closes', async () => {
    const { composeDoc, browser, closed } = await openPicker();
    const results = await screen.findByRole('list', { name: 'GIFs' });

    await userEvent.click(within(results).getAllByRole('button')[0]);

    await waitFor(() => expect(closed.value).toBe(true));
    expect(browser.scripting.injections[0].target).toEqual({ tabId: 7 });
    const paragraph = composeDoc.querySelector('p');
    const img = paragraph.querySelector('img');
    expect(paragraph.firstChild.textContent).toBe('Hello ');
    expect(img.getAttribute('src')).toBe(firstGif.images.downsized.url);
    expect(img.getAttribute('alt')).toBe('Boom Bang GIF by Atlanta Dream');
    expect(img.getAttribute('moz-do-not-send')).toBe('true');
    expect(img.getAttribute('width')).toBe(firstGif.images.downsized.width);
  });

  it('asks for access to GIPHY before searching when the host permission has been revoked', async () => {
    const { requests } = await openPicker({ granted: false });

    const allow = await screen.findByRole('button', { name: 'Allow access to GIPHY' });
    expect(requests).toHaveLength(0);

    await userEvent.click(allow);

    const results = await screen.findByRole('list', { name: 'GIFs' });
    await waitFor(() => expect(within(results).getAllByRole('button')).toHaveLength(24));
  });
});

describe('Picker without a Provider key', () => {
  it('does not contact GIPHY and offers a way to the settings page', async () => {
    const { requests, browser } = await openPicker({ storage: {} });
    let opened = false;
    browser.runtime.openOptionsPage = async () => (opened = true);

    await userEvent.click(await screen.findByRole('button', { name: 'Open settings' }));

    expect(requests).toHaveLength(0);
    expect(opened).toBe(true);
  });
});

describe('Picker when the compose editor refuses the GIF', () => {
  it('stays open and says the GIF could not be inserted', async () => {
    const { composeDoc, closed } = await openPicker({ editorAccepts: false });
    const results = await screen.findByRole('list', { name: 'GIFs' });

    await userEvent.click(within(results).getAllByRole('button')[0]);

    expect(await screen.findByText(/could not insert the GIF/i)).toBeTruthy();
    expect(closed.value).toBe(false);
    expect(composeDoc.querySelector('img')).toBeNull();
  });
});
