import { describe, expect, it } from 'vitest';
import { buildingHeight, classifyBuilding, parsePhysicalHeight } from '../buildings';

describe('building metadata', () => {
  it('classifies OSM tags with a generic fallback', () => {
    expect(classifyBuilding({ amenity: 'hospital' })).toBe('hospital');
    expect(classifyBuilding({})).toBe('other');
  });

  it('tracks measured and level-derived height provenance', () => {
    expect(buildingHeight({ height: 18 })).toMatchObject({ height: 18, source: 'measured', estimated: false });
    expect(buildingHeight({ 'building:levels': 4 })).toMatchObject({ height: 12.4, source: 'levels', levels: 4 });
    expect(buildingHeight({}, 0)).toMatchObject({ height: 0, source: 'unknown', estimated: false });
  });

  it('parses common physical height units without treating arbitrary text as data', () => {
    expect(parsePhysicalHeight('45 m')).toBe(45);
    expect(parsePhysicalHeight('100 ft')).toBeCloseTo(30.48);
    expect(parsePhysicalHeight('about fifteen')).toBeNull();
  });
});
