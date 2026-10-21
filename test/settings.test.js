import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { loadPage, fakeThunderbird } from './fakes.js';
import { startSettings } from '../src/settings/settings.js';

async function openSettings({ storage = {}, granted = true } = {}) {
  loadPage('settings/settings.html');
  const tb = fakeThunderbird({ storage, granted });
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

  it('asks for access to GIPHY when it is not allowed, then confirms it', async () => {
    await openSettings({ granted: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Allow access to GIPHY' }));

    expect(await screen.findByText('Access to GIPHY allowed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Allow access to GIPHY' })).toBeNull();
  });

  it('does not offer the access button when access to GIPHY is already allowed', async () => {
    await openSettings({ granted: true });

    expect(await screen.findByText('Access to GIPHY allowed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Allow access to GIPHY' })).toBeNull();
  });
});
