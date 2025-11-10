"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const calc_1 = require("../src/calc");
(0, vitest_1.describe)('estimate1RM', () => {
    (0, vitest_1.describe)('valid inputs', () => {
        (0, vitest_1.it)('should calculate Epley example: 225 lb x 5 reps = 263 lb', () => {
            // 225 * (1 + 5/30) = 225 * 1.1667 = 262.5, rounded to 263
            (0, vitest_1.expect)((0, calc_1.estimate1RM)(225, 5)).toBe(263);
        });
        (0, vitest_1.it)('should return weight as true 1RM when reps === 1', () => {
            (0, vitest_1.expect)((0, calc_1.estimate1RM)(265, 1)).toBe(265);
        });
        (0, vitest_1.it)('should handle minimum valid reps (1)', () => {
            (0, vitest_1.expect)((0, calc_1.estimate1RM)(135, 1)).toBe(135);
        });
        (0, vitest_1.it)('should handle upper reps bound (30)', () => {
            // 135 * (1 + 30/30) = 135 * 2 = 270
            (0, vitest_1.expect)((0, calc_1.estimate1RM)(135, 30)).toBe(270);
        });
        (0, vitest_1.it)('should round to nearest pound', () => {
            // 200 * (1 + 3/30) = 200 * 1.1 = 220
            (0, vitest_1.expect)((0, calc_1.estimate1RM)(200, 3)).toBe(220);
            // 100 * (1 + 10/30) = 100 * 1.333... = 133.33, rounded to 133
            (0, vitest_1.expect)((0, calc_1.estimate1RM)(100, 10)).toBe(133);
        });
    });
    (0, vitest_1.describe)('invalid weight', () => {
        (0, vitest_1.it)('should throw error for zero weight', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(0, 5)).toThrow('Weight must be a positive number');
        });
        (0, vitest_1.it)('should throw error for negative weight', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(-100, 5)).toThrow('Weight must be a positive number');
        });
        (0, vitest_1.it)('should throw error for non-finite weight (Infinity)', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(Infinity, 5)).toThrow('Weight must be a positive number');
        });
        (0, vitest_1.it)('should throw error for non-finite weight (NaN)', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(NaN, 5)).toThrow('Weight must be a positive number');
        });
    });
    (0, vitest_1.describe)('invalid reps', () => {
        (0, vitest_1.it)('should throw error for reps === 0', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(200, 0)).toThrow('Reps must be at least 1');
        });
        (0, vitest_1.it)('should throw error for negative reps', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(200, -1)).toThrow('Reps must be at least 1');
        });
        (0, vitest_1.it)('should throw error for non-integer reps', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(200, 3.5)).toThrow('Reps must be an integer');
        });
        (0, vitest_1.it)('should throw error for reps > 30', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(200, 31)).toThrow('Reps must be at most 30');
        });
        (0, vitest_1.it)('should throw error for very large reps', () => {
            (0, vitest_1.expect)(() => (0, calc_1.estimate1RM)(200, 100)).toThrow('Reps must be at most 30');
        });
    });
});
