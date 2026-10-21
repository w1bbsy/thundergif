# Use a Thunderbird Experiment to show linked GIFs in drafts

Thunderbird blocks remote images in a draft unless the compose window's `allowRemoteContent` flag is on, or the image's server is in the user's remote content exceptions. Only Thunderbird's own actions (Insert > Image, paste, drop, signatures, cloud attachments) turn the flag on, and no WebExtension API can. So a GIF inserted by an ordinary add-on appears as a broken image while writing, although it is sent as a link and shows for recipients. We chose a small Experiment API (`thundergifCompose.allowRemoteImages`) that turns the flag on for the add-on's compose tab, exactly as Insert > Image does, so GIFs show with no setup.

## Considered Options

- **User adds remote content exceptions** for each Provider's media servers (seven for GIPHY alone). Keeps the add-on unprivileged, but every user must do tedious setup, and those servers' images would also load in received mail.
- **Leave the draft broken** and document it. Recipients are unaffected, but the writer cannot see what they inserted.
- **Fake a paste event** to make Thunderbird flip the flag. Tested and rejected: Thunderbird ignores untrusted events, and it would mean working around a privacy control.

## Consequences

- The install prompt warns that the add-on has full, unrestricted access, and addons.thunderbird.net reviews Experiments more strictly.
- The Experiment depends on Thunderbird internals (`gMsgCompose.allowRemoteContent`) and can break on a Thunderbird update. `checks/thunderbird/check.py` drives a real, headless Thunderbird and fails if an inserted GIF does not load; run it before each release and after Thunderbird updates.
- Firefox's add-on linter reports `experiment_apis` as a privileged field. That is expected for Thunderbird add-ons.
- Worth reporting to Thunderbird: an API to insert remote images into a compose tab would let this Experiment go.
