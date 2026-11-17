import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { ErrorEvent as MapErrorEvent, Map as MlMap, MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl';
import type { Feature, FeatureCollection, LineString, MultiLineString, Polygon } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GAME_CONFIG } from '../config/game';
import { developmentProvider } from '../geo/provider';
import { fogMask, squareRegion } from '../geo/region';
import { buildingHeight, classifyBuilding } from '../geo/buildings';
import { addTacticalBuildingExtrusion, applyTacticalMapTheme } from '../geo/mapAdapter';
import type { InspectedFeature } from '../types/geo';
import { buildRoadGraph } from '../geo/roadGraph';
import { loadInitialWorldBlueprint } from '../world/loadBlueprint';
import { buildingColorExpression, buildingHeightExpression, roofBaseExpression, roofHeightExpression } from '../geo/buildingMassingStyle';

interface WorldMapProps {
  onInspect: (value: InspectedFeature | null) => void;
  onReady: () => void;
  onError: (message: string) => void;
  onRoadGraph: (nodes: number, edges: number) => void;
  onBuildingsLoaded: (count: number) => void;
}

const LOAD_TIMEOUT_MS = 12_000;
const ERROR_GRACE_MS = 500;

export function WorldMap({ onInspect, onReady, onError, onRoadGraph, onBuildingsLoaded }: WorldMapProps) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);

  useEffect(() => {
    if (!element.current || mapRef.current) return;

    const region = squareRegion(GAME_CONFIG.startingLocation.center, GAME_CONFIG.initialRegionSizeMeters);
    const ring = region.geometry.coordinates[0];
    const operationalBounds: [[number, number], [number, number]] = [
      [Math.min(...ring.map(([longitude]) => longitude)), Math.min(...ring.map(([, latitude]) => latitude))],
      [Math.max(...ring.map(([longitude]) => longitude)), Math.max(...ring.map(([, latitude]) => latitude))],
    ];
    let disposed = false;
    let loadTimer: number | undefined;
    let errorTimer: number | undefined;
    const buildingsRequest = new AbortController();

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
          pitch: 52,
          bearing: -12,
          maxBounds: operationalBounds,
          minZoom: 13.5,
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
        applyTacticalMapTheme(map);
        try {
          addTacticalBuildingExtrusion(map);
        } catch (error) {
          // Buildings remain as provider footprints if extrusion is unsupported.
          console.warn('Could not add tactical building extrusion', error);
        }
        installOperationalLayers(map, region);
        onReady();
        void loadRealBuildingFootprints(map, region, buildingsRequest.signal, onBuildingsLoaded);
        map.once('idle', () => importVisibleRoadGraph(map, onRoadGraph));
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
      buildingsRequest.abort();
      clearTimers();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onBuildingsLoaded, onError, onInspect, onReady, onRoadGraph]);

  return <div className="map" ref={element} aria-label="Interactive map of Tirana" />;
}

function installOperationalLayers(map: MlMap, region: GeoJSON.Feature<GeoJSON.Polygon>) {
  map.addSource('active-region', { type: 'geojson', data: region });
  map.addLayer({ id: 'active-region-fill', type: 'fill', source: 'active-region', paint: { 'fill-color': '#4f8c63', 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'active-region-line', type: 'line', source: 'active-region', paint: { 'line-color': '#7fc493', 'line-width': 2, 'line-dasharray': [3, 2] } });
  map.addSource('fog', { type: 'geojson', data: fogMask(region) });
  map.addLayer({ id: 'simulation-fog', type: 'fill', source: 'fog', paint: { 'fill-color': '#050706', 'fill-opacity': 0.98 } });
}

async function loadRealBuildingFootprints(
  map: MlMap,
  region: Feature<Polygon>,
  signal: AbortSignal,
  report: WorldMapProps['onBuildingsLoaded'],
) {
  try {
    const blueprint = await loadInitialWorldBlueprint(region, signal);
    const buildings = blueprint.buildings;
    if (signal.aborted || !map.getStyle()) return;
    map.addSource('osm-building-footprints', { type: 'geojson', data: buildings });
    // Avoid z-fighting with a provider's generic building layer once the explicit
    // real-footprint massing model is available.
    if (map.getLayer('deadzone-building-extrusion')) {
      map.setLayoutProperty('deadzone-building-extrusion', 'visibility', 'none');
    }
    map.addLayer({
      id: 'osm-building-footprints',
      type: 'fill',
      source: 'osm-building-footprints',
      paint: {
        'fill-color': '#202a25',
        'fill-opacity': 0.94,
        'fill-outline-color': '#718078',
      },
    }, 'simulation-fog');
    map.addLayer({
      id: 'osm-building-walls',
      type: 'fill-extrusion',
      source: 'osm-building-footprints',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': buildingColorExpression(-8),
        'fill-extrusion-height': buildingHeightExpression,
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.97,
        'fill-extrusion-vertical-gradient': true,
      },
    }, 'simulation-fog');
    map.addLayer({
      id: 'osm-building-roofs',
      type: 'fill-extrusion',
      source: 'osm-building-footprints',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': buildingColorExpression(18),
        'fill-extrusion-height': roofHeightExpression,
        'fill-extrusion-base': roofBaseExpression,
        'fill-extrusion-opacity': 1,
        'fill-extrusion-vertical-gradient': false,
      },
    }, 'simulation-fog');
    report(buildings.features.length);
  } catch (error) {
    if (!signal.aborted) console.warn('Could not load real OSM building footprints', error);
    report(0);
  }
}

function importVisibleRoadGraph(map: MlMap, report: WorldMapProps['onRoadGraph']) {
  const style = map.getStyle();
  const sourceLayers = new Map<string, Set<string>>();
  for (const layer of style.layers ?? []) {
    if (!('source' in layer) || !('source-layer' in layer)) continue;
    const identity = `${layer.id} ${layer['source-layer']}`.toLowerCase();
    if (!identity.includes('road') && !identity.includes('transportation') && !identity.includes('street')) continue;
    const source = String(layer.source);
    const layers = sourceLayers.get(source) ?? new Set<string>();
    layers.add(String(layer['source-layer']));
    sourceLayers.set(source, layers);
  }

  const features: Array<Feature<LineString | MultiLineString>> = [];
  const seen = new Set<string>();
  for (const [source, layers] of sourceLayers) {
    for (const sourceLayer of layers) {
      for (const feature of map.querySourceFeatures(source, { sourceLayer })) {
        if (feature.geometry.type !== 'LineString' && feature.geometry.type !== 'MultiLineString') continue;
        const key = `${sourceLayer}:${feature.id ?? JSON.stringify(feature.geometry.coordinates)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        features.push({
          type: 'Feature',
          id: feature.id,
          properties: feature.properties ?? {},
          geometry: feature.geometry,
        });
      }
    }
  }
  const graph = buildRoadGraph({ type: 'FeatureCollection', features } as FeatureCollection<LineString | MultiLineString>);
  report(graph.nodes.size, graph.edges.size);
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
