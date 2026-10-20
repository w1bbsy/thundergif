# Thundergif v1 - Spec

Status: ready-for-agent (local file; move to GitHub Issues once the repo exists and an issue tracker is configured)
Date: 20/10/2026
Vocabulary: see GLOSSARY.md. Decisions log: see Project Context.md.

## Problem Statement

Someone writing an email in Thunderbird on a Mac who wants to add a GIF has to leave Thunderbird, find the GIF on a website, copy it or its link, come back and paste it, and then hope it displays properly. There is no way to search for a GIF from inside the compose window. Tenor, the service many GIF tools relied on, shut its public API on 30/06/2026, so older approaches no longer work.

## Solution

Thundergif is a Thunderbird add-on that puts a GIF button on the compose window toolbar. Clicking it opens the Picker: the active Provider's trending GIFs appear straight away, a search box finds more, and one click inserts the chosen GIF at the cursor. The user supplies their own Provider key for KLIPY, GIPHY, or both, sets the Rating, and can star GIFs as Favourites to find them again. GIFs are inserted as links to the Provider's servers, as both Providers' terms require, rather than copied into the email. The add-on is free, MIT-licensed, and distributed as a file on GitHub Releases.

## User Stories

### Setting up

1. As a new user, I want the Picker to tell me I need to set up a Provider when I have no Provider key, so that I know why no GIFs appear.
2. As a new user, I want a link from the Picker to the settings page, so that I do not have to hunt through the Add-ons Manager.
3. As a new user, I want the README to explain how to get a free KLIPY or GIPHY Provider key, so that I can set the add-on up without prior developer experience.
4. As a user, I want to enter a Provider key for KLIPY, so that I can search KLIPY.
5. As a user, I want to enter a Provider key for GIPHY, so that I can search GIPHY.
6. As a user, I want to store Provider keys for both Providers at once, so that I can switch between them without re-entering keys.
7. As a user, I want the add-on to run one test search when I save a Provider key, so that I know immediately whether the key works.
8. As a user, I want to see "Saved, working" when the key is accepted, so that I can carry on with confidence.
9. As a user, I want to see "Key rejected" when the key is wrong, so that I can correct it before I need it mid-email.
10. As a user, I want to be told if the test search failed for a reason other than a bad key (no connection, rate limit), so that I do not wrongly assume my key is broken.
11. As a user, I want to remove a Provider key, so that I can stop using a Provider.
12. As a user, I want to choose which Provider is active, so that the Picker searches the one I prefer.
13. As a user with only one Provider key, I want that Provider to become active automatically, so that I do not have to make a pointless choice.
14. As a user, I want my Provider keys stored only on my Mac, so that they are not sent anywhere except to the Provider they belong to.
15. As a privacy-conscious user, I want the README to state exactly what is sent to each Provider (search terms, the Provider key, Favourite IDs), so that I can judge whether I am comfortable using it.

### Rating

16. As a user, I want to choose a Rating of G, PG, PG-13, or R, so that results suit the emails I am writing.
17. As a user, I want the Rating to default to PG, so that I am unlikely to see unsuitable GIFs before I have changed anything.
18. As a user, I want the same Rating to apply whichever Provider is active, so that switching Providers does not quietly loosen what I see.
19. As a user, I want the Rating to apply to trending GIFs as well as search results, so that nothing slips through before I type.

### Opening the Picker

20. As a user composing an HTML email, I want a GIF button on the compose window toolbar, so that the Picker is one click away.
21. As a user, I want the Picker to open as a panel attached to that button, so that I stay in the email I am writing.
22. As a user, I want the Picker to show the active Provider's trending GIFs when it opens, so that I can pick something without typing.
23. As a user, I want the search box focused when the Picker opens, so that I can start typing immediately.
24. As a user, I want the Picker to show which Provider is active, so that I know where results come from.
25. As a user with two Provider keys, I want to switch Provider from inside the Picker, so that I can try the other one without opening settings.
26. As a user with one Provider key, I want no Provider switch shown, so that the Picker stays uncluttered.

### Searching

27. As a user, I want to type a search term and get matching GIFs, so that I can find the one I have in mind.
28. As a user, I want 24 results per search, so that there is a good choice without flooding the screen.
29. As a user, I want a "More" button that loads the next 24 results, so that I can keep looking when the first set is not right.
30. As a user, I want "More" to add to the grid rather than replace it, so that I do not lose GIFs I was considering.
31. As a user, I want "More" hidden when there are no further results, so that I do not press a button that does nothing.
32. As a user, I want a clear message when a search finds nothing, so that I know to try different words.
33. As a user, I want results shown as small previews, so that the grid loads quickly.
34. As a user, I want KLIPY results shown in the order KLIPY returns them, so that the add-on respects KLIPY's terms.
35. As a user, I want the search box to read "Search KLIPY" when KLIPY is active, so that the add-on meets KLIPY's attribution requirement.
36. As a user, I want "Powered By GIPHY" shown when GIPHY is active, so that the add-on meets GIPHY's attribution requirement.
37. As a user, I want a plain message when I have hit the Provider's hourly limit, so that I understand why searches have stopped working and when to try again.
38. As a user, I want a plain message when the Provider cannot be reached, so that I know it is a connection problem and not the add-on.
39. As a user, I want a plain message if my Provider key stops working, with a link to settings, so that I can fix it.
40. As a user using the keyboard, I want to move through results and insert one with the keyboard, so that I do not have to reach for the mouse.

