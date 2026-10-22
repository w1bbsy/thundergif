# Thundergif - Project Context

Personal project, not connected to Averion Strategy. Vocabulary lives in [GLOSSARY.md](GLOSSARY.md); this file holds decisions and status.

## Status

v1.0.0 released 22/10/2026: https://github.com/w1bbsy/thundergif/releases/tag/v1.0.0

Design agreed through a grilling session on 20/10/2026. Spec written to [docs/spec.md](docs/spec.md) on 20/10/2026, kept in the repo as the reference design. Broken into ten tickets on 20/10/2026, now GitHub issues #1 to #10 with native blocking links and the ready-for-agent label (#1 is the starting point; #2, #3, and #8 can run in parallel after it). Agent skills configured 20/10/2026: GitHub Issues, default triage labels, single-context domain docs (see CLAUDE.md). Public GitHub repo created 20/10/2026: https://github.com/w1bbsy/thundergif . Issue #1 (walking skeleton) implemented 21/10/2026. Manual check 21/10/2026: install, key, trending, attribution, insert at cursor, undo, and sent-as-link all passed; GIFs showed broken in the draft. Fixed 22/10/2026 with an Experiment (see docs/adr/0001), verified by the real-Thunderbird check; final manual check of 0.1.2 passed 22/10/2026; issue #1 closed. Issues #2, #3, #8 implemented 22/10/2026 (0.2.0), awaiting manual check; #11 icon drafted, awaiting approval.

## Current plan (remaining v1 work, started 22/10/2026)

1. #4 KLIPY Provider - done (committed), manual check pending
2. #5 Switching Provider - done (committed), manual check pending
3. #6 Key check and error messages - done (committed), manual check pending
4. #7 Favourites - done (committed), manual check pending
5. #9 Keyboard use - done (committed), manual check pending
6. #10 v1 release - done: v1.0.0 published on GitHub Releases 22/10/2026, #10 closed
7. Thunderbird feature request drafted at docs/upstream/thunderbird-feature-request-insert-remote-images.md - on the maintainer's backlog as issue #12
8. Code review done; manual checklist passed on Thunderbird 158 (22/10/2026); #4, #5, #6, #7, #9 closed

Install warning decision (22/10/2026): keep the Experiment and explain the "full, unrestricted access" warning in the README; Thunderbird shows it for any add-on with an Experiment and it cannot be softened.

## v1.1 design (grilling, 22/10/2026)

Built 22/10/2026 as 1.1.0: #13 (search kept on switch), #14 (beer link), #15 (GIPHY logo and creator credit). Manual check passed; released on GitHub 22/10/2026 (v1.1.0); #13 to #15 closed. ATN upload waits for 1.0.2's approval.


| # | Topic | Decision |
|---|---|---|
| 20 | Search term on Provider switch | The term stays in the box and the search reruns on the new Provider (one request). Only within one Picker session; each new Picker opens on trending. |
| 21 | Tab on Provider switch | Stays on whatever tab was showing (search results or Favourites). |
| 22 | Account favourites | Dropped: neither GIPHY nor KLIPY offers an API for reading them (checked 22/10/2026). README says so. Thundergif's own Favourites stay. |
| 23 | Beer link placement | A small, passive "Buy me a beer" link at the bottom of the settings page, plus the README and GitHub repo page. Not in the Picker, never on install or as a reminder. |
| 24 | ATN Contribute button | Not used: ATN only accepts PayPal, Liberapay, Patreon, Open Collective and similar, not Stripe. |
| 25 | GIPHY attribution | Add the official GIPHY logo (bundled, never loaded remotely) beside "Powered by GIPHY", and show each GIF's creator where GIPHY provides one. |
| 26 | Stripe link | Stripe donation link https://donate.stripe.com/dRm14m0RbfEqaMg3S0a3u00 (customer chooses amount, 4 GBP preset), made by the maintainer in the dashboard. Thundergif stores only the address; no Stripe keys or code. Also in .github/FUNDING.yml for GitHub's Sponsor button. |
| 27 | Link wording | "Enjoying Thundergif? Buy me a beer", the link opening the Payment Link in the default browser. |
| 28 | Release of these changes | 1.1.0 on GitHub straight away; uploaded to ATN only after 1.0.2 is approved, so the review queue is not reset. |

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

