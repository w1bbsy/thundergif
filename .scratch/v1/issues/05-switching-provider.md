# 05: Switching Provider

**What to build:** A user with both Provider keys picks which Provider is active on the settings page, and can switch Provider from inside the Picker without opening settings. The Picker always shows which Provider is active. A user with only one key never sees a choice: that Provider is active automatically.

**Blocked by:** 04 (KLIPY Provider)

**Status:** ready-for-agent

- [ ] Settings page lets the user choose the active Provider when both keys exist
- [ ] With one key, that Provider is active and no choice is shown in settings or the Picker
- [ ] Picker shows which Provider is active
- [ ] Picker switch changes the active Provider, reloads trending, and swaps attribution and placeholder correctly
- [ ] Removing the active Provider's key makes the other Provider active if it has a key
- [ ] Results from the two Providers are never mixed in one grid
- [ ] Automated tests through the one seam cover one key, two keys, switching, and key removal
