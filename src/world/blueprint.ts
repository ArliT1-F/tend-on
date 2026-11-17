import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { BuildingClass } from '../types/geo';
import type { HeightSource } from '../geo/buildings';

export type BlueprintSource = 'overture' | 'openstreetmap' | 'regional-lidar';

export interface BlueprintBuildingProperties {
  blueprintId: string;
  source: BlueprintSource;
  classification: BuildingClass;
  height: number | null;
  heightSource: HeightSource;
  numFloors: number | null;
  minHeight: number;
  roofShape: string | null;
  roofHeight: number | null;
  facadeMaterial: string | null;
  roofMaterial: string | null;
  visualHeight: number;
  authoritativeHeight: boolean;
  [key: string]: unknown;
}

export type BlueprintBuilding = Feature<Polygon, BlueprintBuildingProperties>;

export interface WorldBlueprint {
  schemaVersion: 1;
  regionId: string;
  generatedAt: string;
  sources: BlueprintSource[];
  buildings: FeatureCollection<Polygon, BlueprintBuildingProperties>;
}

export function createWorldBlueprint(
  regionId: string,
  buildings: FeatureCollection<Polygon, BlueprintBuildingProperties>,
): WorldBlueprint {
  return {
    schemaVersion: 1,
    regionId,
    generatedAt: new Date().toISOString(),
    sources: [...new Set(buildings.features.map((feature) => feature.properties.source))],
    buildings,
  };
}