## Build notes (issues #2, #3, #8)

- Search runs once typing pauses for 500ms (one request per term, not per letter), or straight away on Enter or the Search button; the same term is never re-requested. Emptying the box returns to trending. Changed from Enter-only after the 22/10/2026 manual check.
- A newer listing always wins: replies for an older search or page are dropped, and More ignores repeat clicks while loading.
- A failed GIPHY request shows "could not reach GIPHY"; issue #6 will add specific messages (rate limit, bad key, offline).
- Rating values are stored as GIPHY's strings (g, pg, pg-13, r). KLIPY (#4) must translate them in its adapter.
- Plain-text emails get the GIF's medium media URL typed at the cursor (undoable insertText).
- `checks/thunderbird/check.py` now also checks the plain-text path in a real Thunderbird.

## addons.thunderbird.net (22/10/2026)

- 1.0.2 approved and listed on ATN (https://addons.thunderbird.net/thunderbird/addon/thundergif/). 1.1.0 uploaded with user-facing version notes, awaiting review.

- Maintainer is submitting manually. 1.0.0 passed ATN's automatic validation (2 expected warnings: Thunderbird-only `compose` permission and API).
- 1.0.1 prepared for the human review: `sensitiveDataUpload` permission (ATN rule for hardcoded third-party servers), Experiment clears the startup cache on non-shutdown unload, settings page lists what is sent. Listing text, privacy policy and reviewer notes in docs/atn-listing.md.
- The cache clean-up has not been exercised by a test (it only runs on disable, removal or update).
- Expect admin review because of the Experiment.
- 1.0.1 failed ATN validation: Experiments require `strict_max_version`. 1.0.2 sets it to 158.* (newest tested). Each new major Thunderbird release: run checks/thunderbird/check.py on it, raise strict_max_version, bump and release; until then Thundergif is disabled on that version.

## Release notes (1.0.0, 22/10/2026)

- Licence copyright holder is the GitHub handle w1bbsy (not a personal name), as the repo is public.
- Firefox's linter flags a missing `data_collection_permissions` key; not added, as Thunderbird's support for it is unconfirmed. Revisit before submitting to addons.thunderbird.net.
- Thunderbird 140 ESR has not been tested and the maintainer cannot test it (22/10/2026); README and release notes say tested on Thunderbird 158 on macOS only.

## Build notes (issue #4)

- KLIPY pages by page number (from 1) with a has_next flag; the Provider passes it back as Page.next.
- KLIPY previews use the xs GIF (90px), inserts use md.
- KLIPY content filter: with no filter sent, KLIPY returns the same as "off", so Thundergif always sends one (G=high, PG=medium, PG-13=low, R=off). Spot check 22/10/2026 on "kiss": off, low and medium returned identical results; only high removed some.
- KLIPY appends a per-request suffix to slugs (e.g. kiss-AA4--kImauHA87); relevant to Favourites (#7).
- KLIPY bad key: HTTP 404 with "The provided API key is invalid." GIPHY bad key: HTTP 401. Relevant to #6.

## Required by Provider terms

- GIPHY: visible "Powered By GIPHY" mark when GIPHY is active.
- KLIPY: search box placeholder must read "Search KLIPY" when KLIPY is active; results must not be reordered or filtered client-side.

## To verify during build

- `execCommand('insertHTML')` or DOM insertion at the cursor works in the current compose editor.
- `moz-do-not-send="true"` still stops Thunderbird embedding remote images on send (check raw source of a sent message).
- Unsigned `.xpi` installs on Thunderbird 158 release.
- KLIPY `content_filter` mapping and default.
