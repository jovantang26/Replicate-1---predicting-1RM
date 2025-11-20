/**
 * Computes relative strength as the ratio of estimated 1RM to bodyweight.
 * Returns null if bodyweight is missing, invalid, or zero.
 */
export function computeRelativeStrength(estimated1RM: number, bw?: number | null): number | null {
  if (bw === undefined || bw === null || bw <= 0 || isNaN(bw)) {
    return null;
  }
  
  if (estimated1RM <= 0 || isNaN(estimated1RM)) {
    return null;
  }
  
  return estimated1RM / bw;
}

/**
 * Classifies strength ratio into categories:
 * - < 1.0 → "novice"
 * - 1.0–1.49 → "intermediate"
 * - 1.5–1.99 → "advanced"
 * - ≥ 2.0 → "elite"
 * Returns undefined if ratio is null or invalid.
 */
export function classifyStrengthRatio(ratio: number | null): string | undefined {
  if (ratio === null || isNaN(ratio) || ratio < 0) {
    return undefined;
  }
  
  if (ratio < 1.0) {
    return 'novice';
  } else if (ratio < 1.5) {
    return 'intermediate';
  } else if (ratio < 2.0) {
    return 'advanced';
  } else {
    return 'elite';
  }
}

