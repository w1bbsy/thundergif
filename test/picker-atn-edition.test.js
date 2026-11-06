// The ATN edition: the same Picker, without the Experiment that unblocks GIFs in the draft.
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { firstGif, gridTiles, isShown, openPicker } from './picker-harness.js';

const NOTICE = /GIFs show as a blank box while you write, but your recipients see them/i;

describe('Picker in the ATN edition', () => {
  it('inserts the GIF as a link at the cursor, which Thunderbird blocks in the draft, then closes', async () => {
    const { composeDoc, closed, isShownInDraft } = await openPicker({ edition: 'atn' });

    await userEvent.click((await gridTiles())[0]);

    await waitFor(() => expect(closed.value).toBe(true));
    const img = composeDoc.querySelector('p img');
    expect(img.getAttribute('src')).toBe(firstGif.images.downsized.url);
    expect(img.getAttribute('moz-do-not-send')).toBe('true');
    expect(isShownInDraft(img)).toBe(false);
  });

  it('pastes the GIF link in a plain-text email', async () => {
    const { composeDoc, closed } = await openPicker({ edition: 'atn', plainText: true });

    await userEvent.click((await gridTiles())[0]);

    await waitFor(() => expect(closed.value).toBe(true));
    expect(composeDoc.querySelector('p').textContent).toBe(`Hello ${firstGif.images.downsized.url}`);
  });
});

describe('Notice bar in the Picker', () => {
  it('explains blank boxes as soon as the ATN edition opens', async () => {
    await openPicker({ edition: 'atn' });

    expect(isShown(await screen.findByText(NOTICE))).toBe(true);
  });

  it('never appears in Thundergif Live, whose drafts show GIFs', async () => {
    await openPicker({ edition: 'live' });
    await gridTiles();

    expect(screen.queryByText(NOTICE)).toBeNull();
  });

  it('opens settings to show GIFs while writing', async () => {
    const { browser } = await openPicker({ edition: 'atn' });
    let opened = false;
    browser.runtime.openOptionsPage = async () => (opened = true);

    await userEvent.click(await screen.findByRole('button', { name: 'Show them while writing' }));

    expect(opened).toBe(true);
  });

  it('goes away when dismissed and stays away the next time the Picker opens', async () => {
    const { stored } = await openPicker({ edition: 'atn' });

    await userEvent.click(await screen.findByRole('button', { name: 'Dismiss this notice' }));
    expect(screen.queryByText(NOTICE)).toBeNull();

    await openPicker({ edition: 'atn', storage: stored });
    await gridTiles();
    expect(screen.queryByText(NOTICE)).toBeNull();
  });

  it('leaves the arrow keys moving from the search box into the results', async () => {
    await openPicker({ edition: 'atn' });
    await screen.findByText(NOTICE);
    const first = (await gridTiles())[0];

    await userEvent.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(first);
  });
});
