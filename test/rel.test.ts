import { describe, it, expect } from 'vitest';
import { computeRelativeStrength, classifyStrengthRatio } from '../src/rel';

describe('computeRelativeStrength', () => {
  it('should return accurate division when bodyweight is provided', () => {
    expect(computeRelativeStrength(263, 180)).toBeCloseTo(1.461, 2);
    expect(computeRelativeStrength(200, 150)).toBeCloseTo(1.333, 2);
    expect(computeRelativeStrength(300, 200)).toBe(1.5);
  });

  it('should return null for missing bodyweight', () => {
    expect(computeRelativeStrength(263, undefined)).toBeNull();
    expect(computeRelativeStrength(263, null)).toBeNull();
  });

  it('should return null for invalid bodyweight', () => {
    expect(computeRelativeStrength(263, 0)).toBeNull();
    expect(computeRelativeStrength(263, -10)).toBeNull();
    expect(computeRelativeStrength(263, NaN)).toBeNull();
  });

  it('should return null for invalid estimated1RM', () => {
    expect(computeRelativeStrength(0, 180)).toBeNull();
    expect(computeRelativeStrength(-100, 180)).toBeNull();
    expect(computeRelativeStrength(NaN, 180)).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(computeRelativeStrength(180, 180)).toBe(1.0);
    expect(computeRelativeStrength(360, 180)).toBe(2.0);
    expect(computeRelativeStrength(90, 180)).toBe(0.5);
  });
});

describe('classifyStrengthRatio', () => {
  it('should classify as novice for ratios < 1.0', () => {
    expect(classifyStrengthRatio(0.5)).toBe('novice');
    expect(classifyStrengthRatio(0.9)).toBe('novice');
    expect(classifyStrengthRatio(0.99)).toBe('novice');
  });

  it('should classify as intermediate for ratios 1.0-1.49', () => {
    expect(classifyStrengthRatio(1.0)).toBe('intermediate');
    expect(classifyStrengthRatio(1.25)).toBe('intermediate');
    expect(classifyStrengthRatio(1.49)).toBe('intermediate');
  });

  it('should classify as advanced for ratios 1.5-1.99', () => {
    expect(classifyStrengthRatio(1.5)).toBe('advanced');
    expect(classifyStrengthRatio(1.75)).toBe('advanced');
    expect(classifyStrengthRatio(1.99)).toBe('advanced');
  });

  it('should classify as elite for ratios >= 2.0', () => {
    expect(classifyStrengthRatio(2.0)).toBe('elite');
    expect(classifyStrengthRatio(2.5)).toBe('elite');
    expect(classifyStrengthRatio(3.0)).toBe('elite');
  });

  it('should return undefined for null or invalid ratios', () => {
    expect(classifyStrengthRatio(null)).toBeUndefined();
    expect(classifyStrengthRatio(NaN)).toBeUndefined();
    expect(classifyStrengthRatio(-1)).toBeUndefined();
  });
});

