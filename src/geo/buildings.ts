import type { BuildingClass } from '../types/geo';
const aliases: Record<string, BuildingClass> = {apartments:'residential',house:'residential',retail:'commercial',shop:'commercial',commercial:'commercial',office:'office',industrial:'industrial',warehouse:'warehouse',hospital:'hospital',clinic:'hospital',police:'police',fire_station:'fire_station',school:'school',university:'university',hotel:'hotel',bank:'bank',supermarket:'supermarket',pharmacy:'pharmacy',fuel:'fuel_station',military:'military',government:'government',church:'religious',mosque:'religious'};
export function classifyBuilding(p: Record<string, unknown>): BuildingClass {
  const candidates = [p.building, p.amenity, p.shop, p.office, p.landuse].map(String);
  for (const value of candidates) if (aliases[value]) return aliases[value];
  return 'other';
}
export function buildingHeight(p: Record<string, unknown>, fallback=10, floorHeight=3.1) {
  const direct = Number(p.height ?? p.render_height);
  if (Number.isFinite(direct) && direct > 0) return {height:direct, estimated:false};
  const levels = Number(p['building:levels'] ?? p.levels);
  if (Number.isFinite(levels) && levels > 0) return {height:levels*floorHeight, estimated:true};
  return {height:fallback, estimated:true};
}
