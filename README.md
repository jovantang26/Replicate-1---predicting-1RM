# 1RM Calculator

## Chunk 5 — Fatigue & Recovery Index

**Status:** ✅ Complete (v0.5.0)

Extends Chunk 4 by adding session-level training modifiers for fatigue and recovery. These factors help model performance fluctuations and provide more accurate adjusted 1RM calculations based on the athlete's current state.

### Features

- Fatigue scoring for each session via `--fatigue` flag (0-10 scale)
- Recovery scoring for each session via `--recovery` flag (0-10 scale)
- Automatic adjusted 1RM calculation: `adjusted1RM = estimated1RM * recoveryModifier - fatiguePenalty`
- New `--fatigue-trend` command to view fatigue/recovery analysis
- Backward compatible with existing sessions (old sessions load without fatigue fields)
- All tests passing

### New Fields

Each session can now include:

- **fatigue** (optional): Fatigue level from 0-10 (0 = fully rested, 10 = extremely fatigued)
- **recovery** (optional): Recovery level from 0-10 (0 = poor recovery, 10 = excellent recovery)
- **adjusted1RM** (calculated): 1RM adjusted for fatigue and recovery factors

### Calculation Formulas

#### Recovery Modifier
```
recoveryModifier = 1 + (recovery - 5) * 0.02
```
- Recovery 5 = no modifier (1.0)
- Recovery 10 = +10% modifier (1.1)
- Recovery 0 = -10% modifier (0.9)

#### Fatigue Penalty
```
fatiguePenalty = fatigue * 0.5
```
- Fatigue 0 = no penalty (0 lbs)
- Fatigue 10 = -5 lbs penalty

#### Adjusted 1RM
```
adjusted1RM = estimated1RM * recoveryModifier - fatiguePenalty
```

### Usage

#### Save Session with Fatigue and Recovery

```bash
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --fatigue 6 --recovery 4 --save
```

This saves a session with:
- All standard fields (weight, reps, sets, exercise, bodyweight, etc.)
- Fatigue: 6 (moderate fatigue)
- Recovery: 4 (below average recovery)
- Adjusted 1RM: calculated based on fatigue/recovery

#### View Fatigue Trend Analysis

```bash
# Table format (default)
node dist/index.js --fatigue-trend

# Output:
# date        exercise      weight reps est1RM fatigue recovery adj1RM
# ---------------------------------------------------------------------------
# 2025-10-20  bench_press   225    5    263    6       4        255
# 2025-10-19  bench_press   215    6    258    3       7        263
```

#### JSON Output

```bash
node dist/index.js --fatigue-trend --json

# Output:
# [
#   {
#     "date": "2025-10-20T00:00:00.000Z",
#     "exerciseName": "bench_press",
#     "exerciseType": "barbell",
#     "weight": 225,
#     "reps": 5,
#     "estimated1RM": 263,
#     "fatigue": 6,
#     "recovery": 4,
#     "adjusted1RM": 255
#   },
#   ...
# ]
```

### Session Schema (Extended)

Sessions now include optional fatigue/recovery fields:

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
  "strengthCategory": "intermediate",
  "fatigue": 6,
  "recovery": 4,
  "adjusted1RM": 255
}
```

### CLI Flags (Chunk 5)

- `--fatigue <0-10>` - Fatigue level (optional, 0-10 scale)
- `--recovery <0-10>` - Recovery level (optional, 0-10 scale)
- `--fatigue-trend` - View fatigue/recovery analysis table
- `--fatigue-trend --json` - View fatigue/recovery analysis as JSON

### Validation

- **Fatigue**: Must be a number between 0 and 10 (inclusive) if provided
- **Recovery**: Must be a number between 0 and 10 (inclusive) if provided
- If fatigue or recovery is omitted, `null`, or invalid: adjusted1RM calculation uses default values

### Backward Compatibility

- Old sessions without fatigue/recovery fields load correctly
- Missing fatigue/recovery fields are handled gracefully
- Existing functionality (Chunks 1-4) remains unchanged

### Examples

```bash
# Example 1: Save with fatigue and recovery
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --fatigue 6 --recovery 4 --save
# Estimated 1RM: 263 lb
# (Session saved with fatigue/recovery and adjusted 1RM)

# Example 2: View fatigue trend table
node dist/index.js --fatigue-trend
# date        exercise      weight reps est1RM fatigue recovery adj1RM
# 2025-10-20  bench_press   225    5    263    6       4        255

# Example 3: Save with only fatigue (recovery defaults to neutral)
node dist/index.js 200 8 --sets 4 --exercise squat --equipment barbell --fatigue 8 --save
# (Session saved with fatigue, recovery defaults to neutral effect)

# Example 4: Save without fatigue/recovery (still works)
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --save
# (Session saved without fatigue/recovery fields)
```

### Fatigue/Recovery Scale Guidelines

#### Fatigue Scale (0-10)
- **0-2**: Fully rested, excellent energy
- **3-4**: Well rested, good energy
- **5-6**: Moderate fatigue, average energy
- **7-8**: High fatigue, low energy
- **9-10**: Extremely fatigued, very low energy

#### Recovery Scale (0-10)
- **0-2**: Poor recovery (bad sleep, high stress, poor nutrition)
- **3-4**: Below average recovery
- **5-6**: Average recovery
- **7-8**: Good recovery (good sleep, low stress, good nutrition)
- **9-10**: Excellent recovery (optimal conditions)

### Project Structure

```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint (includes Chunk 5)
  │   ├─ calc.ts             # Pure 1RM calculation function
  │   ├─ storage.ts           # Session persistence (extended with fatigue/recovery)
  │   ├─ weekly.ts            # Weekly analysis
  │   ├─ rel.ts               # Relative strength calculation
  │   └─ fatigue.ts           # Fatigue/recovery calculation (Chunk 5)
  ├─ test/
  │   ├─ calc.test.ts        # Unit tests for calculation
  │   ├─ storage.test.ts     # Tests for sessions (includes Chunk 5 tests)
  │   ├─ weekly.test.ts      # Tests for weekly analysis
  │   ├─ rel.test.ts         # Tests for relative strength
  │   └─ fatigue.test.ts     # Tests for fatigue/recovery (Chunk 5)
  └─ data/
      └─ sessions.json       # Session history
```