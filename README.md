# 1RM Calculator - Chunk 3: Weekly Max Set Detection

A TypeScript CLI tool that extends the 1RM calculator with automatic weekly analysis of training sessions. This chunk adds the ability to analyze saved sessions and determine the **weekly top set** and **weekly estimated 1RM** for barbell bench press exercises.

## Overview

**Chunk 3** extends the raw data collection system (Chunk 2) by adding weekly analysis capabilities. It automatically groups training sessions by ISO week and identifies the top set (heaviest weight) for each week.

---

## Chunk 3: Weekly Max Set Detection

**Status:** ✅ Complete (v0.3.0)

Extends Chunk 2 by adding automatic weekly analysis of training sessions. Analyzes saved sessions to determine the **weekly top set** and **weekly estimated 1RM** for barbell bench press exercises.

### Features

- Automatic ISO week grouping (weeks start Monday)
- Top set detection: selects heaviest weight per week, breaks ties by lowest reps
- Weekly 1RM calculation using Epley formula
- Table and JSON output formats
- Filters for barbell bench press sessions only
- All 13 weekly tests passing (44 total tests)

### Weekly Summary Output

The `--weekly` command generates a summary table showing:

| Week | Date Range     | Top Weight | Reps | est1RM |
| ---- | -------------- | ---------- | ---- | ------ |
| 43   | Oct 20–26      | 225        | 5    | 263    |
| 42   | Oct 13–19      | 215        | 6    | 258    |
| 41   | Oct 06–12      | 205        | 8    | 257    |

### Usage

#### Generate Weekly Summary

```bash
# Show all weekly summaries (table format)
node dist/index.js --weekly

# Limit to last 4 weeks
node dist/index.js --weekly --limit 4

# JSON output
node dist/index.js --weekly --json
```

#### Examples

```bash
# Example 1: View weekly max sets
node dist/index.js --weekly
# Week | Date Range     | Top Weight | Reps | est1RM
# --------------------------------------------------
# 43   | Oct 20–26      | 225        | 5    | 263
# 42   | Oct 13–19      | 215        | 6    | 258

# Example 2: Last 3 weeks as JSON
node dist/index.js --weekly --limit 3 --json
# [
#   {
#     "week": 43,
#     "startDate": "2025-10-20T00:00:00.000Z",
#     "endDate": "2025-10-26T23:59:59.999Z",
#     "topWeight": 225,
#     "reps": 5,
#     "estimated1RM": 263
#   },
#   ...
# ]
```

### How It Works

#### Exercise Filtering

Only sessions matching **both** criteria are included:
- `exerciseType === "barbell"`
- `exerciseName` contains `"bench"`, `"bench_press"`, or `"barbell_bench"` (case-insensitive)

#### ISO Week Grouping

- Weeks start on **Monday** and end on **Sunday**
- Uses ISO 8601 week numbering (week 1 contains January 4th)
- Sessions are automatically grouped by their ISO week number

#### Top Set Selection

For each week, the algorithm:
1. Finds all barbell bench press sessions in that week
2. Selects the session with the **heaviest weight**
3. If multiple sessions share the same weight, selects the one with **fewest reps**
4. Calculates weekly 1RM using the Epley formula on the top set

#### Date Range Formatting

Week ranges are displayed as `"Oct 20–26"` (same month) or `"Oct 30–Nov 5"` (cross-month).

### Weekly Summary Schema

```json
{
  "week": 43,
  "startDate": "2025-10-20T00:00:00.000Z",
  "endDate": "2025-10-26T23:59:59.999Z",
  "topWeight": 225,
  "reps": 5,
  "estimated1RM": 263
}
```

### CLI Flags (Chunk 3)

- `--weekly` - Generate weekly summary of top sets
- `--limit <n>` - Show only the last n weeks (use with `--weekly`)
- `--json` - Output weekly summaries as JSON array

### Notes

- **Empty results**: If no barbell bench press sessions exist, the command returns an empty table or `[]` in JSON format
- **Week ordering**: Results are sorted by week number in **descending order** (most recent first)
- **Multiple sessions per week**: Only the top set (heaviest weight, tie-break by lowest reps) is shown per week

---

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Run in Development Mode

```bash
npm run dev
```

### Test CLI Locally

After building:

```bash
# Weekly summary (Chunk 3)
node dist/index.js --weekly

# Weekly summary with limit (Chunk 3)
node dist/index.js --weekly --limit 4 --json
```

## Project Structure

```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint (Chunk 1 + Chunk 2 + Chunk 3)
  │   ├─ calc.ts             # Pure 1RM calculation function (Chunk 1)
  │   ├─ storage.ts           # Session persistence and history (Chunk 2)
  │   └─ weekly.ts            # Weekly analysis and top set detection (Chunk 3)
  ├─ test/
  │   ├─ calc.test.ts        # Unit tests for calculation (Chunk 1)
  │   ├─ storage.test.ts     # Tests for structured sessions and CLI (Chunk 2)
  │   └─ weekly.test.ts      # Tests for weekly analysis (Chunk 3)
  ├─ data/
  │   └─ sessions.json       # Session history (auto-created, Chunk 2)
  ├─ package.json
  ├─ tsconfig.json
  ├─ .gitignore
  └─ README.md
```

## License

MIT
