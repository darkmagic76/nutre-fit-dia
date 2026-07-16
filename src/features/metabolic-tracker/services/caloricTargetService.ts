import type { UserMetrics } from '@shared/domain'

/**
 * Caloric target calculation per ADR-004 (Mifflin-St Jeor + PREDIMED-Plus).
 *
 * Amendment 2026-07-15: deficit is now CONDITIONAL on IMC > 25.
 * SPECS_RF RF-02: "Reducción automática de 600 kcal/día si el IMC > 25"
 * SPECS_TECH §2: "Trigger automático ante IMC > 25"
 */

export type CaloricTargetInput = UserMetrics

export interface CaloricTargetOutput {
  bmr: number               // kcal/day
  tdee: number              // kcal/day
  deficit: number           // kcal/day (0 if IMC ≤ 25)
  target: number            // kcal/day (≥ 1200)
  restrictionActive: boolean // true when deficit > 0
}

function bmrMifflinStJeor({ weight, height, age, gender }: UserMetrics): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

const SAFETY_FLOOR = 1200
/** PREDIMED-Plus intensive intervention: 600 kcal daily deficit */
const PREDIMED_PLUS_DEFICIT_KCAL = 600
/** Safety cap: deficit must not exceed 30% of TDEE per SPECS_TECH §2 */
const DEFICIT_CAP_RATIO = 0.3

export function computeCaloricTarget(input: CaloricTargetInput): CaloricTargetOutput {
  const { physicalActivityFactor, imc } = input

  const bmr = bmrMifflinStJeor(input)
  const tdee = Math.round(bmr * physicalActivityFactor)

  // SPECS_RF RF-02: deficit ONLY when IMC > 25
  const restrictionActive = imc > 25

  // PREDIMED-Plus: 600 kcal deficit, capped at 30% of TDEE for safety
  const rawDeficit = restrictionActive
    ? Math.min(PREDIMED_PLUS_DEFICIT_KCAL, Math.round(tdee * DEFICIT_CAP_RATIO))
    : 0

  const rawTarget = tdee - rawDeficit

  // Safety floor: never below 1200 kcal/day
  const target = Math.max(rawTarget, SAFETY_FLOOR)
  const deficit = tdee - target

  return { bmr, tdee, deficit, target, restrictionActive }
}
