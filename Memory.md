# DEADZONE Development Memory

> Living handoff document for future Arena workspaces. Read `Master-Prompt.md` first; it remains the authoritative product specification. Update this file after every meaningful phase.

## Current state — 2026-11-17

**Active milestone:** Phase 1 — Foundation and geographical rendering  
**Status:** Advanced runnable vertical slice; Phase 1 is not yet complete because durable geographic caching and performance validation remain.

The repository began with only `Master-Prompt.md`. A React + TypeScript + Vite application now provides a dark tactical interface and an interactive MapLibre map centered on Tirana. The starting operational region is a real-coordinate 2 × 2 km polygon. A true inverse polygon visually fogs everything outside it. Rendered building features can be selected and their source metadata is normalized into a classification and measured/estimated height.

**Map loading fixes:** the original provider URL requested a nonexistent OpenFreeMap `dark` style, leaving the UI stuck because only the success event was handled. It now uses the published `liberty` style, handles startup exceptions and timeouts, and automatically falls back to a self-contained OpenStreetMap raster style if the remote vector style fails. Only after every configured provider fails does it show the retry screen. Keep this fallback path when changing providers. The raster fallback is development-only and does not expose selectable vector building features. A later tactical-theme regression accidentally classified the raster base as decorative and hid it, producing a blank map; raster layers are now explicitly preserved and theme/extrusion incompatibilities cannot abort map initialization.

## Architecture decisions

- Rendering and geography utilities are separate. `WorldMap` renders; `src/geo` owns geographic/provider logic.
- Gameplay values begin in `src/config/game.ts`; do not scatter balancing values through components.
- `src/geo/provider.ts` is the map-source seam. Current OpenFreeMap configuration is **development-only**, deliberately marked `productionReady: false`. Evaluate licensing, offline caching, limits, and self-hosting before production.
- Geographic state uses longitude/latitude GeoJSON, never screen coordinates.
- The operational region source and visual fog source are distinct, anticipating simulation activation as authoritative state.
- Bottom navigation items for future systems are visibly disabled rather than fake buttons.
- Desktop and mobile layouts are present from the start.

## Implemented files/systems

- Build: `package.json`, Vite and strict TypeScript configs.
- UI: `src/App.tsx`, `src/styles.css`.
- Map: `src/components/WorldMap.tsx`.
- Provider abstraction: `src/geo/provider.ts`.
- Region + inverse fog geometry: `src/geo/region.ts`.
- OSM metadata classification and height estimation: `src/geo/buildings.ts`.
- Provider-safe vector building layer discovery and tactical 2.5D extrusion: `src/geo/mapAdapter.ts`.
- Geographic road graph construction and A* routing with one-way/blocked-edge support: `src/geo/roadGraph.ts`. Visible vector road features are imported after the map becomes idle and graph counts are reported in the sector panel.
- Tactical map theming strips labels, POIs, tree markers, decorative circles, and unrelated linework; it preserves dark ground/water, roads, boundaries, and buildings. Outside the 2 × 2 km operational sector is nearly opaque.
- Unit tests: building metadata, provider adaptation, road graph/routing, and region/fog geometry.

## Verification

Last known commands:

```bash
npm run build   # passes
npm test        # 2 files, 3 tests pass
npm run dev     # network-accessible Vite server on 0.0.0.0:5173
```

There is a build warning because MapLibre creates a large client chunk (~1.29 MB minified / 361 KB gzip). This is not a failure, but route/lazy chunking should be considered as the app expands.

## Important limitations / honest gaps

Phase 1 still needs:

1. Make visible-road imports incrementally refresh as the operational region changes; the first live provider import now runs once after initial map idle.
2. Add robust offline states and geographic cache boundaries. Provider fallback and retry exist, but no offline tile cache exists.
3. Add explicit building footprint persistence, durable IDs, classification correction, and local caching. Current inspection and 2.5D extrusion read vector-tile features.
5. Add map interaction tests and performance measurements on the reference Intel HD 4400 hardware.
6. Replace web-loaded Google fonts with local/system assets for reliable offline play.
7. Make fog/active cells data-driven rather than one static opening polygon before Phase 2.
8. Add accessibility and touch QA on an actual iPhone.

Do not claim the entire Phase 1 deliverable complete until roads are represented as a graph and the building pipeline is verified.

## Next recommended work order

1. Introduce tiled geographic data loading and a bounded IndexedDB cache.
2. Persist normalized building footprints and road graph chunks with durable geographical IDs.
3. Add deterministic campaign seed and versioned campaign schema before autonomous entities.
4. Benchmark building extrusion and graph construction on the reference hardware.
5. Begin Phase 2 only after Phase 1 acceptance checks are reproducible.

## Non-negotiables to preserve

- Persistent continuous world; no stages.
- Laptop-hosted authoritative simulation; phone is a remote client.
- Real geography, actual footprints where available, and road-aware movement.
- Radio coverage and temporary reconnaissance are separate.
- Safe zones, active territory, and controlled territory are separate concepts.
- Hospitals, radio towers, and broadcast stations require operational safe-zone membership for their special functions. Garrisons/turrets/snipers do not.
- No kill currency, no teleporting where travel is required, no full-world detailed simulation.
- Every phase remains runnable, tested, and honest—never replace systems with decorative mock interactions.
