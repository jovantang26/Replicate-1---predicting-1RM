import { WeeklySummary } from './weekly';

export interface TrendPoint {
  week: number;
  est1RM: number;
  ma3: number | null;
  ma5: number | null;
  delta: number | null;
}

/**
 * Computes a moving average for the given values with the specified window size.
 * Returns an array where each element is the moving average for that position.
 * Returns null for positions where there aren't enough values for the window.
 */
export function computeMovingAverage(values: number[], window: number): (number | null)[] {
  if (window <= 0 || values.length === 0) {
    return [];
  }

  const result: (number | null)[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i + 1 < window) {
      // Not enough values for the window
      result.push(null);
    } else {
      // Calculate average of the window
      let sum = 0;
      for (let j = i - window + 1; j <= i; j++) {
        sum += values[j];
      }
      result.push(sum / window);
    }
  }

  return result;
}

/**
 * Computes trend analysis for weekly summaries.
 * Returns TrendPoints with moving averages and rate of change.
 */
export function computeTrend(weeklySummaries: WeeklySummary[]): TrendPoint[] {
  if (weeklySummaries.length === 0) {
    return [];
  }

  // Sort by week number to ensure proper ordering
  const sortedSummaries = [...weeklySummaries].sort((a, b) => a.week - b.week);
  
  // Extract est1RM values
  const est1RMValues = sortedSummaries.map(summary => summary.estimated1RM);
  
  // Compute moving averages
  const ma3Values = computeMovingAverage(est1RMValues, 3);
  const ma5Values = computeMovingAverage(est1RMValues, 5);
  
  // Compute deltas (rate of change from previous week)
  const deltas: (number | null)[] = [];
  for (let i = 0; i < est1RMValues.length; i++) {
    if (i === 0) {
      deltas.push(null); // No previous week for first entry
    } else {
      deltas.push(est1RMValues[i] - est1RMValues[i - 1]);
    }
  }

  // Build TrendPoints
  const trendPoints: TrendPoint[] = [];
  for (let i = 0; i < sortedSummaries.length; i++) {
    trendPoints.push({
      week: sortedSummaries[i].week,
      est1RM: est1RMValues[i],
      ma3: ma3Values[i],
      ma5: ma5Values[i],
      delta: deltas[i]
    });
  }

  return trendPoints;
}
