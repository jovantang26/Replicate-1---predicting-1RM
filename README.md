# 1RM Calculator

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

### Project Structure

```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint (includes Chunk 4)
  │   ├─ calc.ts             # Pure 1RM calculation function
  │   ├─ storage.ts           # Session persistence (extended with bodyweight)
  │   ├─ weekly.ts            # Weekly analysis
  │   └─ rel.ts               # Relative strength calculation (Chunk 4)
  ├─ test/
  │   ├─ calc.test.ts        # Unit tests for calculation
  │   ├─ storage.test.ts     # Tests for sessions (includes Chunk 4 tests)
  │   ├─ weekly.test.ts      # Tests for weekly analysis
  │   └─ rel.test.ts         # Tests for relative strength (Chunk 4)
  └─ data/
      └─ sessions.json       # Session history
```