### Inserting

41. As a user, I want clicking a GIF to insert it at my cursor in the email, so that it lands where I want it.
42. As a user, I want the Picker to close after inserting, so that I can carry on typing.
43. As a user, I want the inserted GIF to be the medium size (about 480px wide, normally under 2MB), so that it looks good without bloating the email.
44. As a user, I want the inserted GIF to stay a link to the Provider when I send, so that the email stays small and the add-on respects the Provider's terms.
45. As a user, I want the inserted GIF to carry a short text description, so that recipients who block images still see what it was meant to be.
46. As a user, I want to be able to undo an insertion with the normal undo command, so that a mis-click is easy to fix.
47. As a user writing a plain-text email, I want the GIF's web link pasted at the cursor instead, so that I can still share it.
48. As a user writing a plain-text email, I want a one-line note in the Picker explaining that a link will be pasted, so that I am not surprised.
49. As a user, I want the README to explain that some recipients will see a blocked image until they allow remote content, so that I understand the trade-off.

### Favourites

50. As a user, I want to star a GIF in the Picker, so that I can find it again quickly.
51. As a user, I want to unstar a Favourite, so that my list stays useful.
52. As a user, I want a Favourites tab in the Picker, so that I can browse what I have starred.
53. As a user, I want to insert a Favourite exactly as I would a search result, so that it behaves the same.
54. As a user, I want Favourites kept separately for each Provider, so that each list works with the Provider it came from.
55. As a user, I want the Favourites tab to show the active Provider's list, so that what I see matches what I can insert.
56. As a user, I want starred GIFs to show as starred in search results, so that I can tell what I have already saved.
57. As a user, I want a helpful message when I have no Favourites yet, so that I know how to add some.
58. As a user, I want my Favourites to survive closing and reopening Thunderbird, so that they are worth building up.
59. As a user, I want Favourites the Provider has removed to drop out quietly, so that the tab does not show broken tiles.
60. As a user, I want my Favourites kept only on my Mac, so that no account or sync is involved.

### Installing and distributing

61. As a user, I want to download a single file from GitHub Releases and install it through the Add-ons Manager, so that installation is simple.
62. As a user on Thunderbird 140 or later, I want the add-on to install and work, so that I am not forced onto the newest release.
63. As a Mac user on Thunderbird 158, I want everything to look and behave correctly, so that the main platform is fully supported.
64. As a user, I want the README to explain why Tenor and Imgur are not supported, so that I do not wait for them.
65. As the maintainer, I want the code to follow addons.thunderbird.net review rules from the start, so that publishing there later needs no rework.
66. As the maintainer, I want no Provider key in the repository or the release file, so that publishing the code exposes nothing and costs me nothing.

## Implementation Decisions

