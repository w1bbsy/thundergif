# Thundergif - Project Context

Personal project, not connected to Averion Strategy. Vocabulary lives in [GLOSSARY.md](GLOSSARY.md); this file holds decisions and status.

## Status

v1.0.0 released 22/10/2026: https://github.com/w1bbsy/thundergif/releases/tag/v1.0.0

v1.2.0 (two Editions) released on GitHub 06/11/2026: https://github.com/w1bbsy/thundergif/releases/tag/v1.2.0 . The ATN edition is uploaded to addons.thunderbird.net and awaiting review.

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

- Host permissions cover GIPHY's API and media servers (media, media0 to media4, i.giphy.com). Adding media hosts (0.1.1) was a wrong guess at the draft bug, but they are kept: the add-on's own pages load GIPHY media. Superseded 06/11/2026 (1.2.1): see the 1.2.1 entry under ATN rejection.
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

## ATN rejection (04/11/2026)

- 1.1.1 rejected by ATN reviewer: "not accepting new submissions using Experiment APIs, except unmodified copies of the latest published API drafts" (thundergifCompose is not one). Version disabled. Thundergif counts as new, since no version was ever approved.
- The cited announcement (Topicbox, 17 March) describes a temporary pause "until after the release of Thunderbird ESR 153", which has shipped; the reviewer's wording is stricter and open-ended. Sources conflict.
- Published drafts in thunderbird/webext-experiments: calendar, NotificationBox only; nothing for compose or images.
- Decision: A then B. A: ask the reviewers whether the pause has ended (draft in docs/upstream/atn-reviewers-experiment-question.md; maintainer sends). B if no: a separate plain ATN edition without the Experiment and with its own add-on ID (no install warning, no strict_max_version chore; draft shows a broken image unless the user adds remote-content exceptions, recipients unaffected). The full version stays on GitHub.
- Reviewer reply (05/11/2026): a Topicbox update on 02/06/2026 extended the pause until the next ESR in 2027, possibly longer. An API-draft proposal is welcome via Bugzilla or discuss.thunderbird.net, with no timescale. They "look forward to your submission without the experiment". So route B goes ahead; design by grilling started 05/11/2026.
- B1 (05/11/2026): reverses "its own add-on ID" above. The plain ATN edition keeps thundergif@w1bbsy.github.io and the existing ATN listing; the full GitHub edition gets a new ID, so ATN updates (matched by ID, unverified) cannot replace it with the plain edition. Existing GitHub installs reinstall once.
- B2 (05/11/2026): names. ATN edition "Thundergif"; GitHub edition "Thundergif Live" (new ID along the lines of thundergif-live@w1bbsy.github.io). Both can be installed together, so the names must differ. No "Plus"/"Pro" (sounds paid).
- B3 (06/11/2026): showing GIFs while writing in the ATN edition. The add-on cannot add remote-content exceptions itself. Settings get a "Show GIFs while you write" section listing the GIF server addresses with Copy buttons and the menu path (Settings > Privacy & Security > Remote Content > Exceptions), noting exceptions also apply to received mail. Inserted GIFs use one media address per Provider if the real-Thunderbird check proves the media servers are interchangeable (unverified), so two exceptions instead of about ten. Nothing extra goes into the email (no alt-text or in-body notes).
- B3 notice (maintainer's choice over a hint after a failed load, which would mean a confusing first failure): the ATN edition's Picker shows a notice bar from the start explaining GIFs show as a blank box while writing but recipients see them, linking to the settings steps; permanently dismissible. Settings show the same notice plus a link to Thundergif Live on GitHub.
- B4 (06/11/2026): the Thundergif Live link sits on the settings page only, worded neutrally ("a version that shows GIFs while you write ... needs extra permissions, so it isn't listed here"), and is declared in the ATN reviewer notes. ATN policy on such links not checked; if reviewers object, remove it and resubmit.
- B5 (06/11/2026): one source tree, two builds. Only the manifest (name, ID, cap, Experiment) and inclusion of experiments/ differ. `npm run build` writes thundergif-<version>.xpi (ATN) and thundergif-live-<version>.xpi (GitHub). Behaviour switches at run time on whether the Experiment is present. Tests cover both editions; the real-Thunderbird check covers both; `npm run compat` affects Live only (ATN edition has no cap).
- B6 (06/11/2026): both editions share version numbers; next is 1.2.0. One GitHub Release carries both .xpi files, and its notes tell 1.1.1 users to remove it and install Thundergif Live or the ATN edition. ATN gets thundergif-1.2.0.xpi on the existing listing; listing text and reviewer notes drop the Experiment and install-warning passages and declare the Live link. Maintainer removes their own 1.1.1 and installs Live, or ATN would update it to the plain edition.
- Grilling for route B finished 06/11/2026. Spec published as issue #17 (06/11/2026). Tickets (06/11/2026), sub-issues of #17 with native blocking: #22 Two Editions build (start here); #18 Notice bar and #19 One media server per Provider (both after #22, can run in parallel); #20 Show GIFs while you write settings section (after #18 and #19); #21 Docs and 1.2.0 release prep (after #20). Numbers are out of order because #22 was created last.
- Build (06/11/2026), #22: src/manifest.json is the ATN edition; editions/live.json holds Live's differences; scripts/editions.mjs stages either Edition for the build and the real-Thunderbird check. Live's button title is "Insert a GIF (Thundergif Live)". Firefox's addons-linter reports one error on Live (experiment_apis is a privileged field), expected; the ATN edition lints with no errors.
- Build (06/11/2026), #18: Notice bar in the Picker (with "Show them while writing", which opens settings) and on the settings page (no link; the steps will sit on that page, #20). One stored flag, noticeDismissed, shared by both.
- Build (06/11/2026), #19, confirmed: GIPHY's media, media0 to media4 and i hosts return byte-identical files for the same path; KLIPY's static and static2 match, static1 does not resolve. In real Thunderbird 159, remote-content exceptions for https://media.giphy.com and https://static.klipy.com (permission type "image") make the ATN edition's GIFs show in the draft. Adapters now insert from media.giphy.com and static.klipy.com in both Editions; previews unchanged. #20 lists exactly these two addresses.
- Review (06/11/2026) of #22, #18, #19, fixed in 836c1e8: the check now compares bytes across media servers itself (needs certifi, now in requirements.txt; KLIPY refuses Python's default User-Agent, so the check sends "thundergif-check"); patterns narrowed to verified hosts; hasExperiment moved to src/edition.js. Left as judgement calls: Notice bar CSS duplicated across the two pages' stylesheets; Edition passed as a bare 'atn'/'live' string; check.py names the two media hosts itself. Until #20 lands, the Picker's "Show them while writing" opens a settings page without the steps, so do not release the ATN edition before #20.
- Build (06/11/2026), #20: the ATN edition's settings page has "Show GIFs while you write": steps, each Provider's address (from one constant per adapter, shared with the insert rewrite) with a Copy button, the received-mail note, and the neutral Thundergif Live link to https://github.com/w1bbsy/thundergif. Corrects B3's menu path: Thunderbird 159's wording is Settings > Privacy & Security > Email content > Exceptions..., then "Address of web site", Allow, Save Changes (read from Thunderbird's own en-GB strings). The Picker's "Show them while writing" now opens the settings page in a popup window at settings.html#show-gifs, scrolled to the steps (openOptionsPage cannot target a section, and a new window comes to the front over the compose window).
- Clipboard finding (06/11/2026), #20: in real Thunderbird 159, navigator.clipboard.writeText from a click on the settings page copies with no clipboardWrite permission; no permission added. If it ever fails, the page says to select the address by hand (one click selects it). The real-Thunderbird check now opens the settings window the way the Notice bar link does, and clicks Copy for real, so a Thunderbird change here would show up in the monthly run.

- Build (06/11/2026), #21: version 1.2.0 for both Editions. README (which edition to choose, install for each, moving from 1.1.1, steps to show GIFs while writing, and install warning marked as Live only), docs/atn-listing.md (description and privacy policy without the Experiment, reviewer notes declaring the Live link and explaining the guarded thundergifCompose reference), docs/release-notes/v1.2.0.md and docs/manual-checklist.md (both Editions) updated. The ATN .xpi lints with no errors and the same six (6) warnings as before (Firefox's linter does not know Thunderbird APIs). One check run failed the exceptions step (GIFs still blocked) and the next four passed; the check stopped waiting as soon as images were "complete", which a slow or failed download also counts as, so it now waits up to 15 seconds for GIFs that should show. Cause of the one failure not proven.
- Review (06/11/2026) of #20 and #21, fixed: settings text says "an edition" (GLOSSARY: "version" means a release number); the Notice bar link and the real-Thunderbird check now share one openShowGifsSteps function, so the check exercises the same call; the settings page scrolls to the steps after everything above them is built (it scrolled too early before); misplaced doc comments, test clean-up, and Oxford commas fixed. Left as judgement calls: the media hosts are still spelt out in the host-permission lists beside the new constants; adapters export a bare host and providers.js adds https://; the check reads page state through a long chain of Thunderbird internals; if the settings page is already open, the Notice link opens a second copy.
- 1.2.0 ready to release (06/11/2026). Maintainer steps: publish a GitHub Release v1.2.0 with dist/thundergif-1.2.0.xpi and dist/thundergif-live-1.2.0.xpi and the notes in docs/release-notes/v1.2.0.md; upload dist/thundergif-1.2.0.xpi (never the Live file) to the existing ATN listing, replacing description, privacy policy, and reviewer notes from docs/atn-listing.md; remove own 1.1.1 and install Thundergif Live; run docs/manual-checklist.md.

- 06/11/2026: maintainer uploaded thundergif-1.2.0.xpi to the existing ATN listing and replaced its description, privacy policy, and reviewer notes; awaiting ATN review. GitHub Release v1.2.0 published 06/11/2026 by the maintainer (Claude Code's auto mode blocks the agent from running `gh release create`): https://github.com/w1bbsy/thundergif/releases/tag/v1.2.0 , with thundergif-1.2.0.xpi and thundergif-live-1.2.0.xpi; #17 closed. Still to do: maintainer swaps own 1.1.1 for Thundergif Live and runs docs/manual-checklist.md; ATN review pending.

- 1.2.1 (06/11/2026): the maintainer's install of the ATN edition showed 12 server lines in the permission prompt. Host permissions trimmed to api.giphy.com, media.giphy.com, api.klipy.com, and static.klipy.com (the servers searched and inserted from). Proven in real Thunderbird 159: previews from servers without a permission (media1.giphy.com, static2.klipy.com) load on the add-on's pages, and both Editions pass the full check; the check now tests this every run. Removing permissions means no prompt for updating users. Decided the same day: users keep bringing their own Provider key (decision 5 stands); neither GIPHY nor KLIPY offers keyless search, and a shipped key would be public, shared, and revocable for everyone.

## Thunderbird 159 (29/10/2026)

- Maintainer updated to Thunderbird 159.0; Thundergif (capped at 158) is switched off with "incompatible with Thunderbird 159.0".
- Real-Thunderbird check on 159: with the cap raised to 159 everything passes, so the Experiment works unchanged. The check script needs MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1 on 159.
- Spec published as issue #16 (cap 159, version 1.1.1, check extended to report installed version and stale cap, one-step update command).
- Built 29/10/2026: 1.1.1 (cap 159.*). checks/thunderbird/check.py now sets MOZ_REMOTE_ALLOW_SYSTEM_ACCESS, reports installed version vs cap, and gives one of three verdicts; `npm run compat -- <major>` raises the cap, bumps the patch version and builds. Check passes on 159. Maintainer confirmed on 159; released on GitHub (v1.1.1) and uploaded to ATN replacing 1.1.0, 29/10/2026. #16 closed.

## addons.thunderbird.net (22/10/2026)

- Correction (29/10/2026): 1.0.2 was never approved. Uploading 1.1.0 while 1.0.2 was still unreviewed made ATN disable 1.0.2 (shown as "Disabled by Mozilla"). 1.1.0 is the only version in review (queue position 68 of 89 on 29/10/2026), so no version is approved yet and Thundergif is not in ATN search. Listing: https://addons.thunderbird.net/thunderbird/addon/thundergif/
- ATN's per-version Compatibility field (Edit this version) offers Max 159.*, but Thunderbird enforces the cap inside the add-on file, so it is not expected to fix installs (unconfirmed).
- Listing had an "imgur" tag; maintainer asked to remove it.

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
