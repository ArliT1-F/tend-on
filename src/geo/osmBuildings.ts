import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { buildingHeight, classifyBuilding } from './buildings';

interface OverpassElement {
  type: string;
  id: number;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
] as const;

export function regionBounds(region: Feature<Polygon>): [number, number, number, number] {
  const ring = region.geometry.coordinates[0];
  const longitudes = ring.map(([longitude]) => longitude);
  const latitudes = ring.map(([, latitude]) => latitude);
  return [Math.min(...latitudes), Math.min(...longitudes), Math.max(...latitudes), Math.max(...longitudes)];
}

export async function fetchOsmBuildings(region: Feature<Polygon>, signal?: AbortSignal): Promise<FeatureCollection<Polygon>> {
  const [south, west, north, east] = regionBounds(region);
  const query = `[out:json][timeout:25];way["building"](${south},${west},${north},${east});out tags geom;`;
  let lastError: unknown;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const timeout = AbortSignal.timeout(15_000);
      const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
      // GET avoids CORS preflight failures seen with some Overpass mirrors.
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        method: 'GET',
        signal: requestSignal,
      });
      if (!response.ok) throw new Error(`Building provider returned HTTP ${response.status}`);
      return overpassBuildingsToGeoJson(await response.json() as OverpassResponse);
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Building footprint providers are unavailable.');
}

export function overpassBuildingsToGeoJson(response: OverpassResponse): FeatureCollection<Polygon> {
  const features: Array<Feature<Polygon>> = [];
  for (const element of response.elements ?? []) {
    if (element.type !== 'way' || !element.geometry || element.geometry.length < 4) continue;
    const coordinates = element.geometry.map(({ lon, lat }) => [lon, lat] as [number, number]);
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) coordinates.push(first);
    const tags: Record<string, unknown> = { ...element.tags, osmId: `way/${element.id}` };
    // Accuracy-first: never invent a skyline height. OSM `height` is used as a
    // physical measurement and `building:levels` is converted using the configured
    // floor height. Unknown buildings remain low footprints until a licensed 3D
    // provider supplies measured geometry.
    const resolvedHeight = buildingHeight(tags, 0);
    // Hybrid mode keeps the city readable when OSM has no vertical metadata. The
    // value is explicitly tagged as an estimate and must never be used as an
    // authoritative simulation/line-of-sight height.
    const visualEstimate = estimatedMassingHeight(element.id, classifyBuilding(tags));
    const renderHeight = resolvedHeight.source === 'unknown' ? visualEstimate : resolvedHeight.height;
    const heightSource = resolvedHeight.source === 'unknown' ? 'estimated' : resolvedHeight.source;
    features.push({
      type: 'Feature',
      id: element.id,
      properties: {
        ...tags,
        classification: classifyBuilding(tags),
        render_height: renderHeight,
        height_estimated: heightSource === 'estimated',
        height_source: heightSource,
        resolved_levels: resolvedHeight.levels ?? null,
      },
      geometry: { type: 'Polygon', coordinates: [coordinates] },
    });
  }
  return { type: 'FeatureCollection', features };
}

function estimatedMassingHeight(id: number, classification: string) {
  const baseByClass: Record<string, number> = {
    residential: 9,
    commercial: 11,
    office: 14,
    industrial: 7,
    warehouse: 6,
    hospital: 12,
    hotel: 15,
    government: 13,
    religious: 10,
  };
  return (baseByClass[classification] ?? 8) + (Math.abs(id) % 3) * 3;
}

