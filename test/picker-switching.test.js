import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { GIPHY_KEY, giphyTrending, firstTileDescription, gridTiles, openPicker } from './picker-harness.js';

const KLIPY_KEY = 'test-klipy-key';
const klipyTrending = { prefix: `https://api.klipy.com/api/v1/${KLIPY_KEY}/gifs/trending`, fixture: 'klipy-trending.json' };
const bothKeys = { giphyKey: GIPHY_KEY, klipyKey: KLIPY_KEY };
const routes = [giphyTrending, klipyTrending];
const KLIPY_API = `https://api.klipy.com/api/v1/${KLIPY_KEY}/gifs`;
const searchRoutes = [
  giphyTrending,
  klipyTrending,
  { prefix: 'https://api.giphy.com/v1/gifs/search', params: { q: 'cat' }, fixture: 'giphy-search-cat-0.json' },
  { prefix: `${KLIPY_API}/search`, params: { q: 'cat' }, fixture: 'klipy-search-cat-1.json' },
  { prefix: 'https://api.giphy.com/v1/gifs?', fixture: 'giphy-favourites.json' },
  { prefix: `${KLIPY_API}/items`, fixture: 'klipy-favourites.json' },
];
const GIPHY_FIRST = 'Boom Bang GIF by Atlanta Dream';
const KLIPY_FIRST = 'Happy Hump Day with Cute Horse';

describe('Choosing the Provider in the Picker', () => {
  it('shows which Provider is active and offers the other when both keys are saved', async () => {
    await openPicker({ storage: bothKeys, routes });

    await waitFor(async () => expect(await firstTileDescription()).toBe(GIPHY_FIRST));
    expect(screen.getByRole('radio', { name: 'GIPHY' }).checked).toBe(true);
    expect(screen.getByRole('radio', { name: 'KLIPY' }).checked).toBe(false);
  });

  it('shows no Provider choice when only one key is saved', async () => {
    await openPicker({ storage: { klipyKey: KLIPY_KEY }, routes });
    await gridTiles();

    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('switches to the other Provider, reloading trending with its wording and attribution', async () => {
    const { stored } = await openPicker({ storage: bothKeys, routes });
    await waitFor(async () => expect(await firstTileDescription()).toBe(GIPHY_FIRST));

    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));

    await waitFor(async () => expect(await firstTileDescription()).toBe(KLIPY_FIRST));
    expect(await gridTiles()).toHaveLength(24);
    expect(screen.getByRole('searchbox', { name: 'Search KLIPY' }).value).toBe('');
    expect(screen.queryByText('Powered By GIPHY')).toBeNull();
    expect(stored.activeProvider).toBe('klipy');
  });

  it('keeps the search term and runs the same search on the other Provider', async () => {
    const { requests } = await openPicker({ storage: bothKeys, routes: searchRoutes });
    await waitFor(async () => expect(await firstTileDescription()).toBe(GIPHY_FIRST));
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'cat{Enter}');
    await waitFor(async () => expect(await firstTileDescription()).toBe('High Five Ai GIF'));

    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));

    await waitFor(async () => expect(await firstTileDescription()).toBe("Goatplaybanjo's Chatty Cat"));
    expect(screen.getByRole('searchbox', { name: 'Search KLIPY' }).value).toBe('cat');
    expect(requests.at(-1).searchParams.get('q')).toBe('cat');
  });

  it('stays on Favourites, showing the other Provider\'s list, when switching from the Favourites tab', async () => {
    await openPicker({
      storage: { ...bothKeys, favourites: { giphy: ['BFYLNwlsSNtcc'], klipy: ['milk-and-mocha-milk-mocha-7'] } },
      routes: searchRoutes,
    });
    await waitFor(async () => expect(await firstTileDescription()).toBe(GIPHY_FIRST));
    await userEvent.click(screen.getByRole('tab', { name: 'Favourites' }));
    await waitFor(async () => expect(await firstTileDescription()).toBe('Laughter Laughing GIF'));

    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));

    await waitFor(async () => expect(await firstTileDescription()).toBe('Milk and Mocha Bear Hug'));
    expect(screen.getByRole('tab', { name: 'Favourites' }).getAttribute('aria-selected')).toBe('true');
  });

  it('opens on the Provider chosen last time', async () => {
    await openPicker({ storage: { ...bothKeys, activeProvider: 'klipy' }, routes });

    await waitFor(async () => expect(await firstTileDescription()).toBe(KLIPY_FIRST));
    expect(screen.getByRole('radio', { name: 'KLIPY' }).checked).toBe(true);
  });

  it('falls back to the other Provider when the chosen one no longer has a key', async () => {
    await openPicker({ storage: { klipyKey: KLIPY_KEY, activeProvider: 'giphy' }, routes });

    await waitFor(async () => expect(await firstTileDescription()).toBe(KLIPY_FIRST));
  });
});
