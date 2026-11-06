# addons.thunderbird.net listing

Text to paste into the ATN submission form for Thundergif, the ATN edition (ADR 0002). From 1.2.0 the file to upload is `dist/thundergif-<version>.xpi`, which has no Experiment. Never upload `thundergif-live-<version>.xpi`. ATN does not allow external links in the description, so there are none below; links are fine in the notes to the reviewer.

For 1.2.0 the listing already exists, so only the description, privacy policy, and reviewer notes need replacing with the text below.

## Form fields, in the order ATN asks for them

| Field | Enter |
|---|---|
| Name | Thundergif |
| Add-on URL | Leave as `thundergif` |
| Summary | See below (125 of the 160 characters allowed) |
| This add-on is experimental | **Leave unticked.** This marks an add-on as not ready for general use. It has nothing to do with Experiment APIs (and this edition has none). |
| This add-on requires payment, non-free services or software, or additional hardware | **Leave unticked.** It needs a free GIPHY or KLIPY key, nothing paid. The description says a key is needed. |
| Categories (up to 2) | **Message Composition** only. None of the others fits. |
| Support email | Optional. Leave blank, or use an address you are happy to have shown publicly. |
| Support web site | https://github.com/w1bbsy/thundergif/issues |
| Licence | **MIT/X11 License** |
| This add-on has a Privacy Policy | **Tick it**, then paste the Privacy policy section below into the box. ATN requires the text itself, not a link. |
| Notes to Reviewer | Paste the Notes to the reviewer section below. Only you and reviewers see it. |

The Description goes in on a later page of the form, along with screenshots.

## Summary

Search GIPHY or KLIPY from the compose window and drop a GIF into your email. Uses your own free key; GIFs are sent as links.

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

While you write: Thunderbird blocks images from other servers in the email you are writing, so an inserted GIF shows as a blank box. Your recipients see the GIF. To see GIFs while writing too, allow two addresses in Thunderbird's remote-content exceptions; Thundergif's settings page gives the steps, with Copy buttons. A notice in the picker explains this the first time, and can be dismissed for good.

Thundergif is open source under the MIT licence. GIPHY and KLIPY are trademarks of their owners; Thundergif is not affiliated with them.

## Privacy policy

Thundergif does not run any server of its own and does not collect, store or share personal data.

When you use Thundergif:

- Your search terms, your Provider key, and requests for trending GIFs or for your Favourites are sent directly from Thunderbird to the Provider you are searching: GIPHY (api.giphy.com) or KLIPY (api.klipy.com). They are not sent anywhere else.
- GIF images load from that Provider's media servers, both in the picker and in your email. Recipients who choose to show the images also load them from the Provider.
- GIPHY's and KLIPY's own privacy policies apply to what they receive.

Stored on your computer only, in Thunderbird's add-on storage: your Provider keys, your chosen Provider, your Rating, your Favourites (stored as GIF IDs, never as images), and whether you have dismissed the notice about GIFs while writing. None of this is synced or sent to the add-on's author.

Thundergif sends no analytics, telemetry or usage reports, including the optional usage "pingbacks" GIPHY offers to apps.

The contents of your emails, your contacts and your account details are never read or sent anywhere.

## Notes to the reviewer

- This version has no Experiment API, following your reply of 05/11/2026. Earlier versions (1.1.0, 1.1.1) contained one; it has been removed from this edition entirely, along with `strict_max_version`.
- Source: https://github.com/w1bbsy/thundergif (MIT). The `.xpi` is built by `scripts/build.sh`: the `src/` folder copied as is, minus `src/experiments/` (used only by a separate GitHub edition) and type-declaration files. No bundling or minification.
- The settings page mentions, in one neutral sentence, that a separate edition called Thundergif Live, which shows GIFs while writing, is available from the project's GitHub page, and that it is not listed here because it needs extra permissions. Thundergif Live is the same code plus an Experiment; it is distributed only on GitHub, under its own add-on ID. The link opens in the default browser. If this conflicts with your policies, I will remove it.
- `compose/insert.js` mentions `browser.thundergifCompose`, the Experiment's API in Thundergif Live. It checks whether that API exists and calls it only if so; in this edition it never exists, so the call never runs. The linter warns about it as an unsupported API.
- Without an Experiment, Thunderbird blocks the inserted remote GIF in the draft. The add-on explains this in a dismissible notice and on its settings page, where it lists the two media servers it inserts from (`https://media.giphy.com`, `https://static.klipy.com`) for the user to add as remote-content exceptions themselves. The add-on never changes those exceptions. The Copy buttons use `navigator.clipboard.writeText` from the click, with no clipboard permission.
- `sensitiveDataUpload` is requested because search terms are sent to the hardcoded Provider APIs (GIPHY, KLIPY). The settings page lists what is sent.
- To test: get a free GIPHY key at developers.giphy.com (or KLIPY at partner.klipy.com), paste it into the add-on's settings, open a new message and click the GIF button.
- Inserted GIFs carry `moz-do-not-send="true"` so they are sent as remote links, as the Providers' terms require.
