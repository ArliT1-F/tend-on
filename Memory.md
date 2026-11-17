# DEADZONE Development Memory

> Living handoff document for future Arena workspaces. Read `Master-Prompt.md` first; it remains the authoritative product specification. Update this file after every meaningful phase.

## Current state — 2026-11-17

**Active milestone:** Phase 1 — Foundation and geographical rendering  
**Status:** First runnable vertical slice complete; Phase 1 is not yet complete.

The repository began with only `Master-Prompt.md`. A React + TypeScript + Vite application now provides a dark tactical interface and an interactive MapLibre map centered on Tirana. The starting operational region is a real-coordinate 2 × 2 km polygon. A true inverse polygon visually fogs everything outside it. Rendered building features can be selected and their source metadata is normalized into a classification and measured/estimated height.

**Map loading fix:** the original provider URL requested a nonexistent OpenFreeMap `dark` style, leaving the UI stuck because only the success event was handled. It now uses the published `liberty` style and handles startup exceptions, provider errors, a 15-second timeout, and user-driven retry. Keep this failure path when changing providers.

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
- Unit tests: building metadata and region/fog geometry.

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

1. Verify the selected map provider's building source/layers and add explicit 2.5D extrusion if the style does not already provide it.
2. Build an actual road graph from progressively loaded OSM-compatible data. Roads are currently rendered by the base style, not modeled for pathfinding.
3. Add robust provider error/offline states and geographic cache boundaries.
4. Add explicit building footprint retrieval, durable IDs, classification correction, and local caching. Current inspection reads rendered vector-tile features.
5. Add map interaction tests and performance measurements on the reference Intel HD 4400 hardware.
6. Replace web-loaded Google fonts with local/system assets for reliable offline play.
7. Make fog/active cells data-driven rather than one static opening polygon before Phase 2.
8. Add accessibility and touch QA on an actual iPhone.

Do not claim the entire Phase 1 deliverable complete until roads are represented as a graph and the building pipeline is verified.

## Next recommended work order

1. Inspect OpenFreeMap style/source metadata at runtime and create a provider adapter that reports source-layer names.
2. Add building extrusion in a provider-safe way, with estimated-height fallback only in simulation metadata (avoid pretending estimates are measured).
3. Introduce tiled geographic data loading and bounded IndexedDB cache.
4. Build road-node/edge types, importer, and tests; then expose a debug road-graph overlay.
5. Add deterministic campaign seed and versioned campaign schema before autonomous entities.
6. Begin Phase 2 only after Phase 1 acceptance checks are reproducible.

## Non-negotiables to preserve

- Persistent continuous world; no stages.
- Laptop-hosted authoritative simulation; phone is a remote client.
- Real geography, actual footprints where available, and road-aware movement.
- Radio coverage and temporary reconnaissance are separate.
- Safe zones, active territory, and controlled territory are separate concepts.
- Hospitals, radio towers, and broadcast stations require operational safe-zone membership for their special functions. Garrisons/turrets/snipers do not.
- No kill currency, no teleporting where travel is required, no full-world detailed simulation.
- Every phase remains runnable, tested, and honest—never replace systems with decorative mock interactions.
