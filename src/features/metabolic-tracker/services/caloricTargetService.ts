/**
 * Caloric target calculation per ADR-004 (Mifflin-St Jeor + PREDIMED-Plus).
 *
 * Amendment 2026-07-15: deficit is now CONDITIONAL on IMC > 25.
 * SPECS_RF RF-02: "Reducción automática de 600 kcal/día si el IMC > 25"
 * SPECS_TECH §2: "Trigger automático ante IMC > 25"
 */

export interface CaloricTargetInput {
  weight: number            // kg
  height: number            // cm
  age: number               // years
  gender: 'male' | 'female'
  /** WHO/FAO physical activity factor (1.2–1.9) */
  physicalActivityFactor: number
  /** kg/m² — pre-computed by caller (weight / height² in meters) */
  imc: number
}

export interface CaloricTargetOutput {
  bmr: number               // kcal/day
  tdee: number              // kcal/day
  deficit: number           // kcal/day (0 if IMC ≤ 25)
  target: number            // kcal/day (≥ 1200)
  restrictionActive: boolean // true when deficit > 0
}

function bmrMifflinStJeor(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

const SAFETY_FLOOR = 1200

export function computeCaloricTarget(input: CaloricTargetInput): CaloricTargetOutput {
  const { weight, height, age, gender, physicalActivityFactor, imc } = input

  const bmr = bmrMifflinStJeor(weight, height, age, gender)
  const tdee = Math.round(bmr * physicalActivityFactor)

  // SPECS_RF RF-02: deficit ONLY when IMC > 25
  const restrictionActive = imc > 25

  // PREDIMED-Plus: 600 kcal deficit, capped at 30% of TDEE for safety
  const rawDeficit = restrictionActive ? Math.min(600, Math.round(tdee * 0.3)) : 0

  const rawTarget = tdee - rawDeficit

  // Safety floor: never below 1200 kcal/day
  const target = Math.max(rawTarget, SAFETY_FLOOR)
  const deficit = tdee - target

  return { bmr, tdee, deficit, target, restrictionActive }
}
