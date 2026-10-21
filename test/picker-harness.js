// Opens the Picker the way Thunderbird would, against fake Thunderbird and network, and helpers
// for reading what the user sees.
import { screen, within } from '@testing-library/dom';
import giphyTrendingFixture from './fixtures/giphy-trending.json';
import { loadPage, fakeThunderbird, fakeNetwork } from './fakes.js';
import { startPicker } from '../src/picker/picker.js';

export const GIPHY_KEY = 'test-giphy-key';
export const firstGif = giphyTrendingFixture.data[0];
export const giphyTrending = { prefix: 'https://api.giphy.com/v1/gifs/trending', fixture: 'giphy-trending.json' };
export const giphySearch = (q, offset, fixture) => ({
  prefix: 'https://api.giphy.com/v1/gifs/search',
  params: { q, offset },
  fixture,
});
export const searchRoutes = [
  giphyTrending,
  giphySearch('cat', '0', 'giphy-search-cat-0.json'),
  giphySearch('cat', '24', 'giphy-search-cat-24.json'),
  giphySearch('zqxjvkwplm9q', '0', 'giphy-search-empty.json'),
];
export const isShown = (element) => element !== null && element.closest('[hidden]') === null;
/** The GIF tiles currently in the Picker's grid. */
export const gridTiles = async () => within(await screen.findByRole('list', { name: 'GIFs' })).queryAllByRole('button');
export const firstTileDescription = async () => (await gridTiles())[0]?.querySelector('img')?.alt;

export async function openPicker({ storage = { giphyKey: GIPHY_KEY }, granted = true, editorAccepts = true, plainText = false, routes = [giphyTrending], waitForStart = true } = {}) {
  loadPage('picker/picker.html');
  const tb = fakeThunderbird({ storage, granted, editorAccepts, plainText });
  const net = fakeNetwork(routes);
  const closed = { value: false };
  const started = startPicker({
    document,
    browser: tb.browser,
    fetch: net.fetch,
    close: () => (closed.value = true),
    typingPauseMs: 20,
  });
  if (waitForStart) await started;
  return { ...tb, ...net, closed };
}

