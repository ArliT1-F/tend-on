import { describe, expect, it } from 'vitest';
import { osmBuildingProvider, validateBuildingProvider } from '../buildingGeometryProvider';

describe('building geometry provider contract', () => {
  it('does not claim satellite-grade measured heights for community metadata', () => {
    expect(osmBuildingProvider.capabilities).toMatchObject({
      footprints: true,
      measuredHeights: false,
      detailedRoofs: false,
      accuracy: 'community-metadata',
    });
  });

  it('rejects a photogrammetry adapter that cannot supply measured heights', () => {
    expect(() => validateBuildingProvider({
      ...osmBuildingProvider,
      id: 'invalid-satellite',
      capabilities: { ...osmBuildingProvider.capabilities, accuracy: 'photogrammetry' },
    })).toThrow(/measured heights/);
  });
});
