import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import klipyTrendingFixture from './fixtures/klipy-trending.json';
import { gridTiles, firstTileDescription, openPicker } from './picker-harness.js';

const KLIPY_KEY = 'test-klipy-key';
const API = `https://api.klipy.com/api/v1/${KLIPY_KEY}/gifs`;
const klipyTrending = { prefix: `${API}/trending`, fixture: 'klipy-trending.json' };
const klipySearch = (q, page, fixture) => ({ prefix: `${API}/search`, params: { q, page }, fixture });
const klipyRoutes = [
  klipyTrending,
  klipySearch('cat', '1', 'klipy-search-cat-1.json'),
  klipySearch('cat', '2', 'klipy-search-cat-2.json'),
  klipySearch('theremin', '1', 'klipy-search-theremin.json'),
  klipySearch('zqxjvkwplm9q', '1', 'klipy-search-empty.json'),
];
const openKlipyPicker = (options = {}) =>
  openPicker({ storage: { klipyKey: KLIPY_KEY }, routes: klipyRoutes, ...options });

describe('Picker with only a KLIPY Provider key', () => {
  it('shows 24 KLIPY trending GIFs, asking KLIPY for page 1 at PG', async () => {
    const { requests } = await openKlipyPicker();

    expect(await gridTiles()).toHaveLength(24);
    expect(await firstTileDescription()).toBe('Happy Hump Day with Cute Horse');
    const params = requests[0].searchParams;
    expect(requests[0].pathname).toBe(`/api/v1/${KLIPY_KEY}/gifs/trending`);
    expect(params.get('per_page')).toBe('24');
    expect(params.get('page')).toBe('1');
    expect(params.get('content_filter')).toBe('medium');
  });

  it('uses KLIPY wording in the search box and no GIPHY attribution', async () => {
    await openKlipyPicker();
    await gridTiles();

    const box = screen.getByRole('searchbox', { name: 'Search KLIPY' });
    expect(box.getAttribute('placeholder')).toBe('Search KLIPY');
    expect(screen.queryByText('Powered By GIPHY')).toBeNull();
  });

  it('searches KLIPY and pages through results with More', async () => {
    const { requests } = await openKlipyPicker();
    await gridTiles();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search KLIPY' }), 'cat{Enter}');
    await waitFor(async () => expect(await firstTileDescription()).toBe("Goatplaybanjo's Chatty Cat"));
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await waitFor(async () => expect(await gridTiles()).toHaveLength(48));
    expect(requests.at(-1).searchParams.get('page')).toBe('2');
  });

  it('hides More when KLIPY says there is no next page', async () => {
    await openKlipyPicker();
    await gridTiles();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search KLIPY' }), 'theremin{Enter}');

    await waitFor(async () => expect(await firstTileDescription()).toBe('Clutch Theremin'));
    expect(await gridTiles()).toHaveLength(20);
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });

  it('inserts the medium KLIPY version as a link', async () => {
    const { composeDoc, closed } = await openKlipyPicker();

    await userEvent.click((await gridTiles())[0]);

    await waitFor(() => expect(closed.value).toBe(true));
    expect(composeDoc.querySelector('img').getAttribute('src')).toBe(klipyTrendingFixture.data.data[0].file.md.gif.url);
  });

  it.each([
    ['g', 'high'],
    ['pg', 'medium'],
    ['pg-13', 'low'],
    ['r', 'off'],
  ])('translates the Rating %s to the KLIPY content filter %s', async (rating, filter) => {
    const { requests } = await openKlipyPicker({ storage: { klipyKey: KLIPY_KEY, rating } });
    await gridTiles();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search KLIPY' }), 'cat{Enter}');
    await waitFor(() => expect(requests).toHaveLength(2));

    expect(requests.map((r) => r.searchParams.get('content_filter'))).toEqual([filter, filter]);
  });
});
