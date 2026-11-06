# Two editions: a plain one for ATN and Thundergif Live on GitHub

addons.thunderbird.net (ATN) rejected Thundergif 1.1.1 because it is not accepting new add-ons with Experiment APIs, and the reviewers told us on 05/11/2026 that the pause runs until the next ESR in 2027, possibly longer. Without the Experiment, an inserted GIF shows as a blank box in the draft (recipients still see it; see ADR 0001). We build two Editions from one source tree: the ATN edition ("Thundergif", the existing ID and listing, no Experiment, no version cap) and Thundergif Live (GitHub only, a new ID, the Experiment and its cap). The add-on decides at run time whether the Experiment is present, so there is no edition-specific code to keep in step. The ATN edition shows a dismissible Notice bar from the start and a settings section listing the GIF server addresses to add as remote-content exceptions, with a neutral link to Thundergif Live declared to the reviewers.

## Considered options

- **Wait for the pause to end.** Rejected: no date, and Thundergif would stay off ATN for at least a year.
- **Drop the Experiment everywhere.** Rejected: GitHub users would lose GIFs showing while writing for no gain.
- **Give the ATN edition a new ID and listing.** Rejected: the existing listing already holds the text, privacy policy and review history. Thunderbird appears to match ATN updates by add-on ID (not verified), so Live takes the new ID to stop ATN replacing it with the plain edition.
- **Show a hint only after a GIF fails to load.** Rejected by the maintainer: every user would see one confusing failure first.
- **Separate branch or repo per Edition.** Rejected: doubles every fix and the two drift apart.

## Consequences

- Existing 1.1.1 installs must be removed and replaced by hand (1.2.0 release notes say so).
- The monthly cap-raising routine applies to Thundergif Live only.
- If a WebExtension API for inserting remote images ever ships (issue #12), both Editions can merge back into one.
