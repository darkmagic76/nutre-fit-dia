/** WHO clinical IMC thresholds. */
export const IMC_UNDERWEIGHT = 18.5;
export const IMC_NORMAL_MAX = 25;
export const IMC_OVERWEIGHT = 30;

/**
 * Clinical IMC classification per WHO standards.
 * Formula: weight(kg) / (height(m))²
 */
export function computeIMC(weightKg: number, heightCm: number): number {
  return Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10;
}

export function isRestrictionCandidate(imc: number): boolean {
  return imc > IMC_NORMAL_MAX;
}
