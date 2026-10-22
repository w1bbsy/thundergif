# Thundergif

A Thunderbird add-on for finding a GIF on GIPHY or KLIPY and dropping it into the email you are writing. Click the GIF button on the compose toolbar, search or pick from what is trending, and click a GIF to insert it at your cursor.

It installs on Thunderbird 140 or later. So far it has only been tested on Thunderbird 158 on macOS.

## What it does

- Search GIPHY or KLIPY from the compose window. Results appear as you type (after a short pause), 24 at a time, with a More button for the next 24.
- Click a GIF, or press Enter on it, to insert it at the cursor. Cmd+Z takes it out again.
- Star GIFs to keep them in a Favourites tab. Each Provider has its own list.
- Choose a Rating (G, PG, PG-13 or R; PG by default) to limit what results can include.
- Use both Providers: save a key for each and switch between them in the Picker.
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

1. Download `thundergif-<version>.xpi` from this repository's [Releases](https://github.com/w1bbsy/thundergif/releases) page.
2. In Thunderbird, open Tools > Add-ons and Themes, click the gear icon, and choose Install Add-on From File.
3. Pick the downloaded file and confirm.

### About the "full, unrestricted access" warning

When you install, Thunderbird warns that the add-on will have "full, unrestricted access to Thunderbird, and your computer". That warning is worth explaining.

Thunderbird blocks remote images in an email you are writing unless you added them yourself with Insert > Image, paste or drag and drop. There is no ordinary add-on permission that lets an add-on's GIF through, so without help every GIF would show as a broken image while you write (your recipients would still see it).

Thundergif includes one small privileged module (a Thunderbird "Experiment") that does exactly what Insert > Image does: it tells the compose window it may show remote images. That is all it does. Thunderbird shows the same warning for any add-on that contains an Experiment, however small, and there is no way to narrow it. You can read the whole module in [`src/experiments/compose/implementation.js`](src/experiments/compose/implementation.js); it is about 29 lines. The reasoning is recorded in [docs/adr/0001](docs/adr/0001-experiment-to-show-linked-gifs-in-drafts.md).

If Thunderbird adds a proper way for add-ons to insert images, the Experiment and the warning can go.

## Settings

Open them from the Settings link at the bottom of the Picker, or from Add-ons and Themes > Thundergif > Options.

- **Provider keys.** Saving a new or changed key runs one test request and tells you whether it works.
- **Access.** If Thunderbird has not yet allowed the add-on to reach a Provider, an Allow access button appears here.
- **Provider to search.** Appears once both keys are saved.
- **Rating.** G, PG, PG-13 or R.

## How GIFs are sent

GIFs go into your email as links to GIPHY's or KLIPY's servers, not as attached copies. That keeps emails small, and it is what both Providers' terms ask for.

The trade-off: many email apps (including Thunderbird itself) hold back remote images until the reader allows them, so some recipients will see a placeholder until they click to show images. Gmail shows them straight away.

Thunderbird shows GIFs as still images while you write. That is how its editor treats all GIFs; your recipients see them animate.

## Privacy

- Your search terms and Provider key go to the Provider you are searching (GIPHY or KLIPY), and to nobody else. There is no Thundergif server.
- The GIF images in the Picker and in your email load from the Provider's servers, so the Provider sees those requests, as it would on its own website. Recipients who show the images also load them from the Provider.
- Your keys, Rating, chosen Provider and Favourites are stored only in Thunderbird on your computer. Favourites are stored as GIF IDs, never as images. Nothing is synced.
- Thundergif sends no analytics or usage reports of its own, including the optional usage "pingbacks" GIPHY offers to apps.

## Why not Tenor or Imgur?

- **Tenor:** Google shut down Tenor's public API on 30/06/2026 and stopped taking new apps in January 2026. KLIPY is the usual replacement.
- **Imgur:** Imgur has blocked users in the United Kingdom since 30/09/2025, and it is not currently accepting new API apps.

## Development

Plain JavaScript modules with no build step, so the source in `src/` is exactly what ships.

```bash
npm install
npm test
```

- `npm test` runs the automated tests: the Picker and settings page in a simulated browser with Thunderbird and the network faked, using trimmed real Provider responses.
- `npm run typecheck` checks types (JSDoc).
- `npm run build` packages `src/` as `dist/thundergif-<version>.xpi`.
- `checks/thunderbird/check.py` starts a throwaway, headless Thunderbird with an empty profile, installs a check build and confirms an inserted GIF really shows in a draft and that plain-text drafts get the link. Run it before a release and after Thunderbird updates (`pip install -r checks/thunderbird/requirements.txt` first).
- [docs/manual-checklist.md](docs/manual-checklist.md) lists the checks to do by hand in Thunderbird before a release.

Design notes live in [docs/spec.md](docs/spec.md), [docs/adr/](docs/adr/) and [GLOSSARY.md](GLOSSARY.md).

## Licence

MIT. See [LICENSE](LICENSE). GIPHY and KLIPY are trademarks of their owners; Thundergif is not affiliated with them or with Thunderbird.
