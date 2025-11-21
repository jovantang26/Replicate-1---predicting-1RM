# 1RM Prediction Project

## Chunk 7 — Model Training & Prediction

**Status:** ✅ Complete (v0.7.0)

Implements a lightweight linear regression model that uses all collected training data to predict true 1RM values. The model incorporates multiple features including weight, reps, sets, bodyweight, relative strength, fatigue, and recovery to provide more accurate predictions than the simple Epley formula.

### Features

- **Linear Regression Model**: Simple multi-feature regression using normal equations
- **Comprehensive Feature Set**: Uses weight, reps, sets, bodyweight, relative strength, fatigue, and recovery
- **Model Persistence**: Saves trained models to `data/model.json` for reuse
- **Training Command**: `--train` to build model from existing session data
- **Prediction Command**: `--predict` to make 1RM predictions using trained model
- **JSON Output Support**: Both training and prediction support JSON output
- **Robust Error Handling**: Validates data and provides clear error messages
- **Backward Compatibility**: Works with sessions from all previous chunks

### Model Architecture

The model uses a simple linear regression formula:

```
pred1RM = b0 + b1*weight + b2*reps + b3*sets + b4*bodyweight + b5*relativeStrength + b6*fatigue + b7*recovery
```

Where:
- `b0` = intercept coefficient
- `b1` = weight coefficient (positive - more weight = higher 1RM)
- `b2` = reps coefficient (typically negative - more reps = lower 1RM)
- `b3` = sets coefficient (positive - more sets = higher 1RM)
- `b4` = bodyweight coefficient (positive - heavier athletes typically stronger)
- `b5` = relative strength coefficient (positive - higher ratio = higher 1RM)
- `b6` = fatigue coefficient (negative - more fatigue = lower performance)
- `b7` = recovery coefficient (positive - better recovery = higher performance)

### Data Requirements

- **Minimum Sessions**: Requires at least 8 sessions with valid data for training
- **Required Features**: weight, reps, sets (must be > 0)
- **Optional Features**: bodyweight, relative strength, fatigue, recovery (treated as 0 if missing)
- **Target Variable**: Uses `estimated1RM` from existing sessions as training target

### CLI Usage

#### Train Model

```bash
# Train model using all available session data
node dist/index.js --train

# Train model with JSON output
node dist/index.js --train --json
```

#### Make Predictions

```bash
# Basic prediction (required: weight, reps)
node dist/index.js --predict --weight 225 --reps 4

# Prediction with all features
node dist/index.js --predict --weight 225 --reps 4 --sets 3 --bw 180 --fatigue 5 --recovery 7

# Prediction with JSON output
node dist/index.js --predict --weight 225 --reps 4 --bw 180 --json
```

#### Example Outputs

**Training Output:**
```
Model trained successfully!
Training sessions: 12
Training date: 11/21/2025, 6:15:23 PM
Model saved to: data/model.json

Coefficients:
  Intercept: 45.234
  Weight: 0.856
  Reps: -2.143
  Sets: 1.567
  Bodyweight: 0.089
  Relative Strength: 12.345
  Fatigue: -1.234
  Recovery: 0.987
```

**Prediction Output:**
```
Predicted 1RM: 267 lb

Input:
  Weight: 225 lb
  Reps: 4
  Sets: 3
  Bodyweight: 180 lb
  Fatigue: 5/10
  Recovery: 7/10

Model trained on 12 sessions (11/21/2025)
```

### Implementation Details

#### Training Process

1. **Data Preparation**: Extracts features from sessions, handles missing values
2. **Matrix Operations**: Constructs feature matrix X and target vector y
3. **Normal Equations**: Solves (X^T * X) * β = X^T * y using Gaussian elimination
4. **Model Storage**: Saves coefficients and metadata to `data/model.json`

#### Prediction Process

1. **Model Loading**: Loads trained model from `data/model.json`
2. **Feature Engineering**: Calculates relative strength if bodyweight provided
3. **Linear Combination**: Applies coefficients to input features
4. **Output Formatting**: Returns rounded integer prediction

#### Error Handling

- **No Data**: Clear error if no sessions available for training
- **Insufficient Data**: Requires minimum number of sessions for stable training
- **Missing Model**: Informative error if trying to predict without trained model
- **Invalid Input**: Validates required parameters for prediction
- **Singular Matrix**: Handles cases where normal equations cannot be solved

### File Structure

