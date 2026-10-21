import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { GIPHY_KEY, giphyTrending, firstTileDescription, gridTiles, openPicker } from './picker-harness.js';

const KLIPY_KEY = 'test-klipy-key';
const klipyTrending = { prefix: `https://api.klipy.com/api/v1/${KLIPY_KEY}/gifs/trending`, fixture: 'klipy-trending.json' };
const bothKeys = { giphyKey: GIPHY_KEY, klipyKey: KLIPY_KEY };
const routes = [giphyTrending, klipyTrending];
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
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search GIPHY' }), 'whatever');

    await userEvent.click(screen.getByRole('radio', { name: 'KLIPY' }));

    await waitFor(async () => expect(await firstTileDescription()).toBe(KLIPY_FIRST));
    expect(await gridTiles()).toHaveLength(24);
    const box = screen.getByRole('searchbox', { name: 'Search KLIPY' });
    expect(box.value).toBe('');
    expect(screen.queryByText('Powered By GIPHY')).toBeNull();
    expect(stored.activeProvider).toBe('klipy');
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
