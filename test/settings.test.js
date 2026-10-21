import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { loadPage, fakeThunderbird } from './fakes.js';
import { startSettings } from '../src/settings/settings.js';

async function openSettings({ storage = {} } = {}) {
  loadPage('settings/settings.html');
  const tb = fakeThunderbird({ storage });
  await startSettings({ document, browser: tb.browser });
  return tb;
}

describe('Settings page', () => {
  it('saves a GIPHY Provider key to local storage', async () => {
    const { stored } = await openSettings();

    await userEvent.type(screen.getByLabelText('GIPHY Provider key'), '  abc123  ');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(stored.giphyKey).toBe('abc123');
  });

  it('shows the GIPHY Provider key already saved', async () => {
    await openSettings({ storage: { giphyKey: 'saved-key' } });

    expect(screen.getByLabelText('GIPHY Provider key').value).toBe('saved-key');
  });
});
