# 02: Search with More (GIPHY)

**What to build:** In the Picker, a user types a search term and sees 24 matching GIPHY GIFs. A "More" button appends the next 24 without losing the ones already shown, and disappears when GIPHY has no further results. A search that finds nothing shows a clear "no results" message. The search box is focused when the Picker opens.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [ ] Typing a term and submitting searches GIPHY and shows 24 results
- [ ] "More" requests the next page and appends results to the grid
- [ ] "More" is hidden when there are no further results
- [ ] A search with no matches shows a "no results" message
- [ ] Clearing the search returns to trending
- [ ] Search box has focus when the Picker opens
- [ ] Automated tests through the one seam cover search, paging offsets, appending, hidden More, and no results
