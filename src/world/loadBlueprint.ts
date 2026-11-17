import type { FeatureCollection, Polygon } from 'geojson';
import { osmBuildingProvider } from '../geo/buildingGeometryProvider';
import { loadLocalOvertureBuildings } from '../geo/overtureBuildings';
import type { BlueprintBuildingProperties, WorldBlueprint } from './blueprint';
import { createWorldBlueprint } from './blueprint';

const LOCAL_OVERTURE_URL = '/data/overture/tirana-buildings.geojson';

export async function loadInitialWorldBlueprint(region: GeoJSON.Feature<Polygon>, signal?: AbortSignal): Promise<WorldBlueprint> {
  try {
    const overture = await loadLocalOvertureBuildings(LOCAL_OVERTURE_URL, signal);
    return createWorldBlueprint('tirana-al-01', overture);
  } catch (error) {
    if (signal?.aborted) throw error;
    console.info('Prepared Overture blueprint unavailable; using live OSM fallback.', error);
  }

  const osm = await osmBuildingProvider.load(region, signal);
  const buildings: FeatureCollection<Polygon, BlueprintBuildingProperties> = {
    type: 'FeatureCollection',
    features: osm.features.map((feature) => {
      const source = String(feature.properties?.height_source ?? 'estimated');
      const authoritativeHeight = source === 'measured' || source === 'levels';
      return {
        ...feature,
        properties: {
          ...feature.properties,
          blueprintId: String(feature.properties?.osmId ?? `osm/${feature.id}`),
          source: 'openstreetmap',
          classification: feature.properties?.classification ?? 'other',
          height: authoritativeHeight ? Number(feature.properties?.render_height) : null,
          heightSource: source === 'measured' || source === 'levels' ? source : 'estimated',
          numFloors: feature.properties?.resolved_levels ? Number(feature.properties.resolved_levels) : null,
          minHeight: 0,
          roofShape: null,
          roofHeight: null,
          facadeMaterial: null,
          roofMaterial: null,
          visualHeight: Number(feature.properties?.render_height ?? 0.6),
          authoritativeHeight,
        },
      };
    }),
  };
  return createWorldBlueprint('tirana-al-01', buildings);
}
