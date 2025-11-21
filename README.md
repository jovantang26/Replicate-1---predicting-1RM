# 1RM Prediction Project

## Chunk 6 — Long-Term Trend Analysis

**Status:** ✅ Complete (v0.6.0)

Analyzes long-term strength trends by computing moving averages and rate of change from weekly summaries. This provides insights into training progression over time and supports future modeling capabilities.

### Features

- Long-term trend analysis using weekly data from Chunk 3
- 3-week and 5-week moving averages for smoothed trend visualization
- Rate of change (delta) calculation between consecutive weeks
- New `--trend` command to display trend analysis
- JSON output support for programmatic access
- Proper handling of insufficient data points (returns null for moving averages)
- Weekly data automatically sorted by week number for accurate trend calculation

### Data Structure

Each trend point includes:

```typescript
interface TrendPoint {
  week: number;
  est1RM: number;
  ma3: number | null;    // 3-week moving average
  ma5: number | null;    // 5-week moving average  
  delta: number | null;  // Change from previous week
}
```

### Moving Average Rules

- **3-week MA**: Requires at least 3 weeks of data
- **5-week MA**: Requires at least 5 weeks of data
- **Delta**: First week has null delta (no previous week to compare)
- Values are null when insufficient data points are available

### CLI Usage

#### View Long-Term Trends

```bash
# Table format
node dist/index.js --trend

# JSON format
node dist/index.js --trend --json
```

#### Example Output

```
Week   est1RM   MA3     MA5     Delta
----------------------------------------
   1    250.0     N/A     N/A     N/A
   2    255.0     N/A     N/A    +5.0
   3    260.0   255.0     N/A    +5.0
   4    265.0   260.0     N/A    +5.0
   5    270.0   265.0   260.0    +5.0
```

### Implementation

- **`src/trend.ts`**: Core trend analysis functions
  - `computeMovingAverage()`: Generic moving average calculation
  - `computeTrend()`: Main trend analysis using weekly summaries
- **Updated `src/index.ts`**: Added `--trend` command support
- **`test/trend.test.ts`**: Comprehensive test coverage for all trend functions

### Dependencies

- Uses weekly summaries from Chunk 3 (`getWeeklySummaries`)
- Requires session data to generate meaningful trends
- Compatible with all previous chunk functionality

### Testing

All trend analysis functions are thoroughly tested:

- Moving average calculations with various window sizes
- Trend computation with multiple weeks of data
- Proper handling of edge cases (empty data, insufficient points)
- Weekly data sorting and delta calculations
- JSON output format validation

Run tests with:

```bash
npm test test/trend.test.ts
```

### Examples

```bash
# Example 1: View trend analysis table
node dist/index.js --trend
# Week   est1RM   MA3     MA5     Delta
# ----------------------------------------
#    1    250.0     N/A     N/A     N/A
#    2    255.0     N/A     N/A    +5.0
#    3    260.0   255.0     N/A    +5.0
#    4    265.0   260.0     N/A    +5.0
#    5    270.0   265.0   260.0    +5.0

# Example 2: View trend analysis as JSON
node dist/index.js --trend --json
# [
#   {
#     "week": 1,
#     "est1RM": 250.0,
#     "ma3": null,
#     "ma5": null,
#     "delta": null
#   },
#   {
#     "week": 2,
#     "est1RM": 255.0,
#     "ma3": null,
#     "ma5": null,
#     "delta": 5.0
#   },
#   ...
# ]

# Example 3: Requires existing session data
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --save
node dist/index.js 230 4 --sets 3 --exercise bench_press --equipment barbell --save
node dist/index.js --weekly  # Generate weekly summaries first
node dist/index.js --trend   # Then view trends
```

### Project Structure

```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint (includes --trend command)
  │   ├─ calc.ts             # Pure 1RM calculation function
  │   ├─ storage.ts          # Session persistence
  │   ├─ weekly.ts           # Weekly analysis (data source for trends)
  │   └─ trend.ts            # Long-term trend analysis (Chunk 6)
  ├─ test/
  │   ├─ calc.test.ts        # Unit tests for calculation
  │   ├─ storage.test.ts     # Tests for sessions
  │   ├─ weekly.test.ts      # Tests for weekly analysis
  │   └─ trend.test.ts       # Tests for trend analysis (Chunk 6)
  └─ data/
      └─ sessions.json       # Session history
```