- **Platform.** Thunderbird MailExtension, Manifest V3. Minimum Thunderbird 140; primary target Thunderbird 158 on Apple Silicon Mac.
- **Entry point.** A compose action (compose window toolbar button) whose popup is the Picker.
- **Modules.**
  - *Provider adapters*, one each for KLIPY and GIPHY, behind one shared interface: fetch trending, search with a page offset, look up GIFs by ID, and validate a key. Each takes a Provider key and a Rating and returns GIFs in a common shape: ID, a small preview, the medium insert version with width and height, a text description, and a flag for whether more results exist. The adapter is the only place that knows a Provider's URLs, parameter names, and response layout.
  - *Rating translation*, inside each adapter. GIPHY takes the Rating directly (g, pg, pg-13, r). KLIPY takes a content filter: R to off, PG-13 to low, PG to medium, G to high. This mapping comes from GIPHY's Tenor migration notes, not from KLIPY, and must be checked against real KLIPY results.
  - *Settings store*, holding Provider keys, the active Provider, and the Rating in the add-on's local storage. Local storage only; sync storage is not used.
  - *Favourites store*, holding one ordered list of GIF IDs per Provider (GIPHY id, KLIPY slug) in local storage. Media URLs are never stored. The Favourites tab re-fetches by ID through the adapter (GIPHY accepts up to 100 IDs per call; KLIPY's items endpoint takes comma-separated slugs).
  - *Picker*, the popup UI: Provider indicator and switch, search box, results grid, More button, Favourites tab, star toggles, attribution, and the messages listed in the user stories.
  - *Settings page*, the add-on options page: key fields per Provider with the save-time test search, active Provider choice, and Rating choice.
  - *Inserter*, which takes a chosen GIF and asks the compose window to place it. In HTML mode it inserts an image at the cursor via a compose script, built with DOM methods (never raw HTML from a Provider), carrying the description as alt text and the attribute that tells Thunderbird not to embed remote images on send. In plain-text mode it inserts the GIF's web link as text. It checks the compose window's plain-text flag first.
- **Requests.** All Provider requests go straight from the add-on to the Provider; there is no proxy or server. Host permissions cover the GIPHY and KLIPY API and media hosts and nothing else. Before relying on host permissions, check they are still granted, because the user can revoke them.
- **Paging.** 24 results per page. "More" requests the next offset and appends.
- **Insert size.** GIPHY's downsized version; KLIPY's md version.
- **Key validation.** Saving a key runs one search through the adapter. An authentication failure means "Key rejected"; any other failure is reported as itself, not as a bad key.
- **Attribution.** "Powered By GIPHY" visible while GIPHY is active. The search placeholder reads "Search KLIPY" while KLIPY is active. KLIPY results are never reordered or filtered by the add-on.
- **No analytics.** GIPHY pingbacks are not sent. No telemetry of any kind.
- **Review-ready code.** No remote code or CSS, no minified or obfuscated source, and no Provider data placed into HTML unsanitised.
- **Distribution.** Unsigned `.xpi` attached to GitHub Releases. MIT licence.

## Testing Decisions

- **What a good test is.** Tests check behaviour a user can observe, and what crosses the add-on's edges: what is on screen, which requests went out and with what parameters, what was stored, and what was handed to the compose window. They do not reach into internal functions or data structures, so the internals can change without rewriting tests.
- **One seam.** The Picker and the settings page are loaded in a simulated browser, with the network and Thunderbird's add-on API (storage, compose details, compose scripting, permissions) replaced by fakes. Tests act as the user (type, click More, star, switch Provider, change Rating, save a key) and assert on the screen, the outgoing requests, storage, and the insertion request. This one seam covers the Provider adapters, Rating translation, paging, Favourites, key validation, attribution, plain-text handling, and error messages, with no separate adapter tests.
- **Fake Provider responses** are recorded samples of real GIPHY and KLIPY responses, trimmed down, so that the tests check the real response layout.
- **Outside the seam: manual checklist in Thunderbird 158 on Mac.** The checklist covers:
  - the GIF lands at the cursor in the real compose editor and can be undone;
  - the raw source of a sent message shows a remote image link and no embedded copy;
  - the unsigned `.xpi` installs on a release build;
  - the popup looks right on a Retina screen;
  - KLIPY's content filter mapping gives sensible results at each Rating;
  - the add-on installs and works on Thunderbird 140 ESR.
- **Prior art.** The Jest webapp tests in the welcomebot plugin elsewhere in this folder, and the Jest gotchas recorded from that build.

## Out of Scope

- Tenor (public API shut down 30/06/2026) and Imgur (blocked in the UK since 30/09/2025; new app registration closed).
- Signing in to a Provider account, or reading account favourites, uploads, or history. Neither Provider offers this to add-ons.
- Mixing results from more than one Provider.
- Embedding GIFs into the email as attachments.
- A setting for the inserted size.
- Stickers, clips, emoji, or other media types.
- GIPHY pingbacks and any other analytics.
- Syncing settings or Favourites between devices.
- Publishing on addons.thunderbird.net (the code is written to allow it later).
- Testing on Windows or Linux.
- Shipping a shared Provider key.

## Further Notes

- Free Provider keys allow 100 requests an hour on both GIPHY and KLIPY. Each Picker open (trending), search, More press, Favourites view, and key save costs one request.
- Some things are unconfirmed from the docs and need checking during the build:
  - that inserting at the cursor through a compose script works in the current editor;
  - that the do-not-embed attribute is still honoured;
  - that unsigned add-ons install on current release builds;
  - KLIPY's default content filter value;
  - whether GIPHY's terms object to storing GIF IDs locally (it looks unlikely, but they do not address it).
- Main sources: GIPHY API docs (https://developers.giphy.com/docs/api/), KLIPY docs (https://docs.klipy.com/getting-started), Thunderbird WebExtension API docs (https://webextension-api.thunderbird.net/en/mv3/), Tenor notice (https://developers.google.com/tenor), Imgur UK notice (https://help.imgur.com/hc/en-us/articles/41592665292443-Imgur-access-in-the-United-Kingdom).
