# Thundergif - Project Context

Personal project, not connected to Averion Strategy. Vocabulary lives in [GLOSSARY.md](GLOSSARY.md); this file holds decisions and status.

## Status

Design agreed through a grilling session on 20/10/2026. Spec written to [docs/spec.md](docs/spec.md) on 20/10/2026, kept in the repo as the reference design. Broken into ten tickets on 20/10/2026, now GitHub issues #1 to #10 with native blocking links and the ready-for-agent label (#1 is the starting point; #2, #3, and #8 can run in parallel after it). Agent skills configured 20/10/2026: GitHub Issues, default triage labels, single-context domain docs (see CLAUDE.md). Public GitHub repo created 20/10/2026: https://github.com/w1bbsy/thundergif . Issue #1 (walking skeleton) implemented 21/10/2026. Manual check 21/10/2026: install, key, trending, attribution, insert at cursor, undo, and sent-as-link all passed; GIFs showed broken in the draft. Fixed 22/10/2026 with an Experiment (see docs/adr/0001), verified by the real-Thunderbird check; awaiting a final manual check of 0.1.2.

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

## Build notes (issue #1)

- Host permissions cover GIPHY's API and media servers (media, media0 to media4, i.giphy.com). Adding media hosts (0.1.1) was a wrong guess at the draft bug, but they are kept: the add-on's own pages load GIPHY media.
- Real cause of the broken draft image: Thunderbird's compose window blocks remote images unless its allowRemoteContent flag is on, which only its own UI actions set. Fixed with the `thundergifCompose` Experiment (docs/adr/0001-experiment-to-show-linked-gifs-in-drafts.md).
- `checks/thunderbird/check.py` runs a throwaway headless Thunderbird (empty profile) and checks an inserted GIF really loads in the draft. Needs Thunderbird and `pip install -r checks/thunderbird/requirements.txt`. Run before releases and after Thunderbird updates.
- Permission prompts from the Picker popup did not work (button never cleared). The Picker now sends the user to settings, where the "Allow access to GIPHY" button asks.
- The compose editor never animates GIFs, including manually inserted ones; recipients see them animate.
- GIFs go in through the editor's `insertImage` command, which takes only the URL (no HTML is parsed) and keeps undo. Alt text, size, and `moz-do-not-send` are set on the inserted image afterwards. If the editor refuses, the Picker says so and stays open; there is no silent fallback.
- `compose` permission kept alongside `scripting` for injecting into compose tabs; confirm in the manual check.
- The Picker already shows a minimal "no Provider key" message with an Open settings button; issue #6 should refine it rather than add a second one.
- Firefox's linter asks for `data_collection_permissions`; handle in issue #10.

## Required by Provider terms

- GIPHY: visible "Powered By GIPHY" mark when GIPHY is active.
- KLIPY: search box placeholder must read "Search KLIPY" when KLIPY is active; results must not be reordered or filtered client-side.

## To verify during build

- `execCommand('insertHTML')` or DOM insertion at the cursor works in the current compose editor.
- `moz-do-not-send="true"` still stops Thunderbird embedding remote images on send (check raw source of a sent message).
- Unsigned `.xpi` installs on Thunderbird 158 release.
- KLIPY `content_filter` mapping and default.
