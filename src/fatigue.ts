/**
 * Calculates the recovery modifier based on recovery score (0-10).
 * Formula: 1 + (recovery - 5) * 0.02
 * - Recovery 5 = no modifier (1.0)
 * - Recovery 10 = +10% modifier (1.1)
 * - Recovery 0 = -10% modifier (0.9)
 */
export function calculateRecoveryModifier(recovery?: number | null): number {
  if (recovery === undefined || recovery === null || isNaN(recovery)) {
    return 1.0; // No modifier if recovery not provided
  }
  
  // Clamp recovery to 0-10 range
  const clampedRecovery = Math.max(0, Math.min(10, recovery));
  return 1 + (clampedRecovery - 5) * 0.02;
}

/**
 * Calculates the fatigue penalty based on fatigue score (0-10).
 * Formula: fatigue * 0.5
 * - Fatigue 0 = no penalty (0)
 * - Fatigue 10 = -5 lb penalty
 */
export function calculateFatiguePenalty(fatigue?: number | null): number {
  if (fatigue === undefined || fatigue === null || isNaN(fatigue)) {
    return 0; // No penalty if fatigue not provided
  }
  
  // Clamp fatigue to 0-10 range
  const clampedFatigue = Math.max(0, Math.min(10, fatigue));
  return clampedFatigue * 0.5;
}

/**
 * Calculates adjusted 1RM based on estimated 1RM, recovery, and fatigue.
 * Formula: adjusted1RM = estimated1RM * recoveryModifier - fatiguePenalty
 * Returns null if estimated1RM is invalid.
 */
export function calculateAdjusted1RM(
  estimated1RM: number,
  recovery?: number | null,
  fatigue?: number | null
): number | null {
  if (isNaN(estimated1RM) || estimated1RM <= 0) {
    return null;
  }
  
  const recoveryModifier = calculateRecoveryModifier(recovery);
  const fatiguePenalty = calculateFatiguePenalty(fatigue);
  
  const adjusted = estimated1RM * recoveryModifier - fatiguePenalty;
  return Math.round(adjusted); // Round to nearest pound
}

/**
 * Validates that a fatigue or recovery score is in the valid range (0-10).
 */
export function validateFatigueRecoveryScore(score: number): boolean {
  return !isNaN(score) && score >= 0 && score <= 10;
}
