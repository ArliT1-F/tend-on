import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { ErrorEvent as MapErrorEvent, Map as MlMap, MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GAME_CONFIG } from '../config/game';
import { developmentProvider } from '../geo/provider';
import { fogMask, squareRegion } from '../geo/region';
import { buildingHeight, classifyBuilding } from '../geo/buildings';
import type { InspectedFeature } from '../types/geo';

interface WorldMapProps {
  onInspect: (value: InspectedFeature | null) => void;
  onReady: () => void;
  onError: (message: string) => void;
}

const LOAD_TIMEOUT_MS = 15_000;

export function WorldMap({ onInspect, onReady, onError }: WorldMapProps) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);

  useEffect(() => {
    if (!element.current || mapRef.current) return;

    const region = squareRegion(
      GAME_CONFIG.startingLocation.center,
      GAME_CONFIG.initialRegionSizeMeters,
    );
    let loaded = false;
    let reportedError = false;

    const reportError = (message: string) => {
      if (loaded || reportedError) return;
      reportedError = true;
      onError(message);
    };

    const timeout = window.setTimeout(() => {
      reportError('The geographical provider did not respond within 15 seconds.');
    }, LOAD_TIMEOUT_MS);

    let map: MlMap;
    try {
      map = new maplibregl.Map({
        container: element.current,
        style: developmentProvider.styleUrl,
        center: GAME_CONFIG.startingLocation.center,
        zoom: GAME_CONFIG.initialZoom,
        pitch: 42,
        bearing: -8,
        attributionControl: false,
      });
    } catch (error) {
      window.clearTimeout(timeout);
      reportError(error instanceof Error ? error.message : 'MapLibre could not start.');
      return;
    }

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('error', (event: MapErrorEvent) => {
      const detail = event.error?.message ?? 'The map style or tiles could not be downloaded.';
      reportError(detail);
    });

    map.on('load', () => {
      loaded = true;
      window.clearTimeout(timeout);
      map.addSource('active-region', { type: 'geojson', data: region });
      map.addLayer({
        id: 'active-region-fill',
        type: 'fill',
        source: 'active-region',
        paint: { 'fill-color': '#4f8c63', 'fill-opacity': 0.06 },
      });
      map.addLayer({
        id: 'active-region-line',
        type: 'line',
        source: 'active-region',
        paint: { 'line-color': '#7fc493', 'line-width': 2, 'line-dasharray': [3, 2] },
      });
      map.addSource('fog', { type: 'geojson', data: fogMask(region) });
      map.addLayer({
        id: 'simulation-fog',
        type: 'fill',
        source: 'fog',
        paint: { 'fill-color': '#050706', 'fill-opacity': 0.82 },
      });
      onReady();
    });

    map.on('click', (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point);
      const feature = features.find((candidate: MapGeoJSONFeature) => isBuilding(candidate));
      if (!feature) {
        onInspect(null);
        return;
      }
      const properties = feature.properties ?? {};
      const height = buildingHeight(
        properties,
        GAME_CONFIG.building.fallbackHeight,
        GAME_CONFIG.building.floorHeight,
      );
      onInspect({
        id: String(feature.id ?? properties.id ?? 'unknown'),
        name: String(properties.name ?? 'Unnamed structure'),
        classification: classifyBuilding(properties),
        height: height.height,
        heightEstimated: height.estimated,
        properties,
      });
    });

    return () => {
      window.clearTimeout(timeout);
      map.remove();
      mapRef.current = null;
    };
  }, [onError, onInspect, onReady]);

  return <div className="map" ref={element} aria-label="Interactive map of Tirana" />;
}

function isBuilding(feature: MapGeoJSONFeature) {
  const properties = feature.properties ?? {};
  return Boolean(properties.building) || feature.layer.id.toLowerCase().includes('building');
}
