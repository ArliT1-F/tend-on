import type { LayerSpecification, Map as MlMap, StyleSpecification } from 'maplibre-gl';
import { GAME_CONFIG } from '../config/game';

export interface BuildingLayerDescriptor {
  source: string;
  sourceLayer?: string;
  sourceLayerId: string;
  beforeLayerId?: string;
  alreadyExtruded: boolean;
}

export function detectBuildingLayer(style: StyleSpecification): BuildingLayerDescriptor | null {
  const layers = style.layers ?? [];
  const existingExtrusion = layers.find((layer) => layer.type === 'fill-extrusion' && isBuildingLayer(layer));
  if (existingExtrusion && 'source' in existingExtrusion && typeof existingExtrusion.source === 'string') {
    return descriptor(existingExtrusion, layers, true);
  }
  const footprint = [...layers].reverse().find((layer) =>
    layer.type === 'fill' && 'source' in layer && typeof layer.source === 'string' && isBuildingLayer(layer),
  );
  return footprint && 'source' in footprint && typeof footprint.source === 'string'
    ? descriptor(footprint, layers, false)
    : null;
}

export type TacticalLayerRole = 'building' | 'road' | 'water' | 'ground' | 'boundary' | 'hidden';

export function tacticalLayerRole(layer: LayerSpecification): TacticalLayerRole {
  const id = layer.id.toLowerCase();
  const sourceLayer = 'source-layer' in layer ? String(layer['source-layer']).toLowerCase() : '';
  const identity = `${id} ${sourceLayer}`;
  if (isBuildingLayer(layer)) return 'building';
  if (identity.includes('transportation') || identity.includes('road') || identity.includes('street')) return 'road';
  if (identity.includes('water')) return 'water';
  if (identity.includes('boundary')) return 'boundary';
  if (layer.type === 'background' || layer.type === 'fill' || layer.type === 'raster') return 'ground';
  return 'hidden';
}

export function applyTacticalMapTheme(map: MlMap) {
  for (const layer of map.getStyle().layers ?? []) {
    try {
      const role = tacticalLayerRole(layer);
      if (layer.type === 'symbol' || layer.type === 'circle' || role === 'hidden') {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
        continue;
      }
      if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-color', '#0b100e');
      if (layer.type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', role === 'water' ? '#101d20' : role === 'building' ? '#29332e' : '#111713');
        map.setPaintProperty(layer.id, 'fill-opacity', role === 'building' ? 0.9 : 1);
        map.setPaintProperty(layer.id, 'fill-outline-color', role === 'building' ? '#46534c' : '#171e1a');
      }
      if (layer.type === 'line') {
        if (role !== 'road' && role !== 'boundary') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        } else {
          map.setPaintProperty(layer.id, 'line-color', role === 'road' ? '#39443f' : '#25302b');
          map.setPaintProperty(layer.id, 'line-opacity', role === 'road' ? 0.82 : 0.35);
        }
      }
      if (layer.type === 'raster') {
        map.setPaintProperty(layer.id, 'raster-saturation', -1);
        map.setPaintProperty(layer.id, 'raster-contrast', 0.35);
        map.setPaintProperty(layer.id, 'raster-brightness-max', 0.58);
      }
    } catch (error) {
      // A provider may reject a paint property used by another provider. Keep its
      // original layer rather than aborting map initialization and showing blank UI.
      console.warn(`Could not theme map layer ${layer.id}`, error);
    }
  }
}

export function addTacticalBuildingExtrusion(map: MlMap) {
  if (map.getLayer('deadzone-building-extrusion')) return true;
  const building = detectBuildingLayer(map.getStyle());
  if (!building || building.alreadyExtruded) return building?.alreadyExtruded ?? false;

  map.addLayer({
    id: 'deadzone-building-extrusion',
    type: 'fill-extrusion',
    source: building.source,
    ...(building.sourceLayer ? { 'source-layer': building.sourceLayer } : {}),
    minzoom: GAME_CONFIG.building.minExtrusionZoom,
    paint: {
      'fill-extrusion-color': '#303a35',
      'fill-extrusion-height': [
        'coalesce',
        ['to-number', ['get', 'render_height']],
        ['to-number', ['get', 'height']],
        ['*', ['to-number', ['get', 'building:levels']], GAME_CONFIG.building.floorHeight],
        GAME_CONFIG.building.fallbackHeight,
      ],
      'fill-extrusion-base': ['coalesce', ['to-number', ['get', 'render_min_height']], 0],
      'fill-extrusion-opacity': 0.72,
    },
  }, building.beforeLayerId);
  return true;
}

function descriptor(layer: LayerSpecification, layers: LayerSpecification[], alreadyExtruded: boolean): BuildingLayerDescriptor {
  const index = layers.findIndex((candidate) => candidate.id === layer.id);
  const beforeLayerId = layers.slice(index + 1).find((candidate) => candidate.type === 'symbol')?.id;
  const sourceLayer = 'source-layer' in layer ? layer['source-layer'] : undefined;
  return {
    source: 'source' in layer ? String(layer.source) : '',
    sourceLayer,
    sourceLayerId: layer.id,
    beforeLayerId,
    alreadyExtruded,
  };
}

function isBuildingLayer(layer: LayerSpecification) {
  const id = layer.id.toLowerCase();
  const sourceLayer = 'source-layer' in layer ? String(layer['source-layer']).toLowerCase() : '';
  return id.includes('building') || sourceLayer.includes('building');
}
