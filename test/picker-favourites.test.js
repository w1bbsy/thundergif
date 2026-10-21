import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { GIPHY_KEY, giphyTrending, gridTiles, firstTileDescription, starFor, openPicker } from './picker-harness.js';

const KLIPY_KEY = 'test-klipy-key';
const KLIPY_API = `https://api.klipy.com/api/v1/${KLIPY_KEY}/gifs`;
const giphyLookup = { prefix: 'https://api.giphy.com/v1/gifs?', fixture: 'giphy-favourites.json' };
const klipyLookup = { prefix: `${KLIPY_API}/items`, fixture: 'klipy-favourites.json' };
const routes = [
  giphyTrending,
  giphyLookup,
  { prefix: `${KLIPY_API}/trending`, fixture: 'klipy-trending.json' },
  { prefix: `${KLIPY_API}/search`, params: { q: 'cat' }, fixture: 'klipy-search-cat-1.json' },
  klipyLookup,
];
const GIPHY_FAVOURITES = ['BFYLNwlsSNtcc', 'notarealgifid000', '7lN32ye7lLew1hWOyW'];
const descriptions = async () => (await gridTiles()).map((tile) => tile.querySelector('img').alt);

describe('Favourites', () => {
  it('stars a GIF, storing only its ID under the active Provider', async () => {
    const { stored } = await openPicker({ routes });
    await gridTiles();

    await userEvent.click(await starFor('Boom Bang GIF by Atlanta Dream'));

    await waitFor(() => expect(stored.favourites).toEqual({ giphy: ['7lN32ye7lLew1hWOyW'] }));
    expect((await starFor('Boom Bang GIF by Atlanta Dream')).getAttribute('aria-pressed')).toBe('true');
    expect(JSON.stringify(stored)).not.toContain('http');
  });

  it('unstars a Favourite', async () => {
    const { stored } = await openPicker({
      storage: { giphyKey: GIPHY_KEY, favourites: { giphy: ['7lN32ye7lLew1hWOyW'] } },
      routes,
    });
    await gridTiles();
    const star = await starFor('Boom Bang GIF by Atlanta Dream');
    expect(star.getAttribute('aria-pressed')).toBe('true');

    await userEvent.click(star);

    await waitFor(() => expect(stored.favourites).toEqual({ giphy: [] }));
    expect(star.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows Favourites looked up by ID, newest first, leaving out any the Provider no longer has', async () => {
    const { requests } = await openPicker({
      storage: { giphyKey: GIPHY_KEY, favourites: { giphy: GIPHY_FAVOURITES } },
      routes,
    });
    await gridTiles();

    await userEvent.click(screen.getByRole('tab', { name: 'Favourites' }));

    await waitFor(async () => expect(await descriptions()).toEqual(['Laughter Laughing GIF', 'Boom Bang GIF by Atlanta Dream']));
    expect(requests.at(-1).searchParams.get('ids')).toBe(GIPHY_FAVOURITES.join(','));
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });

  it('inserts a Favourite like any other GIF', async () => {
    const { composeDoc, closed } = await openPicker({
      storage: { giphyKey: GIPHY_KEY, favourites: { giphy: GIPHY_FAVOURITES } },
      routes,
    });
    await gridTiles();
    await userEvent.click(screen.getByRole('tab', { name: 'Favourites' }));
    await waitFor(async () => expect(await firstTileDescription()).toBe('Laughter Laughing GIF'));

    await userEvent.click((await gridTiles())[0]);

    await waitFor(() => expect(closed.value).toBe(true));
    expect(composeDoc.querySelector('img').alt).toBe('Laughter Laughing GIF');
  });

  it('explains how to add Favourites when there are none', async () => {
    const { requests } = await openPicker({ routes });
    await gridTiles();
    const before = requests.length;

    await userEvent.click(screen.getByRole('tab', { name: 'Favourites' }));

    expect(await screen.findByText(/No Favourites yet\. Star a GIF to keep it here\./)).toBeTruthy();
    expect(requests).toHaveLength(before);
  });

  it('keeps a separate list for each Provider', async () => {
    const { requests } = await openPicker({
      storage: {
        giphyKey: GIPHY_KEY,
        klipyKey: KLIPY_KEY,
        favourites: { giphy: GIPHY_FAVOURITES, klipy: ['milk-and-mocha-milk-mocha-7', 'happy-wednesday-hump-day-5'] },
      },
      routes,
    });
    await gridTiles();
    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));
    await waitFor(async () => expect(await firstTileDescription()).toBe('Happy Hump Day with Cute Horse'));

    await userEvent.click(screen.getByRole('tab', { name: 'Favourites' }));

    await waitFor(async () => expect(await descriptions()).toEqual(['Milk and Mocha Bear Hug', 'Happy Hump Day with Cute Horse']));
    expect(requests.at(-1).pathname).toBe(`/api/v1/${KLIPY_KEY}/gifs/items`);
  });

  it('stores a KLIPY GIF by its lasting slug, without the per-request suffix', async () => {
    const { stored } = await openPicker({ storage: { klipyKey: KLIPY_KEY }, routes });
    await gridTiles();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search KLIPY' }), 'cat{Enter}');
    await waitFor(async () => expect(await firstTileDescription()).toBe("Goatplaybanjo's Chatty Cat"));

    await userEvent.click(await starFor("Goatplaybanjo's Chatty Cat"));

    await waitFor(() => expect(stored.favourites).toEqual({ klipy: ['goatplaybanjo-chat-4'] }));
  });

  it('goes back to browsing when the user searches from the Favourites tab', async () => {
    await openPicker({
      storage: { giphyKey: GIPHY_KEY, favourites: { giphy: GIPHY_FAVOURITES } },
      routes: [...routes, { prefix: 'https://api.giphy.com/v1/gifs/search', fixture: 'giphy-search-cat-0.json' }],
    });
    await gridTiles();
    await userEvent.click(screen.getByRole('tab', { name: 'Favourites' }));
    await waitFor(async () => expect(await firstTileDescription()).toBe('Laughter Laughing GIF'));

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');

    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));
    expect(screen.getByRole('tab', { name: 'Favourites' }).getAttribute('aria-selected')).toBe('false');
  });

  it('keeps both stars when the user stars on one Provider, switches and stars on the other straight away', async () => {
    const { stored } = await openPicker({ storage: { giphyKey: GIPHY_KEY, klipyKey: KLIPY_KEY }, routes });
    await gridTiles();

    await userEvent.click(await starFor('Boom Bang GIF by Atlanta Dream'));
    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));
    await waitFor(async () => expect(await firstTileDescription()).toBe('Happy Hump Day with Cute Horse'));
    await userEvent.click(await starFor('Happy Hump Day with Cute Horse'));

    await waitFor(() =>
      expect(stored.favourites).toEqual({ giphy: ['7lN32ye7lLew1hWOyW'], klipy: ['happy-wednesday-hump-day-5'] }),
    );
  });

  it('files a star under the Provider its GIF came from, even mid-switch', async () => {
    const slowKlipy = { prefix: `${KLIPY_API}/trending`, fixture: 'klipy-trending.json', delayMs: 40 };
    const { stored } = await openPicker({
      storage: { giphyKey: GIPHY_KEY, klipyKey: KLIPY_KEY },
      routes: [giphyTrending, slowKlipy],
    });
    await gridTiles();
    const giphyStar = await starFor('Boom Bang GIF by Atlanta Dream');

    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));
    giphyStar.click();

    await waitFor(() => expect(stored.favourites?.giphy).toEqual(['7lN32ye7lLew1hWOyW']));
    expect(stored.favourites.klipy ?? []).toEqual([]);
  });

  it('looks up more than 100 GIPHY Favourites in batches of 100', async () => {
    const ids = Array.from({ length: 150 }, (_, i) => `id${i}`);
    const { requests } = await openPicker({ storage: { giphyKey: GIPHY_KEY, favourites: { giphy: ids } }, routes });
    await gridTiles();

    await userEvent.click(screen.getByRole('tab', { name: 'Favourites' }));

    await waitFor(() => expect(requests.filter((r) => r.searchParams.has('ids'))).toHaveLength(2));
    const batches = requests.filter((r) => r.searchParams.has('ids')).map((r) => r.searchParams.get('ids').split(',').length);
    expect(batches).toEqual([100, 50]);
  });
});
