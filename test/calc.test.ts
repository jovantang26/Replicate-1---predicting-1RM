import { describe, it, expect } from 'vitest';
import { estimate1RM } from '../src/calc';

describe('estimate1RM', () => {
  describe('valid inputs', () => {
    it('should calculate Epley example: 225 lb x 5 reps = 263 lb', () => {
      // 225 * (1 + 5/30) = 225 * 1.1667 = 262.5, rounded to 263
      expect(estimate1RM(225, 5)).toBe(263);
    });

    it('should return weight as true 1RM when reps === 1', () => {
      expect(estimate1RM(265, 1)).toBe(265);
    });

    it('should handle minimum valid reps (1)', () => {
      expect(estimate1RM(135, 1)).toBe(135);
    });

    it('should handle upper reps bound (30)', () => {
      // 135 * (1 + 30/30) = 135 * 2 = 270
      expect(estimate1RM(135, 30)).toBe(270);
    });

    it('should round to nearest pound', () => {
      // 200 * (1 + 3/30) = 200 * 1.1 = 220
      expect(estimate1RM(200, 3)).toBe(220);
      
      // 100 * (1 + 10/30) = 100 * 1.333... = 133.33, rounded to 133
      expect(estimate1RM(100, 10)).toBe(133);
    });
  });

  describe('invalid weight', () => {
    it('should throw error for zero weight', () => {
      expect(() => estimate1RM(0, 5)).toThrow('Weight must be a positive number');
    });

    it('should throw error for negative weight', () => {
      expect(() => estimate1RM(-100, 5)).toThrow('Weight must be a positive number');
    });

    it('should throw error for non-finite weight (Infinity)', () => {
      expect(() => estimate1RM(Infinity, 5)).toThrow('Weight must be a positive number');
    });

    it('should throw error for non-finite weight (NaN)', () => {
      expect(() => estimate1RM(NaN, 5)).toThrow('Weight must be a positive number');
    });
  });

  describe('invalid reps', () => {
    it('should throw error for reps === 0', () => {
      expect(() => estimate1RM(200, 0)).toThrow('Reps must be at least 1');
    });

    it('should throw error for negative reps', () => {
      expect(() => estimate1RM(200, -1)).toThrow('Reps must be at least 1');
    });

    it('should throw error for non-integer reps', () => {
      expect(() => estimate1RM(200, 3.5)).toThrow('Reps must be an integer');
    });

    it('should throw error for reps > 30', () => {
      expect(() => estimate1RM(200, 31)).toThrow('Reps must be at most 30');
    });

    it('should throw error for very large reps', () => {
      expect(() => estimate1RM(200, 100)).toThrow('Reps must be at most 30');
    });
  });
});

