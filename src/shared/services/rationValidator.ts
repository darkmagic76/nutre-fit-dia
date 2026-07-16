import { FoodCategory, ANIMAL_PROTEIN_CATEGORIES } from '@shared/domain'
import type { FoodCategory as FoodCategoryType } from '@shared/domain'
import type { Food } from '@shared/domain'

/**
 * Ration limits per INFORME_ADR FR-2 and ADR-005.
 *
 * Daily limits: per-day constraints (most groups)
 * Weekly limits: per-week constraints (legumes, fish, eggs, white meat)
 */

export interface RationLimit {
  min?: number
  max?: number
  unit: 'day' | 'week'
  /** If true, max=4 when caloric restriction is active (cereals only) */
  restrictOnCaloricDeficit?: boolean
}

export const RATION_LIMITS: Record<FoodCategoryType, RationLimit> = {
  [FoodCategory.CEREALS]: {
    min: 3, max: 6, unit: 'day', restrictOnCaloricDeficit: true,
  },
  [FoodCategory.VEGETABLES]: {
    min: 3, unit: 'day',
  },
  [FoodCategory.FRUITS]: {
    min: 2, max: 3, unit: 'day',
  },
  [FoodCategory.OLIVE_OIL]: {
    min: 3, max: 6, unit: 'day',
  },
  [FoodCategory.DAIRY]: {
    max: 3, unit: 'day',
  },
  [FoodCategory.LEGUMES]: {
    min: 4, unit: 'week',
  },
  [FoodCategory.FISH]: {
    min: 3, unit: 'week',
  },
  [FoodCategory.EGGS]: {
    max: 4, unit: 'week',
  },
  [FoodCategory.WHITE_MEAT]: {
    max: 3, unit: 'week',
  },
  [FoodCategory.WATER]: {
    min: 4, max: 8, unit: 'day',
  },
}

export interface RationViolation {
  category: FoodCategoryType
  current: number
  limit: number
  direction: 'under' | 'over'
  unit: 'day' | 'week'
  message: string
}

export interface ValidationResult {
  valid: boolean
  violations: RationViolation[]
  animalProteinCount: number
}

export interface CountByCategory {
  [FoodCategory.CEREALS]: number
  [FoodCategory.VEGETABLES]: number
  [FoodCategory.FRUITS]: number
  [FoodCategory.OLIVE_OIL]: number
  [FoodCategory.DAIRY]: number
  [FoodCategory.LEGUMES]: number
  [FoodCategory.FISH]: number
  [FoodCategory.EGGS]: number
  [FoodCategory.WHITE_MEAT]: number
  [FoodCategory.WATER]: number
}

export function emptyCounts(): CountByCategory {
  return {
    [FoodCategory.CEREALS]: 0,
    [FoodCategory.VEGETABLES]: 0,
    [FoodCategory.FRUITS]: 0,
    [FoodCategory.OLIVE_OIL]: 0,
    [FoodCategory.DAIRY]: 0,
    [FoodCategory.LEGUMES]: 0,
    [FoodCategory.FISH]: 0,
    [FoodCategory.EGGS]: 0,
    [FoodCategory.WHITE_MEAT]: 0,
    [FoodCategory.WATER]: 0,
  }
}

/** Count rations per category from a list of food entries */
export function countRations(entries: Food[]): CountByCategory {
  const counts = emptyCounts()
  for (const food of entries) {
    counts[food.category] += 1
  }
  return counts
}

/** Validate daily ration counts against INFORME_ADR limits */
export function validateRations(
  counts: CountByCategory,
  restrictionActive: boolean,
): ValidationResult {
  const violations: RationViolation[] = []

  for (const [category, limit] of Object.entries(RATION_LIMITS) as [FoodCategoryType, RationLimit][]) {
    const current = counts[category]

    // Only validate daily limits here. Weekly limits are validated separately.
    if (limit.unit !== 'day') continue

    // Max constraint
    let effectiveMax = limit.max
    if (limit.restrictOnCaloricDeficit && restrictionActive) {
      effectiveMax = 4 // Cereals: max 4 when restriction active
    }

    if (effectiveMax !== undefined && current > effectiveMax) {
      violations.push({
        category,
        current,
        limit: effectiveMax,
        direction: 'over',
        unit: 'day',
        message: `${category}: ${current} raciones (máx ${effectiveMax}/día)`,
      })
    }

    // Min constraint
    if (limit.min !== undefined && current < limit.min) {
      violations.push({
        category,
        current,
        limit: limit.min,
        direction: 'under',
        unit: 'day',
        message: `${category}: ${current} raciones (mín ${limit.min}/día)`,
      })
    }
  }

  const animalProteinCount = ANIMAL_PROTEIN_CATEGORIES.reduce(
    (sum, cat) => sum + counts[cat],
    0,
  )

  return { valid: violations.length === 0, violations, animalProteinCount }
}

/** Validate weekly ration counts */
export function validateWeeklyRations(counts: CountByCategory): ValidationResult {
  const violations: RationViolation[] = []
  const weeklyCategories: FoodCategoryType[] = [
    FoodCategory.LEGUMES,
    FoodCategory.FISH,
    FoodCategory.EGGS,
    FoodCategory.WHITE_MEAT,
  ]

  for (const category of weeklyCategories) {
    const limit = RATION_LIMITS[category]
    const current = counts[category]

    if (limit.min !== undefined && current < limit.min) {
      violations.push({
        category,
        current,
        limit: limit.min,
        direction: 'under',
        unit: 'week',
        message: `${category}: ${current} raciones (mín ${limit.min}/semana)`,
      })
    }

    if (limit.max !== undefined && current > limit.max) {
      violations.push({
        category,
        current,
        limit: limit.max,
        direction: 'over',
        unit: 'week',
        message: `${category}: ${current} raciones (máx ${limit.max}/semana)`,
      })
    }
  }

  // Cross-rule: white meat restricted if fish exceeded (INFORME_ADR FR-2: Carnes Blancas LIMIT)
  if (counts[FoodCategory.WHITE_MEAT] > 0 && counts[FoodCategory.FISH] > (RATION_LIMITS[FoodCategory.FISH].max ?? 99)) {
    violations.push({
      category: FoodCategory.WHITE_MEAT,
      current: counts[FoodCategory.WHITE_MEAT],
      limit: 0,
      direction: 'over',
      unit: 'week',
      message: 'Carnes blancas: restringir si se han superado raciones de pescado',
    })
  }

  const animalProteinCount = ANIMAL_PROTEIN_CATEGORIES.reduce(
    (sum, cat) => sum + counts[cat],
    0,
  )

  return { valid: violations.length === 0, violations, animalProteinCount }
}