- **`src/model.ts`**: Core model training and prediction logic
- **`data/model.json`**: Persisted trained model (auto-created)
- **`test/model.test.ts`**: Comprehensive test suite for model functionality

### Testing

The model implementation includes extensive tests:

- **Training Tests**: Validates model training with various data scenarios
- **Prediction Tests**: Tests prediction accuracy with known coefficients
- **Edge Cases**: Handles missing features, invalid data, and error conditions
- **Persistence Tests**: Verifies model saving and loading functionality

Run model tests:

```bash
npm test test/model.test.ts
```

### Mathematical Foundation
---

## Chunk 7 — Model Training & Prediction

**Status:** ✅ Complete (v0.7.0)

Implements a lightweight linear regression model that uses all collected training data to predict true 1RM values. The model incorporates multiple features including weight, reps, sets, bodyweight, relative strength, fatigue, and recovery to provide more accurate predictions than the simple Epley formula.

### Features

- **Linear Regression Model**: Simple multi-feature regression using normal equations
- **Comprehensive Feature Set**: Uses weight, reps, sets, bodyweight, relative strength, fatigue, and recovery
- **Model Persistence**: Saves trained models to `data/model.json` for reuse
- **Training Command**: `--train` to build model from existing session data
- **Prediction Command**: `--predict` to make 1RM predictions using trained model
- **JSON Output Support**: Both training and prediction support JSON output
- **Robust Error Handling**: Validates data and provides clear error messages
- **Backward Compatibility**: Works with sessions from all previous chunks

### Model Architecture

The model uses a simple linear regression formula:

```
pred1RM = b0 + b1*weight + b2*reps + b3*sets + b4*bodyweight + b5*relativeStrength + b6*fatigue + b7*recovery
```

Where:
- `b0` = intercept coefficient
- `b1` = weight coefficient (positive - more weight = higher 1RM)
- `b2` = reps coefficient (typically negative - more reps = lower 1RM)
- `b3` = sets coefficient (positive - more sets = higher 1RM)
- `b4` = bodyweight coefficient (positive - heavier athletes typically stronger)
- `b5` = relative strength coefficient (positive - higher ratio = higher 1RM)
- `b6` = fatigue coefficient (negative - more fatigue = lower performance)
- `b7` = recovery coefficient (positive - better recovery = higher performance)

### CLI Usage

#### Train Model

```bash
# Train model using all available session data
node dist/index.js --train

# Train model with JSON output
node dist/index.js --train --json
```

#### Make Predictions

```bash
# Basic prediction (required: weight, reps)
node dist/index.js --predict --weight 225 --reps 4

# Prediction with all features
node dist/index.js --predict --weight 225 --reps 4 --sets 3 --bw 180 --fatigue 5 --recovery 7

# Prediction with JSON output
node dist/index.js --predict --weight 225 --reps 4 --bw 180 --json
```

#### Example Outputs

**Training Output:**
```
Model trained successfully!
Training sessions: 12
Training date: 11/21/2025, 6:15:23 PM
Model saved to: data/model.json

Coefficients:
  Intercept: 45.234
  Weight: 0.856
  Reps: -2.143
  Sets: 1.567
  Bodyweight: 0.089
  Relative Strength: 12.345
  Fatigue: -1.234
  Recovery: 0.987
```

**Prediction Output:**
```
Predicted 1RM: 267 lb

Input:
  Weight: 225 lb
  Reps: 4
  Sets: 3
  Bodyweight: 180 lb
  Fatigue: 5/10
  Recovery: 7/10

Model trained on 12 sessions (11/21/2025)
```

### Implementation Details

- **Training Process**: Uses normal equations with ridge regularization for numerical stability
- **Feature Engineering**: Automatically calculates relative strength if bodyweight provided
- **Model Storage**: Persists coefficients and metadata to `data/model.json`
- **Error Handling**: Comprehensive validation and informative error messages

### Mathematical Foundation

Uses **Ordinary Least Squares (OLS)** regression with ridge regularization:

```
β = (X^T * X + λI)^(-1) * X^T * y
```

Where λ is a small regularization parameter for numerical stability.

### Advantages Over Epley Formula

1. **Multi-Feature**: Considers more than just weight and reps
2. **Personalized**: Adapts to individual training patterns
3. **Context-Aware**: Accounts for fatigue, recovery, and training state
4. **Data-Driven**: Learns from actual performance data
5. **Continuous Improvement**: Accuracy improves with more training data

---

## Development

### Setup

```bash
npm install
```

