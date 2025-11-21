# 1RM Calculator

A TypeScript CLI tool to calculate estimated one-rep maximum (1RM) using the Epley formula. Chunk 1 provides basic calculation functionality, and Chunk 2 adds structured raw data collection for building a training dataset.

## Overview

This project is built in chunks, each adding new functionality. **Chunk 1** provides the core 1RM calculation functionality. **Chunk 2** extends it with structured data collection. **Chunk 3** adds weekly analysis of training sessions. **Chunk 4** adds bodyweight tracking and relative strength analysis.

---

## Chunk 1 README: Minimal 1RM Calculator

**Status:** ✅ Complete (v0.1.0)

A minimal CLI application that calculates estimated 1RM using the Epley formula. This is the foundation of the project.

### Features

- Basic 1RM calculation using Epley formula: `weight * (1 + reps/30)`
- Input validation (weight must be positive, reps must be integer 1-30)
- JSON output support with `--json` flag
- Error handling with clear messages
- All 14 unit tests passing

### Formula

The calculator uses the **Epley formula**:

```
est1RM = weight * (1 + reps/30)
```

- If `reps === 1`, the weight is returned as the true 1RM (no calculation needed).
- Otherwise, the formula is applied and the result is rounded to the nearest pound using `Math.round()`.

### Usage

#### Basic Calculation

```bash
node dist/index.js 225 5
# Output: Estimated 1RM: 263 lb
```

#### JSON Output

```bash
node dist/index.js 225 5 --json
# Output:
# {
#   "weight": 225,
#   "reps": 5,
#   "estimated1RM": 263,
#   "method": "epley"
# }
```

#### Examples

```bash
# Example 1: 225 lb x 5 reps
node dist/index.js 225 5
# Estimated 1RM: 263 lb

# Example 2: True 1RM (1 rep)
node dist/index.js 265 1
# Estimated 1RM: 265 lb

# Example 3: JSON output
node dist/index.js 200 3 --json
# {
#   "weight": 200,
#   "reps": 3,
#   "estimated1RM": 220,
#   "method": "epley"
# }
```

### Validation

- **Weight**: Must be a positive number
- **Reps**: Must be an integer between 1 and 30 (inclusive)

Invalid inputs will produce an error message and exit with code 1.

### CLI Flags (Chunk 1)

- `--json` - Output in JSON format

### Rounding

All results are rounded to the nearest pound using `Math.round()`. For example:
- `225 * (1 + 5/30) = 262.5` → rounds to `263`
- `200 * (1 + 3/30) = 220.0` → rounds to `220`

---

## Chunk 2: Raw Data Collection

**Status:** ✅ Complete (v0.2.0)

Extends Chunk 1 by adding structured data collection capabilities. Captures **all essential training variables** needed to build a dataset for future model training.

### Features

- 6 raw input fields: reps, weight, sets, exerciseName, exerciseType, date
- Session persistence to `data/sessions.json`
- List saved sessions with `--list` command
- Full validation of required fields when saving
- Enhanced table output showing all session data
- All 31 tests passing (14 calc + 17 storage)

### Raw Data Fields

Each session captures **6 raw inputs** plus calculated fields:

1. **reps** - Number of reps performed (required)
2. **weight** - Weight lifted in lbs (required)
3. **sets** - Number of sets performed (required when using `--save`)
4. **exerciseName** - Exercise identifier, e.g., `"bench_press"`, `"incline_smith"`, `"lat_pulldown"` (required when using `--save`)
5. **exerciseType** - Equipment type, e.g., `"barbell"`, `"cable"`, `"machine"` (required when using `--save`)
6. **date** - ISO 8601 timestamp (auto-generated unless `--date` is provided)

### Usage

#### Save Structured Session

When using `--save`, you must provide all required fields:

```bash
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --save
# Output: Estimated 1RM: 263 lb
# (Full session saved to data/sessions.json)
```

#### Save with Custom Date

```bash
node dist/index.js 185 3 --sets 4 --exercise incline_smith --equipment machine --date 2025-11-10 --save
```

#### List Recent Sessions

```bash
# List last 5 sessions (default)
node dist/index.js --list

# List last 3 sessions
node dist/index.js --list 3

# List as JSON
node dist/index.js --list 3 --json
```

#### JSON Output

```bash
# Save with JSON output (returns full session)
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --save --json
# Output:
# {
#   "date": "2025-11-20T08:30:00.000Z",
#   "exerciseName": "bench_press",
#   "exerciseType": "barbell",
#   "sets": 3,
#   "weight": 225,
#   "reps": 5,
#   "estimated1RM": 263,
#   "method": "epley"
# }

# History as JSON array
node dist/index.js --list 2 --json
# Output:
# [
#   {
#     "date": "2025-11-10T00:00:00.000Z",
#     "exerciseName": "bench_press",
#     "exerciseType": "barbell",
#     "sets": 3,
#     "weight": 250,
#     "reps": 5,
#     "estimated1RM": 292,
#     "method": "epley"
#   },
#   ...
# ]
```

