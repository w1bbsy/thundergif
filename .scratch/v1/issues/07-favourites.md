# 07: Favourites

**What to build:** A user stars a GIF in the Picker to make it a Favourite, and unstars it to remove it. A Favourites tab shows the active Provider's Favourites, which insert exactly like search results. Favourites are kept per Provider, stored locally as GIF IDs only (GIPHY id, KLIPY slug), and fetched again by ID when the tab is viewed. Starred GIFs show as starred in trending and search results. Favourites the Provider no longer has drop out quietly. An empty Favourites tab explains how to add one.

**Blocked by:** 05 (Switching Provider)

**Status:** ready-for-agent

- [ ] Each GIF tile has a star toggle; starring adds its ID to the active Provider's Favourites list
- [ ] Unstarring removes it
- [ ] Favourites tab shows the active Provider's Favourites, fetched by ID through the Provider
- [ ] Inserting a Favourite behaves the same as inserting a search result
- [ ] Switching Provider switches the Favourites list shown
- [ ] Only IDs are stored; no media URLs are kept
- [ ] Favourites survive restarting Thunderbird
- [ ] GIFs missing from the Provider's lookup response are left out without a broken tile
- [ ] Starred state shows on trending and search tiles
- [ ] Empty Favourites tab shows a how-to message
- [ ] Automated tests through the one seam cover star, unstar, per-Provider lists, ID lookup requests, missing GIFs, and the empty state
