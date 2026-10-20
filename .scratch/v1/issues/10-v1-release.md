# 10: v1 release

**What to build:** Thundergif v1 is ready for others to install from GitHub Releases. The README tells a new user how to get a free KLIPY or GIPHY Provider key and install the add-on, states exactly what is sent to each Provider (search terms, Provider key, Favourite IDs) and that no analytics are sent, explains why Tenor and Imgur are not supported, and explains that some recipients see a blocked image until they allow remote content. The MIT licence is in place, the full manual checklist from the spec has been run, and a release `.xpi` is built. The maintainer publishes the GitHub Release themselves.

**Blocked by:** 01, 02, 03, 04, 05, 06, 07, 08, 09

**Status:** ready-for-agent

- [ ] README covers: what Thundergif does, getting a Provider key for KLIPY and GIPHY, installing the `.xpi`, settings, Favourites, Rating, privacy (what goes where; no analytics; nothing synced), why Tenor and Imgur are absent, the blocked-image trade-off, and the 100-requests-an-hour free limit
- [ ] MIT licence file present
- [ ] No Provider key anywhere in the repository or the built `.xpi`
- [ ] Code meets addons.thunderbird.net review rules: no remote code or CSS, no minified or obfuscated source, no unsanitised Provider data in HTML
- [ ] Full manual checklist run and results recorded on Thunderbird 158 (Apple Silicon Mac) and Thunderbird 140 ESR, including Retina popup appearance
- [ ] Release `.xpi` built with the version number set
- [ ] Release notes drafted for the maintainer to publish
