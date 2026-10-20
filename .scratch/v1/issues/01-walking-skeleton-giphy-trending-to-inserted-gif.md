# 01: Walking skeleton: GIPHY trending to inserted GIF

**What to build:** A user installs Thundergif, opens its settings page, enters a GIPHY Provider key, and saves it. In an HTML compose window they click the GIF button on the toolbar; the Picker opens showing GIPHY's trending GIFs as small previews, with "Powered By GIPHY" visible. Clicking a GIF inserts the medium version at the cursor as a link to GIPHY (not an embedded copy), with its description as alt text, and the Picker closes. This ticket also stands up the add-on shell (Manifest V3, minimum Thunderbird 140) and the single test seam from the spec: the Picker and settings page loaded in a simulated browser with the network and Thunderbird's add-on API faked, using trimmed recorded GIPHY responses. See docs/spec.md for the full design.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Settings page has a GIPHY Provider key field; the key is saved to local storage only
- [ ] Compose window toolbar shows a GIF button that opens the Picker
- [ ] Picker shows 24 GIPHY trending GIFs as small previews when it opens
- [ ] "Powered By GIPHY" is visible in the Picker
- [ ] Clicking a GIF asks the compose window to insert the medium (downsized) version at the cursor, built with DOM methods, with alt text and the do-not-embed-on-send attribute
- [ ] Picker closes after inserting
- [ ] Host permissions cover only GIPHY API and media hosts; the Picker checks they are granted before fetching
- [ ] Automated tests through the one seam cover: trending shown, request parameters sent to GIPHY, insertion request contents
- [ ] Manual check in Thunderbird 158 on Mac, recorded in the ticket: unsigned `.xpi` installs; GIF lands at the cursor and can be undone; raw source of a sent message shows a remote image link and no embedded copy
- [ ] If any manual check fails, stop and report before later tickets build on it
