# Manual release checklist

Run by hand before each release, on Thunderbird 158 (Apple Silicon Mac) and Thunderbird 140 ESR. Record the results on the release issue. Run `checks/thunderbird/check.py` first; it covers inserting into HTML and plain-text drafts automatically.

## Install

- [ ] The `.xpi` installs from file; the install prompt shows the bird icon and the "full, unrestricted access" warning (expected, see README).
- [ ] Add-ons and Themes shows the bird icon.

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
- [ ] Clicking a GIF inserts it at the cursor and it shows in the draft (as a still image); Cmd+Z removes it.
- [ ] "Powered By GIPHY" shows for GIPHY; "Search KLIPY" placeholder for KLIPY.
- [ ] Switching Provider reloads trending from the other one.
- [ ] Starring a GIF adds it to Favourites; unstarring removes it; Favourites survive restarting Thunderbird; each Provider has its own list.
- [ ] Keyboard: down arrow into results, arrows between GIFs, Enter inserts, Escape closes.
- [ ] Each Rating gives sensible results on both Providers.

## Plain-text email

- [ ] The Picker says it will paste a link; clicking a GIF types the link at the cursor.

## Sending

- [ ] Send a test email to yourself; View > Message Source shows the GIF as a linked image (`moz-do-not-send`) with no image attachment.
- [ ] The GIF shows for the recipient (for example in Gmail).
