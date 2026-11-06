# Manual release checklist

Run by hand before each release, on the newest Thunderbird (Apple Silicon Mac) and Thunderbird 140 ESR. Record the results on the release issue. Run `checks/thunderbird/check.py` first; it covers inserting into HTML and plain-text drafts, the exceptions and the Copy button automatically.

There are two editions (ADR 0002): Thundergif (`thundergif-<version>.xpi`, for addons.thunderbird.net) and Thundergif Live (`thundergif-live-<version>.xpi`, GitHub only). Run the Settings, Picker, Plain-text, and Sending sections on Thundergif Live, plus the Thundergif section on Thundergif. The rest of the code is shared.

## Install

- [ ] Thundergif installs from file with no "full, unrestricted access" warning, and Add-ons and Themes lists it as "Thundergif". The prompt lists four servers: api.giphy.com, media.giphy.com, api.klipy.com, and static.klipy.com.
- [ ] Thundergif Live installs from file; the install prompt shows the "full, unrestricted access" warning (expected, see README), and Add-ons and Themes lists it as "Thundergif Live".
- [ ] With both installed, the compose toolbar shows two GIF buttons; hovering shows "Insert a GIF" and "Insert a GIF (Thundergif Live)".
- [ ] Add-ons and Themes shows the bird icon for both.

## Settings

- [ ] A GIPHY key saves and shows "GIPHY: Saved, working".
- [ ] A KLIPY key saves and shows "KLIPY: Saved, working".
- [ ] A wrong key shows "Key rejected".
- [ ] If access is not yet allowed, Allow access buttons appear and work without restarting Thunderbird.
- [ ] With both keys, "Provider to search" appears.

## Picker (HTML email)

- [ ] The GIF button shows on the compose toolbar, clear in both light and dark themes, on a Retina screen.
- [ ] Trending GIFs appear; the search box has the cursor.
- [ ] Typing searches after a short pause; Enter and the search button search at once.
- [ ] More adds the next 24; emptying the box returns to trending.
- [ ] Thundergif Live: clicking a GIF inserts it at the cursor and it shows in the draft (as a still image); Cmd+Z removes it.
- [ ] "Powered By GIPHY" shows for GIPHY; "Search KLIPY" placeholder for KLIPY.
- [ ] Switching Provider reloads trending from the other one.
- [ ] Starring a GIF adds it to Favourites; unstarring removes it; Favourites survive restarting Thunderbird; each Provider has its own list.
- [ ] Keyboard: down arrow into results, arrows between GIFs, Enter inserts, Escape closes.
- [ ] Each Rating gives sensible results on both Providers.

## Thundergif (without Live)

- [ ] On a fresh install, the Picker shows the notice "GIFs show as a blank box while you write, but your recipients see them." above the results.
- [ ] Clicking a GIF inserts it at the cursor as a blank box; Cmd+Z removes it.
- [ ] "Show them while writing" opens a settings window in front of the compose window, showing the "Show GIFs while you write" steps.
- [ ] Following the steps (Settings > Privacy & Security > Email content > Exceptions) matches what Thunderbird shows; each Copy button pastes its address correctly into Address of web site.
- [ ] With both addresses allowed, a newly inserted GIF from each Provider shows in the draft.
- [ ] The Thundergif Live link opens the GitHub page in the default browser.
- [ ] Dismiss hides the notice in the Picker and on the settings page, and it stays hidden after restarting Thunderbird.
- [ ] Thundergif Live shows no notice and no "Show GIFs while you write" section.

## Plain-text email

- [ ] The Picker says it will paste a link; clicking a GIF types the link at the cursor.

## Sending

- [ ] Send a test email to yourself; View > Message Source shows the GIF as a linked image (`moz-do-not-send`) with no image attachment.
- [ ] The GIF shows for the recipient (for example in Gmail), from either edition.
