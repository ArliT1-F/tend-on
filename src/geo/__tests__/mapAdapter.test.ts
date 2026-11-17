import { describe, expect, it } from 'vitest';
import type { StyleSpecification } from 'maplibre-gl';
import { detectBuildingLayer, tacticalLayerRole } from '../mapAdapter';

const style: StyleSpecification = {
  version: 8,
  sources: { vector: { type: 'vector', tiles: ['https://example.test/{z}/{x}/{y}.pbf'] } },
  layers: [
    { id: 'roads', type: 'line', source: 'vector', 'source-layer': 'transportation' },
    { id: 'building-footprints', type: 'fill', source: 'vector', 'source-layer': 'building' },
    { id: 'labels', type: 'symbol', source: 'vector', 'source-layer': 'place', layout: { 'text-field': ['get', 'name'] } },
  ],
};

describe('map provider adapter', () => {
  it('discovers a vector building source without hard-coding provider source IDs', () => {
    expect(detectBuildingLayer(style)).toEqual({
      source: 'vector',
      sourceLayer: 'building',
      sourceLayerId: 'building-footprints',
      beforeLayerId: 'labels',
      alreadyExtruded: false,
    });
  });

  it('returns null for a raster-only style', () => {
    const raster: StyleSpecification = { version: 8, sources: {}, layers: [] };
    expect(detectBuildingLayer(raster)).toBeNull();
  });

  it('keeps only simulation-relevant map semantics', () => {
    expect(tacticalLayerRole(style.layers[0])).toBe('road');
    expect(tacticalLayerRole(style.layers[1])).toBe('building');
    expect(tacticalLayerRole(style.layers[2])).toBe('hidden');
    expect(tacticalLayerRole({ id: 'tree-markers', type: 'circle', source: 'vector' })).toBe('hidden');
  });
});
