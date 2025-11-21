import * as fs from 'fs';
import * as path from 'path';
import { Session } from './storage';

export interface ModelCoefficients {
  b0: number; // intercept
  b1: number; // weight coefficient
  b2: number; // reps coefficient
  b3: number; // sets coefficient
  b4: number; // bodyweight coefficient
  b5: number; // relativeStrength coefficient
  b6: number; // fatigue coefficient
  b7: number; // recovery coefficient
}

export interface TrainedModel {
  coefficients: ModelCoefficients;
  trainingDate: string;
  sessionCount: number;
  features: string[];
}

export interface PredictionInput {
  weight: number;
  reps: number;
  sets: number;
  bodyweight?: number | null;
  relativeStrength?: number | null;
  fatigue?: number | null;
  recovery?: number | null;
}

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const MODEL_FILE = path.resolve(DATA_DIR, 'model.json');

/**
 * Ensures the data directory exists, creating it if necessary.
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Prepares feature matrix and target vector from sessions for training.
 * Uses estimated1RM as the target variable (what we want to predict).
 */
function prepareTrainingData(sessions: Session[]): { X: number[][], y: number[] } {
  const X: number[][] = [];
  const y: number[] = [];

  for (const session of sessions) {
    // Skip sessions with missing required features
    if (!session.weight || !session.reps || !session.sets) {
      continue;
    }

    // Feature vector: [1, weight, reps, sets, bodyweight, relativeStrength, fatigue, recovery]
    const features = [
      1, // intercept term
      session.weight,
      session.reps,
      session.sets,
      session.bodyweight || 0, // use 0 if null/undefined
      session.relativeStrength || 0, // use 0 if null/undefined
      session.fatigue || 0, // use 0 if null/undefined
      session.recovery || 0 // use 0 if null/undefined
    ];

    X.push(features);
    y.push(session.estimated1RM); // target is the estimated 1RM
  }

  return { X, y };
}

/**
 * Performs simple linear regression using normal equations.
 * Returns coefficients for the linear model.
 */
function performLinearRegression(X: number[][], y: number[]): ModelCoefficients {
  const n = X.length;
  const p = X[0].length;

  if (n < p) {
    throw new Error(`Insufficient data: need at least ${p} samples, got ${n}`);
  }

  // Convert to matrices for calculation
  // X^T * X with ridge regularization
  const XtX: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += X[k][i] * X[k][j];
      }
      XtX[i][j] = sum;
    }
  }

  // Add ridge regularization to diagonal (helps with numerical stability)
  const lambda = 1e-6;
  for (let i = 0; i < p; i++) {
    XtX[i][i] += lambda;
  }

  // X^T * y
  const Xty: number[] = Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += X[k][i] * y[k];
    }
    Xty[i] = sum;
  }

  // Solve (X^T * X) * beta = X^T * y using Gaussian elimination
  const coeffs = solveLinearSystem(XtX, Xty);

  return {
    b0: coeffs[0], // intercept
    b1: coeffs[1], // weight
    b2: coeffs[2], // reps
    b3: coeffs[3], // sets
    b4: coeffs[4], // bodyweight
    b5: coeffs[5], // relativeStrength
    b6: coeffs[6], // fatigue
    b7: coeffs[7]  // recovery
  };
}

/**
 * Solves a linear system Ax = b using Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented: number[][] = [];

  // Create augmented matrix [A|b]
  for (let i = 0; i < n; i++) {
    augmented[i] = [...A[i], b[i]];
  }

  // Forward elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('Matrix is singular or nearly singular');
    }

    // Eliminate column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  // Back substitution
  const x: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }

  return x;
}

/**
 * Trains a linear regression model using the provided sessions.
 * Returns the trained model with coefficients.
 */
export function trainModel(sessions: Session[]): TrainedModel {
  if (sessions.length === 0) {
    throw new Error('Cannot train model: no sessions provided');
  }

  const { X, y } = prepareTrainingData(sessions);

  if (X.length === 0) {
    throw new Error('Cannot train model: no valid sessions with required features');
  }

  const coefficients = performLinearRegression(X, y);

  const model: TrainedModel = {
    coefficients,
    trainingDate: new Date().toISOString(),
    sessionCount: X.length,
    features: ['intercept', 'weight', 'reps', 'sets', 'bodyweight', 'relativeStrength', 'fatigue', 'recovery']
  };

  return model;
}

/**
 * Makes a prediction using the trained model and input features.
 */
export function predict(model: TrainedModel, input: PredictionInput): number {
  const { coefficients } = model;

  // Calculate relative strength if bodyweight is provided
  let relativeStrength = input.relativeStrength;
  if (relativeStrength === null || relativeStrength === undefined) {
    if (input.bodyweight && input.bodyweight > 0) {
      // Use Epley formula to estimate 1RM first, then calculate relative strength
      const estimated1RM = input.weight * (1 + input.reps / 30);
      relativeStrength = estimated1RM / input.bodyweight;
    } else {
      relativeStrength = 0;
    }
  }

  // Apply the linear model
  const prediction = 
    coefficients.b0 + // intercept
    coefficients.b1 * input.weight +
    coefficients.b2 * input.reps +
    coefficients.b3 * input.sets +
    coefficients.b4 * (input.bodyweight || 0) +
    coefficients.b5 * (relativeStrength || 0) +
    coefficients.b6 * (input.fatigue || 0) +
    coefficients.b7 * (input.recovery || 0);

  return Math.round(prediction);
}

/**
 * Saves a trained model to the model.json file.
 */
export function saveModel(model: TrainedModel): void {
  ensureDataDir();
  fs.writeFileSync(MODEL_FILE, JSON.stringify(model, null, 2), 'utf-8');
}

/**
 * Loads a trained model from the model.json file.
 * Returns null if the file doesn't exist or is invalid.
 */
export function loadModel(): TrainedModel | null {
  try {
    if (!fs.existsSync(MODEL_FILE)) {
      return null;
    }

    const content = fs.readFileSync(MODEL_FILE, 'utf-8');
    const model = JSON.parse(content);

    // Basic validation
    if (!model.coefficients || !model.trainingDate || !model.sessionCount) {
      return null;
    }

    return model as TrainedModel;
  } catch (error) {
    return null;
  }
}
