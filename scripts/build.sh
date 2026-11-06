#!/bin/sh
# Packages both Editions (ADR 0002), unminified, as addons.thunderbird.net expects:
#   dist/thundergif-<version>.xpi       the ATN edition (no Experiment)
#   dist/thundergif-live-<version>.xpi  Thundergif Live (with the Experiment), for GitHub
set -eu
cd "$(dirname "$0")/.."
version=$(node -p "require('./src/manifest.json').version")
mkdir -p dist
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
for edition in atn live; do
  case $edition in
    atn) out="dist/thundergif-$version.xpi" ;;
    live) out="dist/thundergif-live-$version.xpi" ;;
  esac
  rm -f "$out"
  mkdir "$stage/$edition"
  node scripts/editions.mjs "$edition" "$stage/$edition"
  (cd "$stage/$edition" && zip -qr -X "$OLDPWD/$out" .)
  echo "$out"
done
