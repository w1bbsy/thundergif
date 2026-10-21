import { describe, it, expect } from 'vitest';
import { screen, within, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
  GIPHY_KEY,
  firstGif,
  giphyTrending,
  giphySearch,
  searchRoutes,
  isShown,
  gridTiles,
  firstTileDescription,
  openPicker,
} from './picker-harness.js';

describe('Picker with a GIPHY Provider key', () => {
  it('shows 24 GIPHY trending GIFs as small previews when it opens', async () => {
    await openPicker();

    const results = await screen.findByRole('list', { name: 'GIFs' });
    const tiles = await gridTiles();
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

    await userEvent.click((await gridTiles())[0]);

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

  it('inserts the GIF so Thunderbird shows it in the draft rather than blocking it', async () => {
    const { composeDoc, isShownInDraft } = await openPicker();
    const results = await screen.findByRole('list', { name: 'GIFs' });

    await userEvent.click((await gridTiles())[0]);

    await waitFor(() => expect(composeDoc.querySelector('img')).not.toBeNull());
    expect(isShownInDraft(composeDoc.querySelector('img'))).toBe(true);
  });

  it('sends the user to settings instead of searching when access to GIPHY is not allowed', async () => {
    const { requests, browser } = await openPicker({ granted: false });
    let opened = false;
    browser.runtime.openOptionsPage = async () => (opened = true);

    expect(await screen.findByText(/needs your permission to reach GIPHY/i)).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Open settings' }));

    expect(requests).toHaveLength(0);
    expect(opened).toBe(true);
  });
});

describe('Picker without a Provider key', () => {
  it('turns the search box off until a Provider key is added', async () => {
    await openPicker({ storage: {} });

    await waitFor(() => expect(screen.getByRole('searchbox', { name: 'Search' }).disabled).toBe(true));
  });

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

    await userEvent.click((await gridTiles())[0]);

    expect(await screen.findByText(/could not insert the GIF/i)).toBeTruthy();
    expect(closed.value).toBe(false);
    expect(composeDoc.querySelector('img')).toBeNull();
  });
});

