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

Examples:
- Recovery 0: modifier = 0.90 (10% penalty)
- Recovery 5: modifier = 1.00 (neutral)
- Recovery 10: modifier = 1.10 (10% bonus)

#### Fatigue Penalty
```
fatiguePenalty = fatigue * 0.5
```

Examples:
- Fatigue 0: penalty = 0 lbs
- Fatigue 5: penalty = 2.5 lbs
- Fatigue 10: penalty = 5 lbs

#### Final Adjusted 1RM
```
adjusted1RM = estimated1RM * recoveryModifier - fatiguePenalty
```

### CLI Usage

#### Save Session with Fatigue/Recovery
```bash
# Basic session with fatigue and recovery
1rm 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --fatigue 6 --recovery 4 --save

# High fatigue, poor recovery
1rm 200 8 --fatigue 8 --recovery 2 --save

# Fresh and well-recovered
1rm 250 3 --fatigue 1 --recovery 9 --save
```

#### View Fatigue Trends
```bash
# Table format
1rm --fatigue-trend

# JSON format
1rm --fatigue-trend --json
```

#### Example Output (Table)
```
date        exercise      weight reps est1RM fatigue recovery adj1RM
2025-10-20  bench_press   225    5    263   6       4        258.0
2025-10-19  squat         315    3    344   3       7        349.5
2025-10-18  deadlift      405    2    421   8       3        413.0
```

#### Example Output (JSON)
```json
[
  {
    "date": "2025-10-20T00:00:00Z",
    "exerciseName": "bench_press",
    "exerciseType": "barbell",
    "weight": 225,
    "reps": 5,
    "estimated1RM": 263,
    "fatigue": 6,
    "recovery": 4,
    "adjusted1RM": 258.0
  }
]
```

### Technical Implementation

- **New CLI flags**: `--fatigue <0-10>` and `--recovery <0-10>`
- **Storage**: Extended `Session` interface with optional fatigue/recovery fields
- **Validation**: Input validation ensures scores are between 0-10
- **Backward compatibility**: Old sessions without fatigue data load normally
- **Error handling**: Invalid fatigue/recovery values show helpful error messages

### Testing

All functionality is covered by comprehensive tests in `test/fatigue.test.ts`:

- Fatigue/recovery score validation (0-10 range)
- Adjusted 1RM calculation accuracy
- Missing field handling (null values)
- Session storage and loading with new fields
- CLI integration tests

### Use Cases

This chunk enables tracking of:

1. **Training periodization**: Monitor fatigue accumulation during intense phases
2. **Recovery assessment**: Quantify sleep, nutrition, and stress impacts
3. **Performance prediction**: More accurate 1RM estimates accounting for current state
4. **Program adjustment**: Data-driven decisions about training intensity
5. **Long-term trends**: Identify patterns in fatigue and recovery over time

The fatigue and recovery data collected here will be valuable inputs for the machine learning model in later chunks.