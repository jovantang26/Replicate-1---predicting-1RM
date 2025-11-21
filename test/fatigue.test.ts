import { describe, it, expect } from 'vitest';
import { 
  calculateRecoveryModifier, 
  calculateFatiguePenalty, 
  calculateAdjusted1RM, 
  validateFatigueRecoveryScore 
} from '../src/fatigue';

describe('calculateRecoveryModifier', () => {
  it('should return 1.0 for recovery score of 5 (neutral)', () => {
    expect(calculateRecoveryModifier(5)).toBe(1.0);
  });

  it('should return 1.1 for recovery score of 10 (maximum)', () => {
    expect(calculateRecoveryModifier(10)).toBe(1.1);
  });

  it('should return 0.9 for recovery score of 0 (minimum)', () => {
    expect(calculateRecoveryModifier(0)).toBe(0.9);
  });

  it('should return 1.02 for recovery score of 6', () => {
    expect(calculateRecoveryModifier(6)).toBeCloseTo(1.02, 3);
  });

  it('should return 0.98 for recovery score of 4', () => {
    expect(calculateRecoveryModifier(4)).toBeCloseTo(0.98, 3);
  });

  it('should return 1.0 for null recovery', () => {
    expect(calculateRecoveryModifier(null)).toBe(1.0);
  });

  it('should return 1.0 for undefined recovery', () => {
    expect(calculateRecoveryModifier(undefined)).toBe(1.0);
  });

  it('should return 1.0 for NaN recovery', () => {
    expect(calculateRecoveryModifier(NaN)).toBe(1.0);
  });

  it('should clamp recovery values above 10', () => {
    expect(calculateRecoveryModifier(15)).toBe(1.1); // Same as recovery 10
  });

  it('should clamp recovery values below 0', () => {
    expect(calculateRecoveryModifier(-5)).toBe(0.9); // Same as recovery 0
  });
});

describe('calculateFatiguePenalty', () => {
  it('should return 0 for fatigue score of 0', () => {
    expect(calculateFatiguePenalty(0)).toBe(0);
  });

  it('should return 5 for fatigue score of 10', () => {
    expect(calculateFatiguePenalty(10)).toBe(5);
  });

  it('should return 3 for fatigue score of 6', () => {
    expect(calculateFatiguePenalty(6)).toBe(3);
  });

  it('should return 2.5 for fatigue score of 5', () => {
    expect(calculateFatiguePenalty(5)).toBe(2.5);
  });

  it('should return 0 for null fatigue', () => {
    expect(calculateFatiguePenalty(null)).toBe(0);
  });

  it('should return 0 for undefined fatigue', () => {
    expect(calculateFatiguePenalty(undefined)).toBe(0);
  });

  it('should return 0 for NaN fatigue', () => {
    expect(calculateFatiguePenalty(NaN)).toBe(0);
  });

  it('should clamp fatigue values above 10', () => {
    expect(calculateFatiguePenalty(15)).toBe(5); // Same as fatigue 10
  });

  it('should clamp fatigue values below 0', () => {
    expect(calculateFatiguePenalty(-3)).toBe(0); // Same as fatigue 0
  });
});

describe('calculateAdjusted1RM', () => {
  it('should calculate adjusted 1RM correctly with both fatigue and recovery', () => {
    // estimated1RM = 250, recovery = 8 (modifier = 1.06), fatigue = 4 (penalty = 2)
    // adjusted = 250 * 1.06 - 2 = 265 - 2 = 263
    expect(calculateAdjusted1RM(250, 8, 4)).toBe(263);
  });

  it('should calculate adjusted 1RM with only recovery', () => {
    // estimated1RM = 200, recovery = 7 (modifier = 1.04), fatigue = undefined (penalty = 0)
    // adjusted = 200 * 1.04 - 0 = 208
    expect(calculateAdjusted1RM(200, 7, undefined)).toBe(208);
  });

  it('should calculate adjusted 1RM with only fatigue', () => {
    // estimated1RM = 300, recovery = undefined (modifier = 1.0), fatigue = 6 (penalty = 3)
    // adjusted = 300 * 1.0 - 3 = 297
    expect(calculateAdjusted1RM(300, undefined, 6)).toBe(297);
  });

  it('should return estimated 1RM when no fatigue or recovery provided', () => {
    // estimated1RM = 225, recovery = undefined (modifier = 1.0), fatigue = undefined (penalty = 0)
    // adjusted = 225 * 1.0 - 0 = 225
    expect(calculateAdjusted1RM(225, undefined, undefined)).toBe(225);
  });

  it('should round to nearest pound', () => {
    // estimated1RM = 250, recovery = 6 (modifier = 1.02), fatigue = 3 (penalty = 1.5)
    // adjusted = 250 * 1.02 - 1.5 = 255 - 1.5 = 253.5 → rounds to 254
    expect(calculateAdjusted1RM(250, 6, 3)).toBe(254);
  });

  it('should return null for invalid estimated1RM', () => {
    expect(calculateAdjusted1RM(0, 5, 5)).toBeNull();
    expect(calculateAdjusted1RM(-100, 5, 5)).toBeNull();
    expect(calculateAdjusted1RM(NaN, 5, 5)).toBeNull();
  });

  it('should handle extreme values correctly', () => {
    // estimated1RM = 100, recovery = 10 (modifier = 1.1), fatigue = 10 (penalty = 5)
    // adjusted = 100 * 1.1 - 5 = 110 - 5 = 105
    expect(calculateAdjusted1RM(100, 10, 10)).toBe(105);
  });

  it('should handle minimum recovery and fatigue', () => {
    // estimated1RM = 200, recovery = 0 (modifier = 0.9), fatigue = 0 (penalty = 0)
    // adjusted = 200 * 0.9 - 0 = 180
    expect(calculateAdjusted1RM(200, 0, 0)).toBe(180);
  });
});

describe('validateFatigueRecoveryScore', () => {
  it('should return true for valid scores (0-10)', () => {
    expect(validateFatigueRecoveryScore(0)).toBe(true);
    expect(validateFatigueRecoveryScore(5)).toBe(true);
    expect(validateFatigueRecoveryScore(10)).toBe(true);
    expect(validateFatigueRecoveryScore(3.5)).toBe(true);
    expect(validateFatigueRecoveryScore(7.8)).toBe(true);
  });

  it('should return false for scores below 0', () => {
    expect(validateFatigueRecoveryScore(-1)).toBe(false);
    expect(validateFatigueRecoveryScore(-0.1)).toBe(false);
    expect(validateFatigueRecoveryScore(-10)).toBe(false);
  });

  it('should return false for scores above 10', () => {
    expect(validateFatigueRecoveryScore(10.1)).toBe(false);
    expect(validateFatigueRecoveryScore(11)).toBe(false);
    expect(validateFatigueRecoveryScore(100)).toBe(false);
  });

  it('should return false for NaN', () => {
    expect(validateFatigueRecoveryScore(NaN)).toBe(false);
  });

  it('should return false for Infinity', () => {
    expect(validateFatigueRecoveryScore(Infinity)).toBe(false);
    expect(validateFatigueRecoveryScore(-Infinity)).toBe(false);
  });
});
