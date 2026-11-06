# Thundergif

A Thunderbird add-on for finding a GIF on GIPHY or KLIPY and dropping it into the email you are writing. Click the GIF button on the compose toolbar, search or pick from what is trending, and click a GIF to insert it at your cursor.

It runs on Thunderbird 140 and later, and so far has only been tested on Thunderbird 158 and 159 on macOS. It comes in two editions, which do the same things apart from one.

## Which edition?

| | Thundergif | Thundergif Live |
|---|---|---|
| Where to get it | [addons.thunderbird.net](https://addons.thunderbird.net/thunderbird/addon/thundergif/), or search in Add-ons and Themes | `thundergif-live-<version>.xpi` from [Releases](https://github.com/w1bbsy/thundergif/releases) |
| GIFs while you write | A blank box, unless you allow two addresses in Thunderbird's settings (the add-on's settings page shows how) | Shown straight away |
| What your recipients see | The GIF | The GIF |
| Install warning | None | "Full, unrestricted access" ([why](#about-the-full-unrestricted-access-warning)) |
| Updates | Automatic | By hand, from Releases |
| New Thunderbird versions | Keeps working | Needs an update for each new major version |

Not sure? Choose Thundergif. Choose Thundergif Live if you want GIFs to show while you write without changing any Thunderbird settings, and you are happy to update it by hand.

Why two? addons.thunderbird.net is not accepting new add-ons that contain a Thunderbird Experiment until at least 2027, and showing GIFs while you write needs one. The reasoning is in [docs/adr/0002](docs/adr/0002-two-editions-for-atn.md).

You can install both, but you will then have two GIF buttons. They keep separate keys, settings, and Favourites.

## What it does

- Search GIPHY or KLIPY from the compose window. Results appear as you type (after a short pause), 24 at a time, with a More button for the next 24.
- Click a GIF, or press Enter on it, to insert it at the cursor. Cmd+Z takes it out again.
- Star GIFs to keep them in a Favourites tab. Each Provider has its own list. These are Thundergif's own Favourites: GIFs you have saved in your GIPHY or KLIPY account cannot be brought in, because neither offers apps a way to read them.
- Choose a Rating (G, PG, PG-13 or R; PG by default) to limit what results can include.
- Use both Providers: save a key for each and switch between them in the Picker. Your search carries over when you switch.
- Writing in plain text? The Picker pastes the GIF's link instead, since plain-text emails cannot hold images.
- Keyboard: the down arrow moves from the search box into the results, the arrow keys move between GIFs, Enter inserts and Escape closes.

## Getting a Provider key

Thundergif ships with no key of its own. You need a free developer key from GIPHY, KLIPY, or both. It takes a few minutes and costs nothing.

**GIPHY**

1. Go to [developers.giphy.com](https://developers.giphy.com/) and sign in or create an account.
2. Choose Create an App, pick API (not SDK), and give it a name and description.
3. Copy the API key it shows you.

**KLIPY**

1. Go to KLIPY's [Partner Panel](https://partner.klipy.com/) and sign up.
2. Open API Keys and create a key for your platform.
3. Copy the key.

Free keys allow about 100 requests an hour. Each time the Picker opens, each search, each press of More and each look at Favourites uses one. That is plenty for normal email, but you may see an "hourly limit" message if you browse a lot. Both Providers offer higher limits for apps they approve.

## Installing

**Thundergif:** install it from [addons.thunderbird.net](https://addons.thunderbird.net/thunderbird/addon/thundergif/), or search for Thundergif in Thunderbird's Add-ons and Themes. Updates then arrive automatically.

**Thundergif Live:**

1. Download `thundergif-live-<version>.xpi` from this repository's [Releases](https://github.com/w1bbsy/thundergif/releases) page.
2. In Thunderbird, open Tools > Add-ons and Themes, click the gear icon, and choose Install Add-on From File.
3. Pick the downloaded file and confirm.

The Releases page also carries `thundergif-<version>.xpi`, the same file as on addons.thunderbird.net, for anyone who prefers to install it by hand.

**Moving from 1.1.1 or earlier:** remove the old version first (Add-ons and Themes > Thundergif > Remove), then install the edition you want. Removing it deletes your saved keys and Favourites, so copy your keys somewhere first. If you keep 1.1.1, Thunderbird may later update it to the plain Thundergif from addons.thunderbird.net.

### Showing GIFs while you write (Thundergif)

Thunderbird blocks images from other servers in an email you are writing, so in Thundergif a GIF shows as a blank box until you send it. Your recipients see the GIF either way. To see GIFs while writing, allow the two servers the GIFs come from:

1. In Thunderbird, open Settings > Privacy & Security.
2. Under Email content, click Exceptions.
3. Enter `https://media.giphy.com`, click Allow, then do the same for `https://static.klipy.com`, and click Save Changes.

Thundergif's settings page has the same steps with Copy buttons for the addresses. An exception also lets images from that server load in emails you receive.

### About the "full, unrestricted access" warning

This applies to Thundergif Live only. When you install it, Thunderbird warns that the add-on will have "full, unrestricted access to Thunderbird, and your computer". That warning is worth explaining.

Thunderbird blocks remote images in an email you are writing unless you added them yourself with Insert > Image, paste or drag and drop. There is no ordinary add-on permission that lets an add-on's GIF through, so without help every GIF would show as a broken image while you write (your recipients would still see it).

Thundergif Live includes one small privileged module (a Thunderbird "Experiment") that does exactly what Insert > Image does: it tells the compose window it may show remote images. That is all it does. Thunderbird shows the same warning for any add-on that contains an Experiment, however small, and there is no way to narrow it. You can read the whole module in [`src/experiments/compose/implementation.js`](src/experiments/compose/implementation.js); it is about 29 lines. The reasoning is recorded in [docs/adr/0001](docs/adr/0001-experiment-to-show-linked-gifs-in-drafts.md).

If Thunderbird adds a proper way for add-ons to insert images, the Experiment and the warning can go, and the two editions can become one again.

## Settings

Open them from the Settings link at the bottom of the Picker, or from Add-ons and Themes > Thundergif > Options.

- **Provider keys.** Saving a new or changed key runs one test request and tells you whether it works.
- **Access.** If Thunderbird has not yet allowed the add-on to reach a Provider, an Allow access button appears here.
- **Provider to search.** Appears once both keys are saved.
- **Rating.** G, PG, PG-13 or R.
- **Show GIFs while you write.** Thundergif only: the steps above, with Copy buttons for the two addresses.

## How GIFs are sent

GIFs go into your email as links to GIPHY's or KLIPY's servers, not as attached copies. That keeps emails small, and it is what both Providers' terms ask for.

The trade-off: many email apps (including Thunderbird itself) hold back remote images until the reader allows them, so some recipients will see a placeholder until they click to show images. Gmail shows them straight away.

In Thundergif, GIFs show as a blank box while you write unless you have allowed their servers (see above). Where they do show, Thunderbird shows GIFs as still images while you write. That is how its editor treats all GIFs; your recipients see them animate.

## Privacy

- Your search terms and Provider key go to the Provider you are searching (GIPHY or KLIPY), and to nobody else. There is no Thundergif server.
- The GIF images in the Picker and in your email load from the Provider's servers, so the Provider sees those requests, as it would on its own website. Recipients who show the images also load them from the Provider.
- Your keys, Rating, chosen Provider and Favourites are stored only in Thunderbird on your computer. Favourites are stored as GIF IDs, never as images. Nothing is synced.
- Thundergif sends no analytics or usage reports of its own, including the optional usage "pingbacks" GIPHY offers to apps.

## Why not Tenor or Imgur?

- **Tenor:** Google shut down Tenor's public API on 30/06/2026 and stopped taking new apps in January 2026. KLIPY is the usual replacement.
- **Imgur:** Imgur has blocked users in the United Kingdom since 30/09/2025, and it is not currently accepting new API apps.

## Development

Plain JavaScript modules with no bundling or minification, so the source in `src/` is what ships.

```bash
npm install
npm test
```

- `npm test` runs the automated tests: the Picker and settings page in a simulated browser with Thunderbird and the network faked, using trimmed real Provider responses.
- `npm run typecheck` checks types (JSDoc).
- `npm run build` packages both editions: `dist/thundergif-<version>.xpi` (the addons.thunderbird.net edition, without `src/experiments/`) and `dist/thundergif-live-<version>.xpi` (Thundergif Live). `src/manifest.json` is Thundergif's manifest; `editions/live.json` holds Thundergif Live's differences.
- **Each new Thunderbird release:** update Thunderbird, then run `checks/thunderbird/check.py`. It reports the installed version and Thundergif Live's cap. If the cap is too low it says so, tests with the cap raised, and tells you the next step, usually `npm run compat -- <version>` (for example `npm run compat -- 160`). That raises Thundergif Live's cap, bumps the patch version of both editions and builds both. Run the check again, then commit and publish the GitHub Release. Thundergif itself has no cap, so it needs no upload for this.
- `checks/thunderbird/check.py` starts a throwaway, headless Thunderbird with an empty profile and tests both editions. For each, it installs a check build and confirms an inserted GIF goes into a draft as a link (shown in Thundergif Live, blocked in Thundergif until its two servers are allowed) and that plain-text drafts get the link. For Thundergif it also opens the settings page as the Notice bar link does and clicks Copy. Run it before a release and after Thunderbird updates (`pip install -r checks/thunderbird/requirements.txt` first).
- [docs/manual-checklist.md](docs/manual-checklist.md) lists the checks to do by hand in Thunderbird before a release.

Design notes live in [docs/spec.md](docs/spec.md), [docs/adr/](docs/adr/) and [GLOSSARY.md](GLOSSARY.md).

## Support

Thundergif is free and always will be. If it brightens your emails, you can [buy me a beer](https://donate.stripe.com/dRm14m0RbfEqaMg3S0a3u00). The same link sits at the bottom of the add-on's settings page; it never pops up.

## Licence

MIT. See [LICENSE](LICENSE). GIPHY and KLIPY are trademarks of their owners; Thundergif is not affiliated with them or with Thunderbird.
