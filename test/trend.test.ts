import { describe, it, expect } from 'vitest';
import { computeMovingAverage, computeTrend, TrendPoint } from '../src/trend';
import { WeeklySummary } from '../src/weekly';

describe('computeMovingAverage', () => {
  it('should return empty array for empty input', () => {
    expect(computeMovingAverage([], 3)).toEqual([]);
  });

  it('should return empty array for invalid window', () => {
    expect(computeMovingAverage([1, 2, 3], 0)).toEqual([]);
    expect(computeMovingAverage([1, 2, 3], -1)).toEqual([]);
  });

  it('should return null for positions without enough values', () => {
    const result = computeMovingAverage([1, 2, 3, 4, 5], 3);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
  });

  it('should compute correct 3-period moving average', () => {
    const values = [10, 20, 30, 40, 50];
    const result = computeMovingAverage(values, 3);
    
    expect(result).toHaveLength(5);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toBeCloseTo(20); // (10+20+30)/3 = 20
    expect(result[3]).toBeCloseTo(30); // (20+30+40)/3 = 30
    expect(result[4]).toBeCloseTo(40); // (30+40+50)/3 = 40
  });

  it('should compute correct 5-period moving average', () => {
    const values = [100, 110, 120, 130, 140, 150];
    const result = computeMovingAverage(values, 5);
    
    expect(result).toHaveLength(6);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull();
    expect(result[3]).toBeNull();
    expect(result[4]).toBeCloseTo(120); // (100+110+120+130+140)/5 = 120
    expect(result[5]).toBeCloseTo(130); // (110+120+130+140+150)/5 = 130
  });

  it('should handle single value with window 1', () => {
    const result = computeMovingAverage([42], 1);
    expect(result).toEqual([42]);
  });
});

describe('computeTrend', () => {
  it('should return empty array for empty input', () => {
    expect(computeTrend([])).toEqual([]);
  });

  it('should handle single weekly summary', () => {
    const weeklySummaries: WeeklySummary[] = [
      {
        week: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        topWeight: 225,
        reps: 5,
        estimated1RM: 250
      }
    ];

    const result = computeTrend(weeklySummaries);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      week: 1,
      est1RM: 250,
      ma3: null,
      ma5: null,
      delta: null
    });
  });

  it('should compute trend correctly for multiple weeks', () => {
    const weeklySummaries: WeeklySummary[] = [
      {
        week: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        topWeight: 225,
        reps: 5,
        estimated1RM: 250
      },
      {
        week: 2,
        startDate: '2025-01-08',
        endDate: '2025-01-14',
        topWeight: 230,
        reps: 5,
        estimated1RM: 255
      },
      {
        week: 3,
        startDate: '2025-01-15',
        endDate: '2025-01-21',
        topWeight: 235,
        reps: 5,
        estimated1RM: 260
      },
      {
        week: 4,
        startDate: '2025-01-22',
        endDate: '2025-01-28',
        topWeight: 240,
        reps: 5,
        estimated1RM: 265
      }
    ];

    const result = computeTrend(weeklySummaries);
    
    expect(result).toHaveLength(4);
    
    // Week 1
    expect(result[0].week).toBe(1);
    expect(result[0].est1RM).toBe(250);
    expect(result[0].ma3).toBeNull();
    expect(result[0].ma5).toBeNull();
    expect(result[0].delta).toBeNull();
    
    // Week 2
    expect(result[1].week).toBe(2);
    expect(result[1].est1RM).toBe(255);
    expect(result[1].ma3).toBeNull();
    expect(result[1].ma5).toBeNull();
    expect(result[1].delta).toBe(5); // 255 - 250 = 5
    
    // Week 3
    expect(result[2].week).toBe(3);
    expect(result[2].est1RM).toBe(260);
    expect(result[2].ma3).toBeCloseTo(255); // (250+255+260)/3 = 255
    expect(result[2].ma5).toBeNull();
    expect(result[2].delta).toBe(5); // 260 - 255 = 5
    
    // Week 4
    expect(result[3].week).toBe(4);
    expect(result[3].est1RM).toBe(265);
    expect(result[3].ma3).toBeCloseTo(260); // (255+260+265)/3 = 260
    expect(result[3].ma5).toBeNull();
    expect(result[3].delta).toBe(5); // 265 - 260 = 5
  });

  it('should sort weekly summaries by week number', () => {
    const weeklySummaries: WeeklySummary[] = [
      {
        week: 3,
        startDate: '2025-01-15',
        endDate: '2025-01-21',
        topWeight: 235,
        reps: 5,
        estimated1RM: 260
      },
      {
        week: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        topWeight: 225,
        reps: 5,
        estimated1RM: 250
      },
      {
        week: 2,
        startDate: '2025-01-08',
        endDate: '2025-01-14',
        topWeight: 230,
        reps: 5,
        estimated1RM: 255
      }
    ];

    const result = computeTrend(weeklySummaries);
    
    expect(result).toHaveLength(3);
    expect(result[0].week).toBe(1);
    expect(result[1].week).toBe(2);
    expect(result[2].week).toBe(3);
  });

  it('should compute 5-week moving average when enough data', () => {
    const weeklySummaries: WeeklySummary[] = [];
    
    // Create 6 weeks of data
    for (let i = 1; i <= 6; i++) {
      weeklySummaries.push({
        week: i,
        startDate: `2025-01-${String((i-1)*7 + 1).padStart(2, '0')}`,
        endDate: `2025-01-${String(i*7).padStart(2, '0')}`,
        topWeight: 220 + i * 5, // 225, 230, 235, 240, 245, 250
        reps: 5,
        estimated1RM: 250 + i * 5 // 255, 260, 265, 270, 275, 280
      });
    }

    const result = computeTrend(weeklySummaries);
    
    expect(result).toHaveLength(6);
    
    // Week 5 should have MA5
    expect(result[4].week).toBe(5);
    expect(result[4].ma5).toBeCloseTo(265); // (255+260+265+270+275)/5 = 265
    
    // Week 6 should have MA5
    expect(result[5].week).toBe(6);
    expect(result[5].ma5).toBeCloseTo(270); // (260+265+270+275+280)/5 = 270
  });

  it('should handle negative deltas correctly', () => {
    const weeklySummaries: WeeklySummary[] = [
      {
        week: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        topWeight: 245,
        reps: 5,
        estimated1RM: 270
      },
      {
        week: 2,
        startDate: '2025-01-08',
        endDate: '2025-01-14',
        topWeight: 240,
        reps: 5,
        estimated1RM: 265
      }
    ];

    const result = computeTrend(weeklySummaries);
    
    expect(result).toHaveLength(2);
    expect(result[1].delta).toBe(-5); // 265 - 270 = -5
  });
});
