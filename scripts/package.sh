#!/usr/bin/env bash
# Zips extension/ into dist/ for upload to the Chrome Web Store.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/extension"
version="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$src/manifest.json")"
out="$root/dist/shorts-autoscroll-$version.zip"

if [[ -z "$version" ]]; then
  echo "Could not read version from manifest.json" >&2
  exit 1
fi

mkdir -p "$root/dist"
rm -f "$out"
(cd "$src" && zip -qr -X "$out" . -x '.*' -x '*/.*')

echo "Built $out"
unzip -l "$out"
