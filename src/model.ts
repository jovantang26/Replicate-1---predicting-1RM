import * as fs from 'fs';
import * as path from 'path';
import { Session, isChestExercise } from './storage';

export interface ModelCoefficients {
  b0: number; // intercept
  b1: number; // weight coefficient
  b2: number; // reps coefficient
  b3: number; // sets coefficient
  b4: number; // bodyweight coefficient
  b5: number; // relativeStrength coefficient
  b6: number; // fatigue coefficient
  b7: number; // recovery coefficient
  b8: number; // flatBench coefficient
  b9: number; // incline coefficient
  b10: number; // smithIncline coefficient
  b11: number; // flye coefficient
  b12: number; // machinePress coefficient
  b13: number; // dips coefficient
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
 * Extracts chest exercise variation features from a session.
 * Returns features for: flat bench, incline bench, smith incline, flyes, machine press, dips
 */
function extractChestVariationFeatures(session: Session): number[] {
  const name = session.exerciseName.toLowerCase();
  const type = session.exerciseType.toLowerCase();
  
  // Flat barbell bench (baseline)
  const isFlatBench = (name.includes('bench_press') || name.includes('bench press') || 
                       name.includes('flat_barbell_bench') || name.includes('flat barbell bench') ||
                       (name.includes('bench') && type === 'barbell' && !name.includes('incline'))) ? 1 : 0;
  
  // Incline variations
  const isIncline = (name.includes('incline_bench') || name.includes('incline bench') ||
                     name.includes('incline_barbell_bench') || name.includes('incline barbell bench')) ? 1 : 0;
  
  // Smith incline
  const isSmithIncline = (name.includes('incline_smith') || name.includes('incline smith') ||
                          name.includes('smith_incline_bench') || name.includes('smith incline bench')) ? 1 : 0;
  
  // Flyes
  const isFlye = (name.includes('chest_fly') || name.includes('chest fly') ||
                  name.includes('cable_fly') || name.includes('cable fly') ||
                  name.includes('machine_fly') || name.includes('machine fly') ||
                  name.includes('flye') || name.includes('fly')) ? 1 : 0;
  
  // Machine chest press
  const isMachinePress = (name.includes('machine_chest_press') || name.includes('machine chest press') ||
                          (name.includes('chest_press') && type === 'machine') ||
                          (name.includes('chest press') && type === 'machine')) ? 1 : 0;
  
  // Weighted dips
  const isDips = (name.includes('weighted_dips') || name.includes('weighted dips') ||
                  (name.includes('dips') && session.weight > 0)) ? 1 : 0;
  
  return [isFlatBench, isIncline, isSmithIncline, isFlye, isMachinePress, isDips];
}

/**
 * Prepares feature matrix and target vector from sessions for training.
 * Chunk 7 Fix: Uses true1RM when available, falls back to estimated1RM.
 * Only includes chest exercises and adds chest variation features.
 */
function prepareTrainingData(sessions: Session[]): { X: number[][], y: number[] } {
  const X: number[][] = [];
  const y: number[] = [];

  // Chunk 7 Fix: Filter for chest-only exercises
  const chestSessions = sessions.filter(isChestExercise);

  for (const session of chestSessions) {
    // Skip sessions with missing required features
    if (!session.weight || !session.reps || !session.sets) {
      continue;
    }

    // Chunk 7 Fix: Use true1RM when available, fallback to estimated1RM
    const target = session.true1RM ?? session.estimated1RM;
    
    // Extract chest variation features
    const chestVariations = extractChestVariationFeatures(session);
    
    // Feature vector: [1, weight, reps, sets, bodyweight, relativeStrength, fatigue, recovery, 
    //                  flatBench, incline, smithIncline, flye, machinePress, dips]
    const features = [
      1, // intercept term
      session.weight,
      session.reps,
      session.sets,
      session.bodyweight || 0, // use 0 if null/undefined
      session.relativeStrength || 0, // use 0 if null/undefined
      session.fatigue || 0, // use 0 if null/undefined
      session.recovery || 0, // use 0 if null/undefined
      ...chestVariations // Add chest variation features
    ];

    X.push(features);
    y.push(target); // Chunk 7 Fix: Use true1RM when available
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
    b7: coeffs[7], // recovery
    b8: coeffs[8], // flatBench
    b9: coeffs[9], // incline
    b10: coeffs[10], // smithIncline
    b11: coeffs[11], // flye
    b12: coeffs[12], // machinePress
    b13: coeffs[13]  // dips
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
    features: ['intercept', 'weight', 'reps', 'sets', 'bodyweight', 'relativeStrength', 'fatigue', 'recovery',
               'flatBench', 'incline', 'smithIncline', 'flye', 'machinePress', 'dips']
  };

  return model;
}

/**
 * Makes a prediction using the trained model and input features.
 * Chunk 7 Fix: Includes chest variation features in prediction.
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

  // Extract chest variation features (default to flat bench if not specified)
  // Note: In practice, you'd pass exercise name/type, but for backward compatibility
  // we default to flat bench (all features 0 except flatBench = 1)
  const chestVariations = [1, 0, 0, 0, 0, 0]; // [flatBench, incline, smithIncline, flye, machinePress, dips]

  // Apply the linear model with chest variation features
  // Backward compatibility: check if new coefficients exist (old models won't have them)
  let prediction = 
    coefficients.b0 + // intercept
    coefficients.b1 * input.weight +
    coefficients.b2 * input.reps +
    coefficients.b3 * input.sets +
    coefficients.b4 * (input.bodyweight || 0) +
    coefficients.b5 * (relativeStrength || 0) +
    coefficients.b6 * (input.fatigue || 0) +
    coefficients.b7 * (input.recovery || 0);
  
  // Add chest variation features if available (new models)
  if ('b8' in coefficients) {
    prediction += 
      (coefficients.b8 || 0) * chestVariations[0] + // flatBench
      (coefficients.b9 || 0) * chestVariations[1] + // incline
      (coefficients.b10 || 0) * chestVariations[2] + // smithIncline
      (coefficients.b11 || 0) * chestVariations[3] + // flye
      (coefficients.b12 || 0) * chestVariations[4] + // machinePress
      (coefficients.b13 || 0) * chestVariations[5]; // dips
  }

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
