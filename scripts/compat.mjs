// One-step compatibility update for a new Thunderbird release: raises the add-on's cap
// (strict_max_version) to the given major version, bumps the patch version, and builds the .xpi.
// Does not commit, tag, publish or upload.
//
// Usage: npm run compat -- 159
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const major = Number(process.argv[2]);
if (!Number.isInteger(major) || major < 140) {
  console.error('Give the new Thunderbird major version, e.g. npm run compat -- 159');
  process.exit(1);
}

const manifestPath = new URL('../src/manifest.json', import.meta.url);
const packagePath = new URL('../package.json', import.meta.url);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

const gecko = manifest.browser_specific_settings.gecko;
const currentCap = Number(String(gecko.strict_max_version).split('.')[0]);
if (major <= currentCap) {
  console.error(`The cap is already ${gecko.strict_max_version}; nothing to do.`);
  process.exit(1);
}

const [x, y, z] = manifest.version.split('.').map(Number);
const version = `${x}.${y}.${z + 1}`;
gecko.strict_max_version = `${major}.*`;
manifest.version = version;
pkg.version = version;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Cap raised to ${major}.*, version ${version}.`);
// A real file path, not a URL path: the folder may contain spaces.
execFileSync(fileURLToPath(new URL('./build.sh', import.meta.url)), { stdio: 'inherit' });
