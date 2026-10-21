import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { gridTiles, openPicker } from './picker-harness.js';

describe('Using the Picker from the keyboard', () => {
  it('moves from the search box into the results with the down arrow', async () => {
    await openPicker();
    const tiles = await gridTiles();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search GIPHY' })));

    await userEvent.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(tiles[0]);
  });

  it('moves between tiles with the arrow keys, a row of three at a time up and down', async () => {
    await openPicker();
    const tiles = await gridTiles();
    tiles[0].focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tiles[1]);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(tiles[4]);
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tiles[3]);
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(tiles[0]);
  });

  it('goes back to the search box with the up arrow from the top row', async () => {
    await openPicker();
    const tiles = await gridTiles();
    tiles[1].focus();

    await userEvent.keyboard('{ArrowUp}');

    expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search GIPHY' }));
  });

  it('inserts the focused GIF with Enter', async () => {
    const { composeDoc, closed } = await openPicker();
    const tiles = await gridTiles();
    tiles[0].focus();
    await userEvent.keyboard('{ArrowRight}');

    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(closed.value).toBe(true));
    expect(composeDoc.querySelector('img').alt).toBe(tiles[1].querySelector('img').alt);
  });

  it('closes with Escape', async () => {
    const { closed } = await openPicker();
    await gridTiles();

    await userEvent.keyboard('{Escape}');

    expect(closed.value).toBe(true);
  });

  it('names each tile after its GIF for screen readers', async () => {
    await openPicker();
    await gridTiles();

    expect(screen.getByRole('button', { name: 'Boom Bang GIF by Atlanta Dream' })).toBeTruthy();
  });

  it('keeps arrow keys working when a star has focus', async () => {
    await openPicker();
    const tiles = await gridTiles();
    tiles[0].parentElement.querySelector('.star').focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(tiles[1]);
  });
});