#### Examples

```bash
# Example 1: Calculate and save structured session
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --save
# Estimated 1RM: 263 lb

# Example 2: List recent sessions (table format)
node dist/index.js --list
# Date                  Exercise            Equipment    Sets    Weight    Reps    1RM
# ------------------------------------------------------------------------------------------
# Nov 20, 2025, 12:00 PM     bench_press         barbell        3      225       5     263

# Example 3: Save with custom date
node dist/index.js 185 3 --sets 4 --exercise incline_smith --equipment machine --date 2025-11-10 --save
```

### Session Schema

Each saved session follows this structure:

```json
{
  "date": "2025-11-10T00:00:00.000Z",
  "exerciseName": "bench_press",
  "exerciseType": "barbell",
  "sets": 3,
  "weight": 225,
  "reps": 5,
  "estimated1RM": 263,
  "method": "epley"
}
```

### Field Descriptions

- **date**: ISO 8601 timestamp (auto-generated from current time or `--date` flag)
- **exerciseName**: Exercise identifier (snake_case recommended, e.g., `bench_press`, `incline_smith`)
- **exerciseType**: Equipment type (e.g., `barbell`, `cable`, `machine`, `dumbbell`)
- **sets**: Number of sets performed (integer ≥ 1)
- **weight**: Weight lifted in lbs (positive number)
- **reps**: Number of reps performed (integer 1-30)
- **estimated1RM**: Calculated 1RM estimate using Epley formula
- **method**: Calculation method (always `"epley"`)

### Data Persistence

Sessions are stored in `data/sessions.json`. The file is automatically created on the first save. 

#### File Handling

- **Missing file**: Automatically created as an empty array `[]` on first save
- **Corrupt file**: Automatically reinitialized to `[]` and continues without error
- **Invalid data**: Non-array JSON is detected and the file is reset

### Validation (Chunk 2 Additional)

- **Sets**: Must be an integer ≥ 1 (required when using `--save`)
- **exerciseName**: Required when using `--save`
- **exerciseType**: Required when using `--save`
- **date**: If provided via `--date`, must be valid ISO format or YYYY-MM-DD. If invalid, an error is shown.

Invalid inputs will produce an error message and exit with code 1.

### CLI Flags (Chunk 2)

- `--sets <n>` - Number of sets (required with `--save`)
- `--exercise <string>` - Exercise name (required with `--save`)
- `--equipment <string>` - Equipment type (required with `--save`)
- `--date <YYYY-MM-DD>` - Custom date (optional, defaults to current date/time)
- `--save` - Save session to `data/sessions.json`
- `--list [n]` - List past n sessions (default: 5)

### Date Handling

- **Default behavior**: If `--date` is not provided, the current date/time is used (ISO 8601 format)
- **Custom date**: Use `--date YYYY-MM-DD` to specify a date (e.g., `--date 2025-11-10`)
- **Invalid date**: If an invalid date format is provided, the CLI will error and exit

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

## Chunk 4 — Bodyweight & Relative Strength

**Status:** ✅ Complete (v0.4.0)

Extends Chunk 3 by adding bodyweight tracking and relative strength analysis. This enhancement allows users to track their bodyweight alongside training sessions and automatically calculates relative strength ratios and strength categories.

### Features

- Bodyweight logging for each saved session via `--bw` flag
- Automatic relative strength calculation: `relativeStrength = estimated1RM / bodyweight`
- Strength category classification (novice/intermediate/advanced/elite)
- New `--rel` command to view bodyweight and relative strength data
- Backward compatible with existing sessions (old sessions load without bodyweight fields)
- All tests passing

### New Fields

Each session can now include:

- **bodyweight** (optional): User's bodyweight in lbs at time of session
- **relativeStrength** (calculated): Ratio of estimated 1RM to bodyweight
- **strengthCategory** (calculated): Classification based on relative strength ratio

### Relative Strength Calculation

Relative strength is computed as:

```
relativeStrength = estimated1RM / bodyweight
```

- If bodyweight is provided and > 0: calculation is performed
- If bodyweight is absent or invalid: both `relativeStrength` and `strengthCategory` are `null`/`undefined`

### Strength Categories

The system classifies strength based on relative strength ratio:

- **< 1.0** → `novice`
- **1.0–1.49** → `intermediate`
- **1.5–1.99** → `advanced`
- **≥ 2.0** → `elite`

### Usage

#### Save Session with Bodyweight

```bash
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --save
```

This saves a session with:
- All standard fields (weight, reps, sets, exercise, etc.)
- Bodyweight: 180 lbs
- Relative strength: 263 / 180 = 1.46
- Strength category: `intermediate`