The model uses **Ordinary Least Squares (OLS)** regression solved via normal equations:

```
β = (X^T * X)^(-1) * X^T * y
```

Where:
- `X` = feature matrix (n×p) with intercept column
- `y` = target vector (n×1) of estimated 1RM values
- `β` = coefficient vector (p×1) to be estimated
- `n` = number of training sessions
- `p` = number of features (8 including intercept)

### Advantages Over Epley Formula

1. **Multi-Feature**: Considers more than just weight and reps
2. **Personalized**: Adapts to individual training patterns and characteristics
3. **Context-Aware**: Accounts for fatigue, recovery, and training state
4. **Data-Driven**: Learns from actual performance data rather than population averages
5. **Continuous Improvement**: Model accuracy improves with more training data

### Future Enhancements

- **Cross-Validation**: Implement k-fold validation for model evaluation
- **Feature Selection**: Automatic selection of most predictive features
- **Regularization**: Ridge/Lasso regression to prevent overfitting
- **Non-Linear Models**: Polynomial features or more advanced algorithms
- **Model Evaluation**: R², RMSE, and other performance metrics

### Dependencies
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

# Save with fatigue and recovery (Chunk 5)
node dist/index.js 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --fatigue 6 --recovery 4 --save

# View fatigue trend analysis (Chunk 5)
node dist/index.js --fatigue-trend

# View long-term trend analysis (Chunk 6)
node dist/index.js --trend

# Train model (Chunk 7)
node dist/index.js --train

# Make prediction (Chunk 7)
node dist/index.js --predict --weight 225 --reps 4 --bw 180
```

- Uses existing session data from Chunks 1-6
- Compatible with all previous functionality
- No external ML libraries required (pure TypeScript implementation)
- Integrates seamlessly with existing CLI commands

### Data Privacy

- All model training occurs locally
- No data transmitted to external services
- Model files stored in local `data/` directory
- Complete control over training data and model usage
```
1rm-calculator/
  ├─ src/
  │   ├─ index.ts            # CLI entrypoint (Chunks 1-5)
  │   ├─ calc.ts             # Pure 1RM calculation function (Chunk 1)
  │   ├─ storage.ts           # Session persistence and history (Chunk 2, extended in Chunks 4-5)
  │   ├─ weekly.ts            # Weekly analysis and top set detection (Chunk 3)
  │   ├─ rel.ts               # Relative strength calculation (Chunk 4)
  │   ├─ fatigue.ts           # Fatigue/recovery calculation (Chunk 5)
  │   ├─ trend.ts             # Long-term trend analysis (Chunk 6)
  │   └─ model.ts             # Model training and prediction (Chunk 7)
  ├─ test/
  │   ├─ calc.test.ts        # Unit tests for calculation (Chunk 1)
  │   ├─ storage.test.ts     # Tests for structured sessions and CLI (Chunk 2, extended in Chunks 4-5)
  │   ├─ weekly.test.ts      # Tests for weekly analysis (Chunk 3)
  │   ├─ rel.test.ts         # Tests for relative strength (Chunk 4)
  │   ├─ fatigue.test.ts     # Tests for fatigue/recovery (Chunk 5)
  │   ├─ trend.test.ts       # Tests for long-term trend analysis (Chunk 6)
  │   └─ model.test.ts       # Tests for model training and prediction (Chunk 7)
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

- **v0.5.0** - Chunk 5: Fatigue & Recovery Index
  - Fatigue and recovery scoring (0-10 scale)
  - Adjusted 1RM calculation with performance modifiers
  - New `--fatigue` and `--recovery` flags
  - New `--fatigue-trend` command for analysis
  - Backward compatibility with existing sessions
  - 32 additional tests (91 total)

- **v0.6.0** - Chunk 6: Long-Term Trend Analysis
  - Moving average calculations (3-week and 5-week)
  - Rate of change (delta) between consecutive weeks
  - New `--trend` command for trend visualization
  - Uses weekly summaries from Chunk 3
  - Proper handling of insufficient data points
  - 12 additional tests (103 total)

- **v0.7.0** - Chunk 7: Model Training & Prediction
  - Linear regression model using normal equations
  - Multi-feature prediction (weight, reps, sets, bodyweight, relative strength, fatigue, recovery)
  - Model persistence to `data/model.json`
  - New `--train` and `--predict` commands
  - Ridge regularization for numerical stability
  - Comprehensive error handling and validation
  - 13 additional tests (116 total)

## License

MIT
