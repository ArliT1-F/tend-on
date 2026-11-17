import type { BuildingClass } from '../types/geo';

export type HeightSource = 'measured' | 'levels' | 'estimated' | 'unknown';

export interface BuildingHeight {
  height: number;
  estimated: boolean;
  source: HeightSource;
  levels?: number;
}

const aliases: Record<string, BuildingClass> = {apartments:'residential',house:'residential',retail:'commercial',shop:'commercial',commercial:'commercial',office:'office',industrial:'industrial',warehouse:'warehouse',hospital:'hospital',clinic:'hospital',police:'police',fire_station:'fire_station',school:'school',university:'university',hotel:'hotel',bank:'bank',supermarket:'supermarket',pharmacy:'pharmacy',fuel:'fuel_station',military:'military',government:'government',church:'religious',mosque:'religious'};

export function classifyBuilding(properties: Record<string, unknown>): BuildingClass {
  const candidates = [properties.building, properties.amenity, properties.shop, properties.office, properties.landuse].map(String);
  for (const value of candidates) if (aliases[value]) return aliases[value];
  return 'other';
}

export function buildingHeight(properties: Record<string, unknown>, fallback = 10, floorHeight = 3.1): BuildingHeight {
  const declaredSource = properties.height_source;
  if (declaredSource === 'unknown') return { height: 0, estimated: false, source: 'unknown' };
  if (declaredSource === 'estimated') {
    const visualHeight = parsePositiveNumber(properties.render_height);
    return { height: visualHeight ?? fallback, estimated: true, source: 'estimated' };
  }
  if (declaredSource === 'levels') {
    const resolved = parsePositiveNumber(properties.render_height);
    const levels = parsePositiveNumber(properties.resolved_levels);
    if (resolved !== null) return { height: resolved, estimated: false, source: 'levels', levels: levels ?? undefined };
  }
  const direct = parsePhysicalHeight(properties.height ?? properties.render_height);
  if (direct !== null && direct > 0) return { height: direct, estimated: false, source: 'measured' };

  const levels = parsePositiveNumber(properties['building:levels'] ?? properties.levels);
  if (levels !== null) return { height: levels * floorHeight, estimated: false, source: 'levels', levels };

  if (fallback <= 0) return { height: 0, estimated: false, source: 'unknown' };
  return { height: fallback, estimated: true, source: 'estimated' };
}

export function parsePhysicalHeight(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(',', '.');
  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)\s*(m|meter|meters|metre|metres|ft|feet|foot|')?$/);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return match[2] === 'ft' || match[2] === 'feet' || match[2] === 'foot' || match[2] === "'"
    ? amount * 0.3048
    : amount;
}

function parsePositiveNumber(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : NaN;
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
