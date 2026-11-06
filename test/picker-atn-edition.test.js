// The ATN edition: the same Picker, without the Experiment that unblocks GIFs in the draft.
import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { firstGif, gridTiles, openPicker } from './picker-harness.js';

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
