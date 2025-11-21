import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { trainModel, predict, saveModel, loadModel, TrainedModel, PredictionInput } from '../src/model';
import { Session } from '../src/storage';

describe('Model Training and Prediction', () => {
  const testDataDir = path.resolve(__dirname, '..', 'test-data');
  const testModelFile = path.resolve(testDataDir, 'model.json');

  beforeEach(() => {
    // Create test data directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testModelFile)) {
      fs.unlinkSync(testModelFile);
    }
    if (fs.existsSync(testDataDir)) {
      try {
        fs.rmSync(testDataDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('trainModel', () => {
    it('should throw error with no sessions', () => {
      expect(() => trainModel([])).toThrow('Cannot train model: no sessions provided');
    });

    it('should throw error with sessions missing required features', () => {
      const sessions: Session[] = [
        {
          date: '2025-01-01T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 0, // invalid
          weight: 0, // invalid
          reps: 0, // invalid
          estimated1RM: 225,
          method: 'epley'
        }
      ];

      expect(() => trainModel(sessions)).toThrow('Cannot train model: no valid sessions with required features');
    });

    it('should train model with valid sessions', () => {
      const sessions: Session[] = [
        {
          date: '2025-01-01T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 3,
          weight: 225,
          reps: 5,
          estimated1RM: 263,
          method: 'epley',
          bodyweight: 180,
          relativeStrength: 1.46,
          fatigue: 5,
          recovery: 7
        },
        {
          date: '2025-01-02T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 4,
          weight: 230,
          reps: 4,
          estimated1RM: 261,
          method: 'epley',
          bodyweight: 175,
          relativeStrength: 1.49,
          fatigue: 6,
          recovery: 6
        },
        {
          date: '2025-01-03T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 5,
          weight: 235,
          reps: 3,
          estimated1RM: 259,
          method: 'epley',
          bodyweight: 185,
          relativeStrength: 1.40,
          fatigue: 4,
          recovery: 8
        },
        {
          date: '2025-01-04T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 3,
          weight: 240,
          reps: 2,
          estimated1RM: 256,
          method: 'epley',
          bodyweight: 190,
          relativeStrength: 1.35,
          fatigue: 3,
          recovery: 9
        },
        {
          date: '2025-01-05T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 4,
          weight: 245,
          reps: 1,
          estimated1RM: 245,
          method: 'epley',
          bodyweight: 170,
          relativeStrength: 1.44,
          fatigue: 2,
          recovery: 10
        },
        {
          date: '2025-01-06T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 5,
          weight: 220,
          reps: 6,
          estimated1RM: 264,
          method: 'epley',
          bodyweight: 165,
          relativeStrength: 1.60,
          fatigue: 7,
          recovery: 5
        },
        {
          date: '2025-01-07T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 6,
          weight: 250,
          reps: 1,
          estimated1RM: 250,
          method: 'epley',
          bodyweight: 195,
          relativeStrength: 1.28,
          fatigue: 1,
          recovery: 10
        },
        {
          date: '2025-01-08T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 3,
          weight: 215,
          reps: 7,
          estimated1RM: 265,
          method: 'epley',
          bodyweight: 160,
          relativeStrength: 1.66,
          fatigue: 8,
          recovery: 4
        }
      ];

      const model = trainModel(sessions);

      expect(model).toBeDefined();
      expect(model.coefficients).toBeDefined();
      expect(model.sessionCount).toBe(8);
      expect(model.trainingDate).toBeDefined();
      expect(model.features).toEqual(['intercept', 'weight', 'reps', 'sets', 'bodyweight', 'relativeStrength', 'fatigue', 'recovery']);

      // Check that coefficients are numbers
      expect(typeof model.coefficients.b0).toBe('number');
      expect(typeof model.coefficients.b1).toBe('number');
      expect(typeof model.coefficients.b2).toBe('number');
      expect(typeof model.coefficients.b3).toBe('number');
      expect(typeof model.coefficients.b4).toBe('number');
      expect(typeof model.coefficients.b5).toBe('number');
      expect(typeof model.coefficients.b6).toBe('number');
      expect(typeof model.coefficients.b7).toBe('number');

      // Check that coefficients are finite (not NaN or Infinity)
      expect(Number.isFinite(model.coefficients.b0)).toBe(true);
      expect(Number.isFinite(model.coefficients.b1)).toBe(true);
      expect(Number.isFinite(model.coefficients.b2)).toBe(true);
      expect(Number.isFinite(model.coefficients.b3)).toBe(true);
      expect(Number.isFinite(model.coefficients.b4)).toBe(true);
      expect(Number.isFinite(model.coefficients.b5)).toBe(true);
      expect(Number.isFinite(model.coefficients.b6)).toBe(true);
      expect(Number.isFinite(model.coefficients.b7)).toBe(true);
    });

    it('should handle sessions with missing optional features', () => {
      const sessions: Session[] = [
        {
          date: '2025-01-01T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 3,
          weight: 225,
          reps: 5,
          estimated1RM: 263,
          method: 'epley'
          // missing bodyweight, relativeStrength, fatigue, recovery
        },
        {
          date: '2025-01-02T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 4,
          weight: 230,
          reps: 4,
          estimated1RM: 261,
          method: 'epley',
          bodyweight: 175
          // missing relativeStrength, fatigue, recovery
        },
        {
          date: '2025-01-03T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 5,
          weight: 235,
          reps: 3,
          estimated1RM: 259,
          method: 'epley',
          bodyweight: 185,
          relativeStrength: 1.40,
          fatigue: 4,
          recovery: 8
        },
        {
          date: '2025-01-04T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 6,
          weight: 240,
          reps: 2,
          estimated1RM: 256,
          method: 'epley',
          bodyweight: null,
          relativeStrength: null,
          fatigue: null,
          recovery: null
        },
        {
          date: '2025-01-05T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 4,
          weight: 245,
          reps: 1,
          estimated1RM: 245,
          method: 'epley',
          bodyweight: 170,
          relativeStrength: 1.44,
          fatigue: 2,
          recovery: 10
        },
        {
          date: '2025-01-06T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 5,
          weight: 220,
          reps: 6,
          estimated1RM: 264,
          method: 'epley',
          bodyweight: 165,
          relativeStrength: 1.60,
          fatigue: 7,
          recovery: 5
        },
        {
          date: '2025-01-07T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 6,
          weight: 250,
          reps: 1,
          estimated1RM: 250,
          method: 'epley',
          bodyweight: 195,
          relativeStrength: 1.28,
          fatigue: 1,
          recovery: 10
        },
        {
          date: '2025-01-08T00:00:00.000Z',
          exerciseName: 'bench_press',
          exerciseType: 'barbell',
          sets: 3,
          weight: 215,
          reps: 7,
          estimated1RM: 265,
          method: 'epley',
          bodyweight: 160,
          relativeStrength: 1.66,
          fatigue: 8,
          recovery: 4
        }
      ];

      const model = trainModel(sessions);

      expect(model).toBeDefined();
      expect(model.sessionCount).toBe(8);
      expect(Number.isFinite(model.coefficients.b0)).toBe(true);
      expect(Number.isFinite(model.coefficients.b1)).toBe(true);
      expect(Number.isFinite(model.coefficients.b2)).toBe(true);
      expect(Number.isFinite(model.coefficients.b3)).toBe(true);
      expect(Number.isFinite(model.coefficients.b4)).toBe(true);
      expect(Number.isFinite(model.coefficients.b5)).toBe(true);
      expect(Number.isFinite(model.coefficients.b6)).toBe(true);
      expect(Number.isFinite(model.coefficients.b7)).toBe(true);
    });
  });

  describe('predict', () => {
    let testModel: TrainedModel;

    beforeEach(() => {
      // Create a simple test model with known coefficients
      testModel = {
        coefficients: {
          b0: 50,  // intercept
          b1: 0.8, // weight coefficient
          b2: -2,  // reps coefficient (negative because more reps = lower 1RM)
          b3: 1,   // sets coefficient
          b4: 0.1, // bodyweight coefficient
          b5: 10,  // relativeStrength coefficient
          b6: -1,  // fatigue coefficient (negative because fatigue reduces performance)
          b7: 1    // recovery coefficient (positive because recovery improves performance)
        },
        trainingDate: '2025-01-01T00:00:00.000Z',
        sessionCount: 10,
        features: ['intercept', 'weight', 'reps', 'sets', 'bodyweight', 'relativeStrength', 'fatigue', 'recovery']
      };
    });

    it('should make prediction with all features', () => {
      const input: PredictionInput = {
        weight: 225,
        reps: 5,
        sets: 3,
        bodyweight: 180,
        relativeStrength: 1.46,
        fatigue: 5,
        recovery: 7
      };

      const prediction = predict(testModel, input);

      // Expected: 50 + 0.8*225 + (-2)*5 + 1*3 + 0.1*180 + 10*1.46 + (-1)*5 + 1*7
      // = 50 + 180 - 10 + 3 + 18 + 14.6 - 5 + 7 = 257.6 ≈ 258
      expect(prediction).toBe(258);
    });

    it('should make prediction with minimal features', () => {
      const input: PredictionInput = {
        weight: 225,
        reps: 5,
        sets: 3
      };

      const prediction = predict(testModel, input);

      // Expected: 50 + 0.8*225 + (-2)*5 + 1*3 + 0.1*0 + 10*0 + (-1)*0 + 1*0
      // = 50 + 180 - 10 + 3 = 223
      expect(prediction).toBe(223);
    });

    it('should calculate relative strength when bodyweight is provided but relativeStrength is not', () => {
      const input: PredictionInput = {
        weight: 225,
        reps: 5,
        sets: 3,
        bodyweight: 180,
        relativeStrength: null
      };

      const prediction = predict(testModel, input);

      // Relative strength should be calculated as: estimated1RM / bodyweight
      // estimated1RM from Epley: 225 * (1 + 5/30) = 225 * 1.167 = 262.5
      // relativeStrength = 262.5 / 180 = 1.458
      // Expected: 50 + 0.8*225 + (-2)*5 + 1*3 + 0.1*180 + 10*1.458 + (-1)*0 + 1*0
      // = 50 + 180 - 10 + 3 + 18 + 14.58 = 255.58 ≈ 256
      expect(prediction).toBe(256);
    });

    it('should handle null/undefined optional features', () => {
      const input: PredictionInput = {
        weight: 225,
        reps: 5,
        sets: 3,
        bodyweight: null,
        relativeStrength: undefined,
        fatigue: null,
        recovery: undefined
      };

      const prediction = predict(testModel, input);

      // Expected: 50 + 0.8*225 + (-2)*5 + 1*3 + 0.1*0 + 10*0 + (-1)*0 + 1*0
      // = 50 + 180 - 10 + 3 = 223
      expect(prediction).toBe(223);
    });

    it('should return rounded prediction', () => {
      const input: PredictionInput = {
        weight: 222.5, // This will create a non-integer result
        reps: 5,
        sets: 3
      };

      const prediction = predict(testModel, input);

      // Expected: 50 + 0.8*222.5 + (-2)*5 + 1*3 = 50 + 178 - 10 + 3 = 221
      expect(prediction).toBe(221);
      expect(Number.isInteger(prediction)).toBe(true);
    });
  });

  describe('saveModel and loadModel', () => {
    it('should save and load model correctly', () => {
      const originalModel: TrainedModel = {
        coefficients: {
          b0: 50,
          b1: 0.8,
          b2: -2,
          b3: 1,
          b4: 0.1,
          b5: 10,
          b6: -1,
          b7: 1
        },
        trainingDate: '2025-01-01T00:00:00.000Z',
        sessionCount: 10,
        features: ['intercept', 'weight', 'reps', 'sets', 'bodyweight', 'relativeStrength', 'fatigue', 'recovery']
      };

      // Ensure data directory exists
      const dataDir = path.resolve(__dirname, '..', 'data');
      const originalModelFile = path.resolve(dataDir, 'model.json');
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Save model
      saveModel(originalModel);

      // Load model
      const loadedModel = loadModel();

      expect(loadedModel).not.toBeNull();
      expect(loadedModel!.coefficients).toEqual(originalModel.coefficients);
      expect(loadedModel!.trainingDate).toBe(originalModel.trainingDate);
      expect(loadedModel!.sessionCount).toBe(originalModel.sessionCount);
      expect(loadedModel!.features).toEqual(originalModel.features);

      // Clean up
      if (fs.existsSync(originalModelFile)) {
        fs.unlinkSync(originalModelFile);
      }
    });

    it('should return null when model file does not exist', () => {
      const model = loadModel();
      expect(model).toBeNull();
    });

    it('should return null when model file is invalid JSON', () => {
      const modelFile = path.resolve(__dirname, '..', 'data', 'model.json');
      const dataDir = path.resolve(__dirname, '..', 'data');
      
      // Create data directory and invalid model file
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(modelFile, 'invalid json', 'utf-8');

      const model = loadModel();
      expect(model).toBeNull();

      // Clean up
      if (fs.existsSync(modelFile)) {
        fs.unlinkSync(modelFile);
      }
    });

    it('should return null when model file has invalid structure', () => {
      const modelFile = path.resolve(__dirname, '..', 'data', 'model.json');
      const dataDir = path.resolve(__dirname, '..', 'data');
      
      // Create data directory and invalid model file
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(modelFile, JSON.stringify({ invalid: 'structure' }), 'utf-8');
      } catch (error) {
        // If we can't write to the file system, skip this test
        console.log('Skipping test due to file system access issue:', error);
        return;
      }

      const model = loadModel();
      expect(model).toBeNull();

      // Clean up
      if (fs.existsSync(modelFile)) {
        fs.unlinkSync(modelFile);
      }
    });
  });
});
