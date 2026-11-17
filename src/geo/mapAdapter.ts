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
