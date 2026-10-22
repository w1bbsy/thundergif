# addons.thunderbird.net listing

Text to paste into the ATN submission form for Thundergif. ATN does not allow external links in the description, so there are none below; links are fine in the notes to the reviewer.

## Name

Thundergif

## Summary

Search GIPHY or KLIPY from the compose window and drop a GIF into your email. Bring your own free key; GIFs are sent as links, Favourites stay on your computer.

## Category

Message Composition (or the closest match offered).

## Description

Thundergif adds a GIF button to the compose toolbar. Click it to see what is trending, search as you type, and click a GIF to put it at your cursor.

What it does:

- Search GIPHY or KLIPY, 24 results at a time, with a More button for the next 24.
- Insert a GIF at the cursor with a click or the Enter key. Cmd/Ctrl+Z takes it out again.
- Star GIFs to keep them in a Favourites tab, with a separate list for each Provider.
- Choose a Rating (G, PG, PG-13 or R) to limit what results can include.
- Use both Providers and switch between them in the picker.
- In plain-text emails it pastes the GIF's link instead, since plain text cannot hold images.
- Works from the keyboard: arrow keys move between GIFs, Enter inserts, Escape closes.

Getting started: Thundergif has no key of its own. Get a free developer key from GIPHY's developer site or KLIPY's Partner Panel, then paste it into Thundergif's settings. Saving a key checks that it works. Free keys allow about 100 requests an hour.

How GIFs are sent: as links to the Provider's servers, not as attachments. Emails stay small, and this is what GIPHY's and KLIPY's terms ask for. Some recipients' email apps hold back remote images until they choose to show them.

About the install warning: Thunderbird says this add-on has full, unrestricted access. That comes from one small module (about 30 lines) that does what Insert > Image does: it lets the compose window show the GIF you just inserted. Without it, every GIF would appear as a broken image while you write. There is currently no standard add-on permission for this, and Thunderbird shows the same warning for any add-on that contains such a module.

Thundergif is open source under the MIT licence. GIPHY and KLIPY are trademarks of their owners; Thundergif is not affiliated with them.

## Privacy policy

Thundergif does not run any server of its own and does not collect, store or share personal data.

When you use Thundergif:

- Your search terms, your Provider key, and requests for trending GIFs or for your Favourites are sent directly from Thunderbird to the Provider you are searching: GIPHY (api.giphy.com) or KLIPY (api.klipy.com). They are not sent anywhere else.
- GIF images load from that Provider's media servers, both in the picker and in your email. Recipients who choose to show the images also load them from the Provider.
- GIPHY's and KLIPY's own privacy policies apply to what they receive.

Stored on your computer only, in Thunderbird's add-on storage: your Provider keys, your chosen Provider, your Rating, and your Favourites (stored as GIF IDs, never as images). None of this is synced or sent to the add-on's author.

Thundergif sends no analytics, telemetry or usage reports, including the optional usage "pingbacks" GIPHY offers to apps.

The contents of your emails, your contacts and your account details are never read or sent anywhere.

## Notes to the reviewer

- Source: https://github.com/w1bbsy/thundergif (MIT). The `.xpi` is the `src/` folder zipped, with no build step, bundling or minification.
- Experiment `thundergifCompose` (`experiments/compose/implementation.js`): a single function, `allowRemoteImages(tabId)`, that sets `gMsgCompose.allowRemoteContent = true` for a compose tab before the add-on inserts a remote GIF, mirroring what Insert > Image (`EdImageProps.js`) and paste or drop (`onPasteOrDrop` in `MsgComposeCommands.js`) do. Without it, `nsMsgContentPolicy::ComposeShouldLoad` blocks the image in the draft. No WebExtension API can set this flag. The reasoning, alternatives considered and tests are in `docs/adr/0001-experiment-to-show-linked-gifs-in-drafts.md`. A feature request for a proper API is planned, after which the Experiment can be dropped.
- The Experiment clears the startup cache in `onShutdown` for non-shutdown unloads, and `strict_max_version` is set to the newest tested release (158.*); it will be raised after testing each new release.
- `sensitiveDataUpload` is requested because search terms are sent to the hardcoded Provider APIs (GIPHY, KLIPY). The settings page lists what is sent.
- To test: get a free GIPHY key at developers.giphy.com (or KLIPY at partner.klipy.com), paste it into the add-on's settings, open a new message and click the GIF button.
- Inserted GIFs carry `moz-do-not-send="true"` so they are sent as remote links, as the Providers' terms require.