#### View Relative Strength Analysis

```bash
# Table format (default)
node dist/index.js --rel

# Output:
# date        exercise      weight reps est1RM bw   rel  category
# ----------------------------------------------------------------------
# 2025-10-20  bench_press   225    5    263   180  1.46 intermediate
# 2025-10-19  bench_press   215    6    258   180  1.43 intermediate
```

#### JSON Output

```bash
node dist/index.js --rel --json

# Output:
# [
#   {
#     "date": "2025-10-20T00:00:00.000Z",
#     "exerciseName": "bench_press",
#     "exerciseType": "barbell",
#     "weight": 225,
#     "reps": 5,
#     "estimated1RM": 263,
#     "bodyweight": 180,
#     "relativeStrength": 1.46,
#     "strengthCategory": "intermediate"
#   },
#   ...
# ]
```

### Session Schema (Extended)

Sessions now include optional bodyweight fields:

```json
{
  "date": "2025-11-10T00:00:00.000Z",
  "exerciseName": "bench_press",
  "exerciseType": "barbell",
  "sets": 3,
  "weight": 225,
  "reps": 5,
  "estimated1RM": 263,
  "method": "epley",
  "bodyweight": 180,
  "relativeStrength": 1.46,
  "strengthCategory": "intermediate"
}
```

### CLI Flags (Chunk 4)

- `--bw <number>` - Bodyweight in lbs (optional, positive number)
- `--rel` - View relative strength analysis table
- `--rel --json` - View relative strength analysis as JSON

### Validation

- **Bodyweight**: Must be a positive number if provided
- If bodyweight is omitted, `null`, or invalid: relative strength fields are set to `null`/`undefined`

### Backward Compatibility

- Old sessions without bodyweight fields load correctly
- Missing bodyweight fields are handled gracefully
- Existing functionality (Chunks 1-3) remains unchanged

### Examples

```bash
# Example 1: Save with bodyweight
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --save
# Estimated 1RM: 263 lb
# (Session saved with bodyweight and relative strength)

# Example 2: View relative strength table
node dist/index.js --rel
# date        exercise      weight reps est1RM bw   rel  category
# 2025-10-20  bench_press   225    5    263   180  1.46 intermediate

# Example 3: Save without bodyweight (still works)
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --save
# (Session saved without bodyweight fields)
```

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
# Basic calculation (Chunk 1)
node dist/index.js 225 5

# Save a structured session (Chunk 2)
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --save

# List recent sessions (Chunk 2)
node dist/index.js --list

# List with limit and JSON (Chunk 2)
node dist/index.js --list 3 --json

# Weekly summary (Chunk 3)
node dist/index.js --weekly

# Weekly summary with limit (Chunk 3)
node dist/index.js --weekly --limit 4 --json

# Save with bodyweight (Chunk 4)
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --save

# View relative strength analysis (Chunk 4)
node dist/index.js --rel
```

## Project Structure

```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint (Chunks 1-4)
  │   ├─ calc.ts             # Pure 1RM calculation function (Chunk 1)
  │   ├─ storage.ts           # Session persistence and history (Chunk 2, extended in Chunk 4)
  │   ├─ weekly.ts            # Weekly analysis and top set detection (Chunk 3)
  │   └─ rel.ts               # Relative strength calculation (Chunk 4)
  ├─ test/
  │   ├─ calc.test.ts        # Unit tests for calculation (Chunk 1)
  │   ├─ storage.test.ts     # Tests for structured sessions and CLI (Chunk 2, extended in Chunk 4)
  │   ├─ weekly.test.ts      # Tests for weekly analysis (Chunk 3)
  │   └─ rel.test.ts         # Tests for relative strength (Chunk 4)
  ├─ data/
  │   └─ sessions.json       # Session history (auto-created, Chunk 2)
  ├─ package.json
  ├─ tsconfig.json
  ├─ .gitignore
  └─ README.md
```

## Chunk History

- **v0.1.0** - Chunk 1: Minimal 1RM Calculator
  - Basic calculation with Epley formula
  - Input validation
  - JSON output support
  - 14 unit tests

- **v0.2.0** - Chunk 2: Raw Data Collection
  - Structured session storage
  - 6 raw input fields
  - Session listing and history
  - 17 additional tests (31 total)

- **v0.3.0** - Chunk 3: Weekly Max Set Detection
  - ISO week grouping and analysis
  - Top set detection (heaviest weight, tie-break by lowest reps)
  - Weekly 1RM calculation
  - Barbell bench press filtering
  - 13 additional tests (44 total)

- **v0.4.0** - Chunk 4: Bodyweight & Relative Strength
  - Bodyweight tracking for sessions
  - Relative strength calculation and categorization
  - New `--bw` and `--rel` commands
  - Backward compatibility with existing sessions
  - 13 additional tests (57 total)

## License

MIT