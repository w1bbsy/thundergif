# 03: Rating setting

**What to build:** On the settings page a user chooses a Rating of G, PG, PG-13, or R, defaulting to PG. The Rating limits both trending and search results in the Picker.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [ ] Settings page offers G, PG, PG-13, and R; PG is selected when nothing has been saved
- [ ] The saved Rating is stored locally
- [ ] Trending and search requests to GIPHY carry the chosen Rating
- [ ] Changing the Rating affects the next Picker open without restarting Thunderbird
- [ ] Automated tests through the one seam cover the default and each Rating value reaching GIPHY
