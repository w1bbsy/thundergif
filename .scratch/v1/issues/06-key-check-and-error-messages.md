# 06: Key check and error messages

**What to build:** Saving a Provider key runs one test search and shows "Saved, working" or "Key rejected", or names the real problem if the failure was something else. A user with no Provider key who opens the Picker sees a "set up a Provider" prompt with a link to settings. During normal use the Picker shows plain messages when the hourly limit is hit, when the Provider cannot be reached, and when the key stops working (with a settings link). The Picker's settings link is available at all times.

**Blocked by:** 04 (KLIPY Provider)

**Status:** ready-for-agent

- [ ] Saving a key triggers exactly one test search for that Provider
- [ ] Accepted key shows "Saved, working"; authentication failure shows "Key rejected"
- [ ] Rate-limit and connection failures during the key check are reported as themselves, not as a bad key
- [ ] Picker with no keys shows a "set up a Provider" prompt linking to settings
- [ ] Picker shows distinct plain messages for hourly limit reached, Provider unreachable, and key no longer working (with settings link)
- [ ] Picker has a settings link at all times
- [ ] Works for both GIPHY and KLIPY
- [ ] Automated tests through the one seam cover each outcome for both Providers
