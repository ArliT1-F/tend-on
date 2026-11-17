import { describe, expect, it } from 'vitest';
import { BUILDING_CLASS_COLORS, buildingColorExpression, buildingHeightExpression, roofHeightExpression } from '../buildingMassingStyle';

describe('city-builder building massing style', () => {
  it('defines distinct muted colors for gameplay-relevant building classes', () => {
    expect(BUILDING_CLASS_COLORS.residential).not.toBe(BUILDING_CLASS_COLORS.industrial);
    expect(BUILDING_CLASS_COLORS.hospital).not.toBe(BUILDING_CLASS_COLORS.commercial);
    expect(buildingColorExpression()).toContain('match');
  });

  it('uses source height for walls and a thin cap for roof readability', () => {
    expect(JSON.stringify(buildingHeightExpression)).toContain('render_height');
    expect(roofHeightExpression[0]).toBe('+');
    expect(roofHeightExpression[2]).toBe(0.32);
  });
});
