# 1RM Calculator - Chunk 1: Epley Formula

A minimal TypeScript CLI tool to calculate estimated one-rep maximum (1RM) using the Epley formula.

## Overview

This is **Chunk 1** of the 1RM calculator project — a simple CLI application that calculates estimated 1RM using the Epley formula. This is the foundation of the project.

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

### JSON Output

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

### Examples

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

## Validation

The calculator validates inputs:

- **Weight**: Must be a positive number
- **Reps**: Must be an integer between 1 and 30 (inclusive)

Invalid inputs will produce an error message and exit with code 1.

## CLI Flags

- `--json` - Output in JSON format

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

# JSON output
node dist/index.js 225 5 --json
```

## Project Structure

```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint
  │   └─ calc.ts             # Pure 1RM calculation function
  ├─ test/
  │   └─ calc.test.ts        # Unit tests for calculation
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
