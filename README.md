# DEADZONE — Urban Evacuation Protocol

Persistent real-geography zombie survival and military strategy simulation. Development follows the phased specification in [`Master-Prompt.md`](./Master-Prompt.md). Current progress and handoff notes are in [`Memory.md`](./Memory.md).

## Current milestone

Phase 1 foundation: interactive Tirana map, 2 × 2 km operational region, geographic fog, building inspection/classification, and responsive tactical UI.

## Requirements

- Node.js 20+
- A modern WebGL-capable browser
- Internet access for development map tiles (offline/self-hosted geography is not implemented yet)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite binds to `0.0.0.0`, so another device on the same Tailscale network can use `http://<laptop-tailscale-ip>:5173` during development.

## Verify

```bash
npm test
npm run build
npm run preview
```

Production preview binds to `0.0.0.0:4173`.

## Preparing the Overture world blueprint

The map is a geographical reference and input source, not the authoritative playable world. DEADZONE compiles source geography into a versioned `WorldBlueprint`; simulation systems will consume that normalized blueprint rather than reading rendering layers.

The preferred building source is the free Overture Maps buildings theme. Install the official CLI and prepare the initial Tirana region:

```bash
pipx install overturemaps
npm run prepare:overture
```

This writes `public/data/overture/tirana-buildings.geojson`. The game loads this prepared local dataset first and falls back to live OpenStreetMap/Overpass footprints when it is absent. Overture building data is ODbL-licensed; preserve source attribution when redistributing a derived database.

## Data attribution and status

Development map rendering uses OpenFreeMap/OpenStreetMap-compatible data through a replaceable provider abstraction. This provider is explicitly marked development-only pending production usage, caching, offline, and self-hosting evaluation.

## Known limitations

See `Memory.md`. Roads are currently visual map data and are not yet a pathfinding graph. The authoritative simulation, persistence server, WebSockets, and gameplay agents belong to later phases and have not been faked in the current UI.
