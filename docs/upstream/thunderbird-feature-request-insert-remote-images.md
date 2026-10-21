# Draft feature request for Thunderbird

For the maintainer to post on Bugzilla (product: Thunderbird, component: Add-Ons: Extensions API). Nothing here has been posted.

---

**Title:** Allow WebExtensions to insert remote images into a compose window that display in the draft

**Summary**

An add-on that inserts a remote image into the compose editor (for example a GIF picker inserting `<img src="https://media.giphy.com/...">` through `scripting.executeScript` or `compose.setComposeDetails`) cannot get the image to display in the draft. The image is sent correctly and displays for recipients, but the writer sees a broken image while composing.

**Why it happens**

`nsMsgContentPolicy::ComposeShouldLoad` rejects remote image loads in the compose window unless `nsIMsgCompose.allowRemoteContent` is true (or the image's site is in the user's remote content exceptions). Only Thunderbird's own UI sets that flag: `EdImageProps.js` (Insert > Image), `onPasteOrDrop` in `MsgComposeCommands.js`, cloud attachments, and signatures in `nsMsgCompose.cpp`. No WebExtension API can set it, and synthetic paste events from a compose script are, rightly, ignored.

**Steps to reproduce**

1. Install an add-on that, from a compose action popup, runs a compose script calling `document.execCommand('insertImage', false, 'https://media1.giphy.com/media/.../giphy.gif')`.
2. Open a new HTML message and use the add-on.
3. The image appears as a broken image with its alt text. Inserting the same URL with Insert > Image displays it. Reading the code, the flag then stays on for that window, so the add-on's later images should display too (not separately tested).

**Current workaround**

An Experiment API that sets `gMsgCompose.allowRemoteContent = true` for the add-on's compose tab before inserting. It works, but it means the add-on must declare an Experiment, so users see the "full, unrestricted access" install warning for what is otherwise a simple add-on.

**Request**

Either of:

- a `compose` API method to insert an image (by URL) at the cursor, with an option to keep it as a remote link (`moz-do-not-send`), treated like Insert > Image; or
- a permission-gated way to let remote content load in a compose tab the add-on controls, for example `compose.allowRemoteContent(tabId)`.

**Environment:** Thunderbird 158.0 on macOS (Apple Silicon); also seen in an automated headless check on the same build.

**Reference implementation:** https://github.com/w1bbsy/thundergif (see `docs/adr/0001` and `src/experiments/compose/`).
