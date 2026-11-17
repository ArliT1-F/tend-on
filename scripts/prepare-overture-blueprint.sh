#!/usr/bin/env bash
set -euo pipefail

# Prepare Overture's open building dataset as a local campaign blueprint.
# Requires the official Overture Maps CLI: pipx install overturemaps
# bbox order: west,south,east,north
BBOX="${1:-19.8067,41.3185,19.8307,41.3365}"
OUTPUT="${2:-public/data/overture/tirana-buildings.geojson}"

if ! command -v overturemaps >/dev/null 2>&1; then
  echo "Missing Overture CLI. Install it with: pipx install overturemaps" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"
echo "Downloading Overture buildings for bbox $BBOX..."
overturemaps download --bbox="$BBOX" --type=building -f geojson -o "$OUTPUT"
echo "Prepared $OUTPUT"
