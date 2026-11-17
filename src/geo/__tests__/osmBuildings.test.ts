import { describe, expect, it } from 'vitest';
import { overpassBuildingsToGeoJson, regionBounds } from '../osmBuildings';
import { squareRegion } from '../region';

describe('OSM building footprints', () => {
  it('calculates an Overpass bounding box from the operational region', () => {
    const bounds = regionBounds(squareRegion([19.8187, 41.3275], 2_000));
    expect(bounds[0]).toBeLessThan(41.3275);
    expect(bounds[1]).toBeLessThan(19.8187);
    expect(bounds[2]).toBeGreaterThan(41.3275);
    expect(bounds[3]).toBeGreaterThan(19.8187);
  });

  it('converts real OSM way geometry and level metadata into extrudable polygons', () => {
    const collection = overpassBuildingsToGeoJson({ elements: [{
      type: 'way', id: 42, tags: { building: 'apartments', 'building:levels': '5' },
      geometry: [
        { lon: 19.8, lat: 41.3 }, { lon: 19.801, lat: 41.3 },
        { lon: 19.801, lat: 41.301 }, { lon: 19.8, lat: 41.301 },
      ],
    }] });
    expect(collection.features).toHaveLength(1);
    expect(collection.features[0].geometry.coordinates[0]).toHaveLength(5);
    expect(collection.features[0].properties?.classification).toBe('residential');
    expect(collection.features[0].properties?.render_height).toBeCloseTo(15.5);
  });

  it('does not invent heights when OSM lacks height metadata', () => {
    const response = { elements: [41, 42].map((id) => ({
      type: 'way', id, tags: { building: 'yes' }, geometry: [
        { lon: 19.8, lat: 41.3 }, { lon: 19.801, lat: 41.3 },
        { lon: 19.801, lat: 41.301 }, { lon: 19.8, lat: 41.3 },
      ],
    })) };
    const buildings = overpassBuildingsToGeoJson(response);
    expect(buildings.features.every((feature) => feature.properties?.render_height === 0.6)).toBe(true);
    expect(buildings.features.every((feature) => feature.properties?.height_source === 'unknown')).toBe(true);
  });
});
