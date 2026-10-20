# 08: Plain-text emails

**What to build:** When the compose window is in plain-text mode, the Picker shows a one-line note that a link will be pasted, and clicking a GIF pastes the GIF's web link at the cursor instead of inserting an image.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [ ] Picker detects plain-text compose mode before inserting
- [ ] In plain-text mode a one-line note explains a link will be pasted
- [ ] Clicking a GIF pastes its web link as text at the cursor
- [ ] HTML mode behaviour is unchanged
- [ ] Automated tests through the one seam cover both modes
- [ ] Manual check in Thunderbird 158, recorded in the ticket: link lands at the cursor in a real plain-text email
