# Thundergif - Project Context

Personal project, not connected to Averion Strategy. Vocabulary lives in [GLOSSARY.md](GLOSSARY.md); this file holds decisions and status.

## Status

Design agreed through a grilling session on 20/10/2026. Spec written to [docs/spec.md](docs/spec.md) on 20/10/2026, kept locally until the GitHub repo and issue tracker exist. Broken into ten tickets on 20/10/2026 under `.scratch/v1/issues/` (01 is the starting point; 02, 03, and 08 can run in parallel after it). Local git repo initialised 20/10/2026, nothing committed yet, no GitHub remote. No code written yet.

## Decisions

| # | Topic | Decision |
|---|---|---|
| 1 | Audience | Public: published on GitHub for anyone to use |
| 2 | Name | Thundergif; folder and repo `thundergif` |
| 3 | Providers | KLIPY and GIPHY. A Provider key stored for each, one active, switch inside the Picker. No mixed results (KLIPY terms forbid it) |
| 4 | Excluded providers | Tenor (public API shut down 30/06/2026) and Imgur (blocked in the UK since 30/09/2025, new app registration closed). README explains why |
| 5 | Keys | Each user brings their own Provider key; none ships in the add-on. Picker prompts for setup until a key exists |
| 6 | Favourites | Starred in the Picker, stored locally as GIF IDs (GIPHY id, KLIPY slug), re-fetched on view. One list per Provider. No Provider account favourites (no API for them) |
| 7 | Picker | Compose window toolbar button opening a popup: search box, grid, click to insert at the cursor |
| 8 | Before typing | Show the active Provider's trending GIFs; Favourites one tab away |
| 9 | Results | 24 per page, "More" button for the next 24 |
| 10 | Inserted size | Medium, about 480px wide, normally under 2MB (GIPHY `downsized`, KLIPY `md`) |
| 11 | Linked, not embedded | GIF inserted as a remote link with Thunderbird told not to embed it on send, matching both Providers' "load media directly, do not store" terms. Accepted cost: some recipients see a blocked image until they allow remote content |
| 12 | Plain-text compose | Paste the GIF's link as text, with a one-line note in the Picker |
| 13 | Rating | Setting with G, PG, PG-13, R; default PG. Translated for KLIPY's `content_filter` as R=off, PG-13=low, PG=medium, G=high (mapping from GIPHY's Tenor migration notes; verify against real KLIPY results) |
| 14 | Settings | Add-on's own settings page via Add-ons Manager, linked from the Picker. Stored only on the Mac, nothing synced |
| 15 | Platform | Manifest V3. Minimum Thunderbird 140; primary test target Thunderbird 158 on Apple Silicon Mac. No Windows/Linux testing in v1 |
| 16 | Distribution | `.xpi` on GitHub Releases only for v1. Code written to ATN review rules (no remote code, no unsanitised HTML) so ATN can follow later |
| 17 | Licence | MIT |
| 18 | GIPHY pingbacks | Not sent. README says so; add later only if a production key requires it |
| 19 | Key check | Settings page runs one test search on saving a Provider key and shows "Saved, working" or "Key rejected" |

## Required by Provider terms

- GIPHY: visible "Powered By GIPHY" mark when GIPHY is active.
- KLIPY: search box placeholder must read "Search KLIPY" when KLIPY is active; results must not be reordered or filtered client-side.

## To verify during build

- `execCommand('insertHTML')` or DOM insertion at the cursor works in the current compose editor.
- `moz-do-not-send="true"` still stops Thunderbird embedding remote images on send (check raw source of a sent message).
- Unsigned `.xpi` installs on Thunderbird 158 release.
- KLIPY `content_filter` mapping and default.
