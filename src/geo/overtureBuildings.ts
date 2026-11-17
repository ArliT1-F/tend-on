import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { classifyBuilding, parsePhysicalHeight } from './buildings';
import type { BlueprintBuildingProperties } from '../world/blueprint';

export type OvertureBuildingCollection = FeatureCollection<Polygon | MultiPolygon, Record<string, unknown>>;

export function normalizeOvertureBuildings(
  collection: OvertureBuildingCollection,
  floorHeight = 3.1,
): FeatureCollection<Polygon, BlueprintBuildingProperties> {
  const features: Array<Feature<Polygon, BlueprintBuildingProperties>> = [];
  for (const feature of collection.features) {
    const properties = feature.properties ?? {};
    const id = String(feature.id ?? properties.id ?? stableGeometryId(feature.geometry.coordinates));
    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
    polygons.forEach((coordinates, partIndex) => {
      const height = parsePhysicalHeight(properties.height);
      const floors = positiveNumber(properties.num_floors);
      const resolvedHeight = height ?? (floors ? floors * floorHeight : null);
      const visualHeight = resolvedHeight ?? visualEstimate(id, String(properties.subtype ?? properties.class ?? 'other'));
      features.push({
        type: 'Feature',
        id: polygons.length === 1 ? id : `${id}:${partIndex}`,
        geometry: { type: 'Polygon', coordinates },
        properties: {
          ...properties,
          blueprintId: `overture/${id}${polygons.length === 1 ? '' : `/${partIndex}`}`,
          source: 'overture',
          classification: classifyBuilding({
            building: properties.subtype ?? properties.class,
            amenity: properties.class,
          }),
          height: resolvedHeight,
          heightSource: height ? 'measured' : floors ? 'levels' : 'estimated',
          numFloors: floors,
          minHeight: positiveNumber(properties.min_height) ?? 0,
          roofShape: text(properties.roof_shape),
          roofHeight: positiveNumber(properties.roof_height),
          facadeMaterial: text(properties.facade_material),
          roofMaterial: text(properties.roof_material),
          visualHeight,
          authoritativeHeight: resolvedHeight !== null,
          // Rendering compatibility while the renderer migrates to blueprint names.
          render_height: visualHeight,
          height_source: height ? 'measured' : floors ? 'levels' : 'estimated',
          height_estimated: resolvedHeight === null,
        },
      });
    });
  }
  return { type: 'FeatureCollection', features };
}

export async function loadLocalOvertureBuildings(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Local Overture blueprint returned HTTP ${response.status}`);
  return normalizeOvertureBuildings(await response.json() as OvertureBuildingCollection);
}

function positiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function stableGeometryId(coordinates: Polygon['coordinates'] | MultiPolygon['coordinates']) {
  let hash = 0;
  for (const character of JSON.stringify(coordinates)) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return `geometry-${Math.abs(hash)}`;
}

function visualEstimate(id: string, classification: string) {
  let hash = 0;
  for (const character of id) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  const base = classification.includes('office') ? 15 : classification.includes('commercial') ? 12 : 9;
  return base + Math.abs(hash % 4) * 3;
}
