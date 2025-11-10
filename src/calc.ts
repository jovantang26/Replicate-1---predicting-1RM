/**
 * Calculates estimated 1RM using the Epley formula: weight * (1 + reps/30)
 * 
 * @param weight - The weight lifted (must be positive)
 * @param reps - The number of reps performed (must be integer between 1 and 30)
 * @returns The estimated 1RM rounded to the nearest pound
 * @throws Error if weight or reps are invalid
 */
export function estimate1RM(weight: number, reps: number): number {
  // Validate weight
  if (weight <= 0 || !isFinite(weight)) {
    throw new Error('Weight must be a positive number');
  }

  // Validate reps
  if (!Number.isInteger(reps)) {
    throw new Error('Reps must be an integer');
  }

  if (reps < 1) {
    throw new Error('Reps must be at least 1');
  }

  if (reps > 30) {
    throw new Error('Reps must be at most 30');
  }

  // If reps === 1, return weight as true 1RM
  if (reps === 1) {
    return Math.round(weight);
  }

  // Apply Epley formula: weight * (1 + reps/30)
  const estimated = weight * (1 + reps / 30);
  return Math.round(estimated);
}

