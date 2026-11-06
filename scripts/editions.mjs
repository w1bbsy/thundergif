// The two Editions (ADR 0002). src/manifest.json is the ATN edition: no Experiment and no cap.
// Thundergif Live is the same add-on plus the differences in editions/live.json (its own name,
// ID, button title, cap and the Experiment).
//
// Usage: node scripts/editions.mjs <atn|live> <empty-folder>
// Copies src/ into the folder as that Edition, ready to zip.
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
export const EDITIONS = ['atn', 'live'];
export const LIVE_DIFFERENCES = join(root, 'editions', 'live.json');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Objects merge key by key; anything else in `extra` replaces what is in `base`. */
function merge(base, extra) {
  const out = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    out[key] = isObject(value) && isObject(base[key]) ? merge(base[key], value) : value;
  }
  return out;
}

/** The manifest for an Edition. */
export function editionManifest(edition) {
  const base = readJson(join(root, 'src', 'manifest.json'));
  if (edition === 'atn') return base;
  if (edition === 'live') return merge(base, readJson(LIVE_DIFFERENCES));
  throw new Error(`Unknown Edition: ${edition}`);
}

/** Copies src/ into `folder` as the given Edition. */
export function stageEdition(edition, folder) {
  const manifest = editionManifest(edition);
  cpSync(join(root, 'src'), folder, {
    recursive: true,
    filter: (path) => !path.endsWith('.d.ts') && !path.endsWith('.DS_Store'),
  });
  // Only Thundergif Live carries the Experiment's code.
  if (!manifest.experiment_apis) rmSync(join(folder, 'experiments'), { recursive: true, force: true });
  writeFileSync(join(folder, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [edition, folder] = process.argv.slice(2);
  if (!EDITIONS.includes(edition) || !folder) {
    console.error('Usage: node scripts/editions.mjs <atn|live> <empty-folder>');
    process.exit(1);
  }
  stageEdition(edition, folder);
}
