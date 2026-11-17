import { describe, expect, it } from 'vitest';
import { normalizeOvertureBuildings } from '../overtureBuildings';

describe('Overture blueprint normalization', () => {
  it('preserves measured height, floor, roof, facade, and source metadata', () => {
    const result = normalizeOvertureBuildings({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature', id: 'gers-building-1',
        geometry: { type: 'Polygon', coordinates: [[[19.8, 41.3], [19.801, 41.3], [19.801, 41.301], [19.8, 41.3]]] },
        properties: {
          subtype: 'commercial', height: 24, num_floors: 7, min_height: 2,
          roof_shape: 'gabled', roof_height: 3, facade_material: 'brick', roof_material: 'tile',
        },
      }],
    });
    expect(result.features[0].properties).toMatchObject({
      blueprintId: 'overture/gers-building-1', source: 'overture', height: 24,
      heightSource: 'measured', numFloors: 7, minHeight: 2, roofShape: 'gabled',
      roofHeight: 3, facadeMaterial: 'brick', roofMaterial: 'tile', authoritativeHeight: true,
    });
  });

  it('splits multipart geometry and labels missing heights as visual estimates', () => {
    const polygon = [[[0, 0], [1, 0], [1, 1], [0, 0]]];
    const result = normalizeOvertureBuildings({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', id: 'multi', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [polygon, polygon] } }],
    });
    expect(result.features).toHaveLength(2);
    expect(result.features.every((feature) => !feature.properties.authoritativeHeight)).toBe(true);
    expect(result.features.every((feature) => feature.properties.heightSource === 'estimated')).toBe(true);
  });
});
