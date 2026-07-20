import type { UserMetrics } from '@shared/domain'
import { isRestrictionCandidate } from '@shared/utils'

/**
 * Caloric target calculation per ADR-004 (Mifflin-St Jeor + PREDIMED-Plus).
 *
 * Amendment 2026-07-15: deficit is now CONDITIONAL on IMC > 25.
 * SPECS_RF RF-02: "Reducción automática de 600 kcal/día si el IMC > 25"
 * SPECS_TECH §2: "Trigger automático ante IMC > 25"
 *
 * diagnosisAge is stored for downstream phenotypic filtering (FR-4.1).
 * It does not alter the MSJ formula itself.
 */

export type CaloricTargetInput = UserMetrics

export interface CaloricTargetOutput {
  bmr: number               // kcal/day
  tdee: number              // kcal/day
  deficit: number           // kcal/day (0 if IMC ≤ 25)
  target: number            // kcal/day (≥ 1200)
  restrictionActive: boolean // true when deficit > 0
}

const MSJ_WEIGHT_COEFF = 10
const MSJ_HEIGHT_COEFF = 6.25
const MSJ_AGE_COEFF = 5
const MSJ_MALE_OFFSET = 5
const MSJ_FEMALE_OFFSET = 161

function bmrMifflinStJeor({ weight, height, age, gender }: UserMetrics): number {
  const base = MSJ_WEIGHT_COEFF * weight + MSJ_HEIGHT_COEFF * height - MSJ_AGE_COEFF * age
  return Math.round(gender === 'male' ? base + MSJ_MALE_OFFSET : base - MSJ_FEMALE_OFFSET)
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

  // SPECS_RF RF-02: deficit ONLY when IMC > 25 (via isRestrictionCandidate)
  const restrictionActive = isRestrictionCandidate(imc)

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
