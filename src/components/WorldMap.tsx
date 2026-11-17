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

const LOAD_TIMEOUT_MS = 12_000;
const ERROR_GRACE_MS = 500;

export function WorldMap({ onInspect, onReady, onError }: WorldMapProps) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);

  useEffect(() => {
    if (!element.current || mapRef.current) return;

    const region = squareRegion(GAME_CONFIG.startingLocation.center, GAME_CONFIG.initialRegionSizeMeters);
    let disposed = false;
    let loadTimer: number | undefined;
    let errorTimer: number | undefined;

    const clearTimers = () => {
      if (loadTimer) window.clearTimeout(loadTimer);
      if (errorTimer) window.clearTimeout(errorTimer);
    };

    const startProvider = (providerIndex: number) => {
      if (disposed || !element.current) return;
      clearTimers();
      mapRef.current?.remove();
      mapRef.current = null;

      let map: MlMap;
      let loaded = false;
      try {
        map = new maplibregl.Map({
          container: element.current,
          style: developmentProvider.styles[providerIndex],
          center: GAME_CONFIG.startingLocation.center,
          zoom: GAME_CONFIG.initialZoom,
          pitch: 42,
          bearing: -8,
          attributionControl: false,
        });
      } catch (error) {
        tryNextProvider(providerIndex, error instanceof Error ? error.message : 'MapLibre could not start.');
        return;
      }

      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

      const fail = (message: string) => {
        if (loaded || disposed || errorTimer) return;
        // Some styles emit recoverable resource errors immediately before load.
        // A short grace period avoids discarding a style that still initializes.
        errorTimer = window.setTimeout(() => {
          errorTimer = undefined;
          if (!loaded) tryNextProvider(providerIndex, message);
        }, ERROR_GRACE_MS);
      };

      map.on('error', (event: MapErrorEvent) => {
        fail(event.error?.message ?? 'The map style or tiles could not be downloaded.');
      });

      map.on('load', () => {
        loaded = true;
        clearTimers();
        installOperationalLayers(map, region);
        onReady();
      });

      map.on('click', (event: MapMouseEvent) => inspectFeature(map, event, onInspect));

      loadTimer = window.setTimeout(() => {
        fail(`Provider ${providerIndex + 1} did not respond within 12 seconds.`);
      }, LOAD_TIMEOUT_MS);
    };

    const tryNextProvider = (failedIndex: number, reason: string) => {
      const nextIndex = failedIndex + 1;
      if (nextIndex < developmentProvider.styles.length) {
        startProvider(nextIndex);
        return;
      }
      mapRef.current?.remove();
      mapRef.current = null;
      onError(`${reason} All configured geographical providers failed.`);
    };

    startProvider(0);

    return () => {
      disposed = true;
      clearTimers();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onError, onInspect, onReady]);

  return <div className="map" ref={element} aria-label="Interactive map of Tirana" />;
}

function installOperationalLayers(map: MlMap, region: GeoJSON.Feature<GeoJSON.Polygon>) {
  map.addSource('active-region', { type: 'geojson', data: region });
  map.addLayer({ id: 'active-region-fill', type: 'fill', source: 'active-region', paint: { 'fill-color': '#4f8c63', 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'active-region-line', type: 'line', source: 'active-region', paint: { 'line-color': '#7fc493', 'line-width': 2, 'line-dasharray': [3, 2] } });
  map.addSource('fog', { type: 'geojson', data: fogMask(region) });
  map.addLayer({ id: 'simulation-fog', type: 'fill', source: 'fog', paint: { 'fill-color': '#050706', 'fill-opacity': 0.82 } });
}

function inspectFeature(map: MlMap, event: MapMouseEvent, onInspect: WorldMapProps['onInspect']) {
  const feature = map.queryRenderedFeatures(event.point).find((candidate: MapGeoJSONFeature) => isBuilding(candidate));
  if (!feature) {
    onInspect(null);
    return;
  }
  const properties = feature.properties ?? {};
  const height = buildingHeight(properties, GAME_CONFIG.building.fallbackHeight, GAME_CONFIG.building.floorHeight);
  onInspect({
    id: String(feature.id ?? properties.id ?? 'unknown'),
    name: String(properties.name ?? 'Unnamed structure'),
    classification: classifyBuilding(properties),
    height: height.height,
    heightEstimated: height.estimated,
    properties,
  });
}

function isBuilding(feature: MapGeoJSONFeature) {
  const properties = feature.properties ?? {};
  return Boolean(properties.building) || feature.layer.id.toLowerCase().includes('building');
}
