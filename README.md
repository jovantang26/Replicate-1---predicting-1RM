# 1RM Calculator - Chunk 2

A TypeScript CLI tool to calculate estimated one-rep maximum (1RM) using the Epley formula, with data logging and history tracking.

## Overview

This is **Chunk 2** of the 1RM calculator project — a CLI application that calculates 1RM estimates and can save sessions to a local history file. Sessions are stored in `data/sessions.json` and can be listed with the `--list` command.

## Formula

The calculator uses the **Epley formula**:

```
est1RM = weight * (1 + reps/30)
```

- If `reps === 1`, the weight is returned as the true 1RM (no calculation needed).
- Otherwise, the formula is applied and the result is rounded to the nearest pound using `Math.round()`.

## Usage

### Basic Calculation

```bash
node dist/index.js 225 5
# Output: Estimated 1RM: 263 lb
```

### Save Session to History

```bash
node dist/index.js 225 5 --save
# Output: Estimated 1RM: 263 lb
# (Session is saved to data/sessions.json)
```

### List Recent Sessions

```bash
# List last 5 sessions (default)
node dist/index.js --list

# List last 3 sessions
node dist/index.js --list 3

# List as JSON
node dist/index.js --list 3 --json
```

### JSON Output

```bash
# Single calculation with JSON
node dist/index.js 265 1 --json
# Output:
# {
#   "weight": 265,
#   "reps": 1,
#   "estimated1RM": 265,
#   "method": "epley"
# }

# History as JSON array
node dist/index.js --list 2 --json
# Output:
# [
#   {
#     "date": "2025-11-10T00:00:00.000Z",
#     "weight": 250,
#     "reps": 5,
#     "estimated1RM": 292,
#     "method": "epley"
#   },
#   ...
# ]
```

### Examples

```bash
# Example 1: Calculate and save
node dist/index.js 225 5 --save
# Estimated 1RM: 263 lb

# Example 2: List recent sessions
node dist/index.js --list
# Date                  Weight    Reps    1RM
# --------------------------------------------------
# Nov 10, 2025, 12:00 PM     225       5     263

# Example 3: JSON output for calculation
node dist/index.js 200 3 --json
# {
#   "weight": 200,
#   "reps": 3,
#   "estimated1RM": 220,
#   "method": "epley"
# }
```

## Data Persistence

Sessions are stored in `data/sessions.json`. The file is automatically created on the first save. Each session includes:

- `date`: ISO 8601 timestamp
- `weight`: Weight lifted (lbs)
- `reps`: Number of reps performed
- `estimated1RM`: Calculated 1RM estimate
- `method`: Calculation method (always "epley")

### File Handling

- **Missing file**: Automatically created as an empty array `[]` on first save
- **Corrupt file**: Automatically reinitialized to `[]` and continues without error
- **Invalid data**: Non-array JSON is detected and the file is reset

## Validation

The calculator validates inputs:

- **Weight**: Must be a positive number
- **Reps**: Must be an integer between 1 and 30 (inclusive)

Invalid inputs will produce an error message and exit with code 1.

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
# Basic calculation
node dist/index.js 225 5

# Save a session
node dist/index.js 225 5 --save

# List recent sessions
node dist/index.js --list

# List with limit and JSON
node dist/index.js --list 3 --json
```

## Project Structure

```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint with --save, --list, --json
  │   ├─ calc.ts             # Pure 1RM calculation function
  │   └─ storage.ts           # Session persistence and history
  ├─ test/
  │   ├─ calc.test.ts        # Unit tests for calculation
  │   └─ storage.test.ts     # Tests for persistence and CLI listing
  ├─ data/
  │   └─ sessions.json       # Session history (auto-created)
  ├─ package.json
  ├─ tsconfig.json
  ├─ .gitignore
  └─ README.md
```

## Rounding

All results are rounded to the nearest pound using `Math.round()`. For example:
- `225 * (1 + 5/30) = 262.5` → rounds to `263`
- `200 * (1 + 3/30) = 220.0` → rounds to `220`

## License

MIT

