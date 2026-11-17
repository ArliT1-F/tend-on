import type { ExpressionSpecification } from 'maplibre-gl';

/** Muted city-builder palette. Geometry remains sourced from real footprint data. */
export const BUILDING_CLASS_COLORS: Record<string, string> = {
  residential: '#53655d',
  commercial: '#59666a',
  office: '#56636b',
  industrial: '#655f50',
  warehouse: '#5e5b50',
  hospital: '#66706b',
  police: '#52636a',
  fire_station: '#6b5b51',
  school: '#666451',
  university: '#626653',
  hotel: '#655f69',
  government: '#66645e',
  religious: '#686258',
  other: '#4c5953',
};

export function buildingColorExpression(brightness = 0): ExpressionSpecification {
  const entries = Object.entries(BUILDING_CLASS_COLORS).flatMap(([classification, color]) => [classification, adjust(color, brightness)]);
  return ['match', ['get', 'classification'], ...entries, adjust(BUILDING_CLASS_COLORS.other, brightness)] as unknown as ExpressionSpecification;
}

export const buildingHeightExpression: ExpressionSpecification = [
  'max', 0.6, ['to-number', ['get', 'render_height'], 0.6],
];

export const roofBaseExpression: ExpressionSpecification = buildingHeightExpression;

export const roofHeightExpression: ExpressionSpecification = [
  '+', buildingHeightExpression, 0.32,
];

function adjust(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255]
    .map((channel) => Math.max(0, Math.min(255, channel + amount)));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
