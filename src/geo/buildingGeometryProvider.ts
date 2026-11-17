import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { fetchOsmBuildings } from './osmBuildings';

export type GeometryAccuracy = 'surveyed' | 'photogrammetry' | 'community-metadata' | 'estimated';

export interface BuildingGeometryCapabilities {
  footprints: boolean;
  measuredHeights: boolean;
  detailedRoofs: boolean;
  accuracy: GeometryAccuracy;
}

export interface BuildingGeometryProvider {
  id: string;
  label: string;
  capabilities: BuildingGeometryCapabilities;
  load(region: Feature<Polygon>, signal?: AbortSignal): Promise<FeatureCollection<Polygon>>;
}

/**
 * Current no-key provider. Footprints are real OSM geometry. Heights are only
 * authoritative where contributors supplied `height` or `building:levels`.
 */
export const osmBuildingProvider: BuildingGeometryProvider = {
  id: 'openstreetmap-overpass',
  label: 'OpenStreetMap building geometry',
  capabilities: {
    footprints: true,
    measuredHeights: false,
    detailedRoofs: false,
    accuracy: 'community-metadata',
  },
  load: fetchOsmBuildings,
};

/**
 * Contract for a future licensed photogrammetry/LiDAR adapter. Implementations
 * must preserve provider attribution and licensing and must not claim measured
 * height capability unless the source actually supplies it.
 */
export function validateBuildingProvider(provider: BuildingGeometryProvider) {
  if (!provider.id || !provider.label) throw new Error('Building provider identity is required.');
  if (provider.capabilities.accuracy === 'photogrammetry' && !provider.capabilities.measuredHeights) {
    throw new Error('Photogrammetry providers must expose measured heights.');
  }
  return provider;
}