describe('Searching GIPHY in the Picker', () => {
  it('shows 24 GIFs matching the search term', async () => {
    const { requests } = await openPicker({ routes: searchRoutes });
    await gridTiles();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');

    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));
    expect(await gridTiles()).toHaveLength(24);
    const search = requests.at(-1);
    expect(search.pathname).toBe('/v1/gifs/search');
    expect(search.searchParams.get('q')).toBe('cat');
    expect(search.searchParams.get('limit')).toBe('24');
    expect(search.searchParams.get('rating')).toBe('pg');
  });

  it('searches once the user pauses typing, with a single request for the whole term', async () => {
    const { requests } = await openPicker({ routes: searchRoutes });
    await gridTiles();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat');

    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));
    const searches = requests.filter((r) => r.pathname === '/v1/gifs/search');
    expect(searches.map((r) => r.searchParams.get('q'))).toEqual(['cat']);
  });

  it('searches straight away when the Search button is pressed', async () => {
    await openPicker({ routes: searchRoutes });
    await gridTiles();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat');

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));
  });

  it('adds the next 24 results under the first 24 when More is pressed', async () => {
    const { requests } = await openPicker({ routes: searchRoutes });
    await gridTiles();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');
    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));

    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await waitFor(async () => expect(await gridTiles()).toHaveLength(48));
    expect(await firstTileDescription()).toBe('High Five Ai GIF');
    expect(requests.at(-1).searchParams.get('offset')).toBe('24');
    expect(requests.at(-1).searchParams.get('q')).toBe('cat');
  });

  it('hides More when GIPHY has no further results', async () => {
    await openPicker({ routes: [giphyTrending, giphySearch('cat', '0', 'giphy-search-cat-480.json')] });
    await gridTiles();
    expect(screen.getByRole('button', { name: 'More' })).toBeTruthy();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');

    await waitFor(async () => expect(await gridTiles()).toHaveLength(20));
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });

  it('says so when a search finds nothing', async () => {
    await openPicker({ routes: searchRoutes });
    await gridTiles();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'zqxjvkwplm9q{Enter}');

    expect(await screen.findByText(/No GIFs found for "zqxjvkwplm9q"/)).toBeTruthy();
    expect(await gridTiles()).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });

  it('goes back to trending when the search is cleared', async () => {
    await openPicker({ routes: searchRoutes });
    await gridTiles();
    const box = screen.getByRole('searchbox', { name: 'Search GIPHY' });
    await userEvent.type(box, 'cat{Enter}');
    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));

    await userEvent.clear(box);
    await userEvent.type(box, '{Enter}');

    await waitFor(async () => expect(await firstTileDescription()).toBe('Boom Bang GIF by Atlanta Dream'));
  });

  it('lets More work for the new Provider when a More request for the old one is still running', async () => {
    const KLIPY_KEY = 'test-klipy-key';
    const API = `https://api.klipy.com/api/v1/${KLIPY_KEY}/gifs`;
    const { requests } = await openPicker({
      storage: { giphyKey: GIPHY_KEY, klipyKey: KLIPY_KEY },
      routes: [
        { ...giphyTrending, params: { offset: '0' } },
        { prefix: 'https://api.giphy.com/v1/gifs/trending', params: { offset: '24' }, fixture: 'giphy-search-cat-24.json', delayMs: 60 },
        { prefix: `${API}/trending`, params: { page: '1' }, fixture: 'klipy-trending.json' },
        { prefix: `${API}/trending`, params: { page: '2' }, fixture: 'klipy-search-cat-2.json' },
      ],
    });
    await gridTiles();
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));
    await waitFor(async () => expect(await firstTileDescription()).toBe('Happy Hump Day with Cute Horse'));
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await waitFor(() => expect(requests.some((r) => r.searchParams.get('page') === '2')).toBe(true));
  });

  it('keeps the search results when the slower trending reply arrives afterwards', async () => {
    const slowTrending = { ...giphyTrending, delayMs: 50 };
    await openPicker({ routes: [slowTrending, ...searchRoutes.slice(1)], waitForStart: false });
    const box = screen.getByRole('searchbox');
    await waitFor(() => expect(box.disabled).toBe(false));

    await userEvent.type(box, 'cat{Enter}');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(await firstTileDescription()).toBe('High Five Ai GIF');
  });

  it('asks for the next page only once when More is pressed twice quickly', async () => {
    const slowSecondPage = { ...giphySearch('cat', '24', 'giphy-search-cat-24.json'), delayMs: 30 };
    const { requests } = await openPicker({
      routes: [giphyTrending, giphySearch('cat', '0', 'giphy-search-cat-0.json'), slowSecondPage],
    });
    await gridTiles();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');
    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));

    const more = screen.getByRole('button', { name: 'More' });
    await userEvent.click(more);
    await userEvent.click(more);
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(await gridTiles()).toHaveLength(48);
    expect(requests.filter((r) => r.searchParams.get('offset') === '24')).toHaveLength(1);
  });

  it('goes back to trending as soon as the search box is emptied', async () => {
    await openPicker({ routes: searchRoutes });
    await gridTiles();
    const box = screen.getByRole('searchbox', { name: 'Search GIPHY' });
    await userEvent.type(box, 'cat{Enter}');
    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));

    await userEvent.clear(box);

    await waitFor(async () => expect(await firstTileDescription()).toBe('Boom Bang GIF by Atlanta Dream'));
  });

  it('says GIPHY could not be reached when a request fails, and keeps working', async () => {
    await openPicker({
      routes: [giphyTrending, { ...giphySearch('cat', '0'), status: 503, json: { meta: { status: 503 } } }],
    });
    await gridTiles();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');

    expect(await screen.findByText(/could not reach GIPHY/i)).toBeTruthy();
  });

  it('puts the cursor in the search box when the Picker opens', async () => {
    await openPicker({ routes: searchRoutes });

    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search GIPHY' })));
  });
});

describe('Rating in the Picker', () => {
  it.each(['g', 'pg', 'pg-13', 'r'])('asks GIPHY for trending and search results at the saved Rating %s', async (rating) => {
    const { requests } = await openPicker({ storage: { giphyKey: GIPHY_KEY, rating }, routes: searchRoutes });
    await gridTiles();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');
    await waitFor(() => expect(requests).toHaveLength(2));

    expect(requests.map((r) => r.searchParams.get('rating'))).toEqual([rating, rating]);
  });

  it('uses PG when no Rating has been saved', async () => {
    const { requests } = await openPicker({ storage: { giphyKey: GIPHY_KEY } });
    await gridTiles();

    expect(requests[0].searchParams.get('rating')).toBe('pg');
  });
});

describe('Picker in a plain-text email', () => {
  it('explains that a link will be pasted', async () => {
    await openPicker({ plainText: true });

    await waitFor(() => expect(isShown(screen.queryByText(/plain text, so Thundergif will paste a link to the GIF/i))).toBe(true));
  });

  it('pastes the GIF link at the cursor instead of an image, then closes', async () => {
    const { composeDoc, closed } = await openPicker({ plainText: true });

    await userEvent.click((await gridTiles())[0]);

    await waitFor(() => expect(closed.value).toBe(true));
    expect(composeDoc.querySelector('img')).toBeNull();
    expect(composeDoc.querySelector('p').textContent).toBe(`Hello ${firstGif.images.downsized.url}`);
  });

  it('does not show the plain-text note in an HTML email', async () => {
    await openPicker();
    await gridTiles();

    expect(isShown(screen.queryByText(/plain text/i))).toBe(false);
  });
});
