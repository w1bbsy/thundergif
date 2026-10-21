#!/bin/sh
# Packages src/ into dist/thundergif-<version>.xpi, unminified, as addons.thunderbird.net expects.
set -eu
cd "$(dirname "$0")/.."
version=$(node -p "require('./src/manifest.json').version")
mkdir -p dist
out="dist/thundergif-$version.xpi"
rm -f "$out"
(cd src && zip -qr -X "../$out" . -x '*.d.ts' -x '*.DS_Store')
echo "$out"
