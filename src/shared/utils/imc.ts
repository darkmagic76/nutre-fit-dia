/**
 * Clinical IMC classification per WHO standards.
 * Formula: weight(kg) / (height(m))²
 */
export function computeIMC(weightKg: number, heightCm: number): number {
  return Math.round((weightKg / ((heightCm / 100) ** 2)) * 10) / 10
}

export function imcClassification(imc: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
  if (imc < 18.5) return 'underweight'
  if (imc < 25) return 'normal'
  if (imc < 30) return 'overweight'
  return 'obese'
}

export function isRestrictionCandidate(imc: number): boolean {
  return imc > 25
}
