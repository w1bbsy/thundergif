// Opens the Picker the way Thunderbird would, against fake Thunderbird and network, and helpers
// for reading what the user sees.
import { screen, within } from '@testing-library/dom';
import giphyTrendingFixture from './fixtures/giphy-trending.json';
import { loadPage, fakeThunderbird, fakeNetwork } from './fakes.js';
import { startPicker } from '../src/picker/picker.js';

export const GIPHY_KEY = 'test-giphy-key';
export const firstGif = giphyTrendingFixture.data[0];
// GIPHY serves each GIF from media0 to media4 and media.giphy.com alike. Thundergif always links
// to media.giphy.com, so the ATN edition's users need only one remote-content exception for GIPHY.
export const FIRST_GIF_INSERT_URL =
  'https://media.giphy.com/media/v1.Y2lkPWYwODJhZjNmaHozcnQ4MTQ2b3hnNG5sMmY2ZWd5Mmc0cGJweWVkb2k1b2Rtb2JxZCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/7lN32ye7lLew1hWOyW/giphy-downsized.gif';
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
/** The GIF tiles (the buttons that insert a GIF) currently in the Picker's grid. */
export const gridTiles = async () =>
  within(await screen.findByRole('list', { name: 'GIFs' }))
    .queryAllByRole('button')
    .filter((button) => !button.hasAttribute('aria-pressed'));
/** The Favourite star on the tile for the GIF with this description. */
export const starFor = async (description) =>
  within(await screen.findByRole('list', { name: 'GIFs' })).getByRole('button', { name: `Favourite: ${description}` });
export const firstTileDescription = async () => (await gridTiles())[0]?.querySelector('img')?.alt;

export async function openPicker({ storage = { giphyKey: GIPHY_KEY }, granted = true, editorAccepts = true, plainText = false, routes = [giphyTrending], waitForStart = true, edition = 'live' } = {}) {
  loadPage('picker/picker.html');
  const tb = fakeThunderbird({ storage, granted, editorAccepts, plainText, edition });
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

