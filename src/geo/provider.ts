import type { StyleSpecification } from 'maplibre-gl';
import { GAME_CONFIG } from '../config/game';

export interface MapProvider {
  id: string;
  styles: Array<string | StyleSpecification>;
  attribution: string;
  productionReady: boolean;
}

// This raster style is intentionally a development fallback. It prevents a remote
// style-document outage from blocking the whole application. Public OSM tiles are
// not an unlimited production tile service; production geography remains pending.
export const osmRasterFallback: StyleSpecification = {
  version: 8,
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm-raster',
      paint: {
        'raster-saturation': -0.72,
        'raster-contrast': 0.24,
        'raster-brightness-max': 0.62,
      },
    },
  ],
};

export const developmentProvider: MapProvider = {
  id: 'openfreemap',
  styles: [GAME_CONFIG.map.styleUrl, osmRasterFallback],
  attribution: '© OpenStreetMap contributors · OpenFreeMap',
  productionReady: false,
};
