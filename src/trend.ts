import { WeeklySummary } from './weekly';

export interface TrendPoint {
  week: number;
  est1RM: number;
  ma3: number | null;
  ma5: number | null;
  delta: number | null;
}

export function computeMovingAverage(values: number[], window: number): number[] {
  const movingAverages: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      movingAverages.push(NaN); // Not enough data for the window
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      const sum = windowValues.reduce((acc, val) => acc + val, 0);
      movingAverages.push(sum / window);
    }
  }
  return movingAverages;
}

export function computeTrend(weeklySummaries: WeeklySummary[]): TrendPoint[] {
  // Sort summaries by week in ascending order for trend calculation
  const sortedSummaries = [...weeklySummaries].sort((a, b) => a.week - b.week);

  const est1RMs = sortedSummaries.map(s => s.estimated1RM);

  const ma3s = computeMovingAverage(est1RMs, 3);
  const ma5s = computeMovingAverage(est1RMs, 5);

  const trendPoints: TrendPoint[] = sortedSummaries.map((summary, index) => {
    const delta = index > 0 ? summary.estimated1RM - sortedSummaries[index - 1].estimated1RM : null;

    return {
      week: summary.week,
      est1RM: summary.estimated1RM,
      ma3: !isNaN(ma3s[index]) ? parseFloat(ma3s[index].toFixed(1)) : null,
      ma5: !isNaN(ma5s[index]) ? parseFloat(ma5s[index].toFixed(1)) : null,
      delta: delta !== null ? parseFloat(delta.toFixed(1)) : null,
    };
  });

  // Re-sort by week in descending order for display
  return trendPoints.sort((a, b) => b.week - a.week);
}
