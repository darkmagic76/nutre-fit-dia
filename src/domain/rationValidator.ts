import { FoodCategory, ANIMAL_PROTEIN_CATEGORIES } from './foodCategory';
import { CEREAL_RESTRICTED_MAX, NUTS_MAX_DAILY } from './clinical';
import type { FoodCategory as FoodCategoryType } from './foodCategory';
import type { Food } from './food';

/**
 * Ration limits per INFORME_ADR FR-2 and ADR-005.
 *
 * Daily limits: per-day constraints (most groups)
 * Weekly limits: per-week constraints (legumes, fish, eggs, white meat, nuts)
 *
 * ## "validation" polysemy note
 *
 * The term "validation" appears with 3 distinct meanings in this codebase:
 *
 * 1. **Ration-rule checks** (THIS file): `validateRations()`, `countRations()`,
 *    `validateFoodPortions()` — checks whether daily/weekly food intake complies
 *    with AESAN 2022 clinical ration limits. This is *clinical rule validation*,
 *    not input validation.
 *
 * 2. **Form/domain validation** (`src/shared/errors.ts` \{
 *    @link ValidationError}): user-input validation failures (missing required
 *    fields, out-of-range values, invalid profile data). Raised when raw user input
 *    fails structural checks before any domain processing.
 *
 * 3. **UI violation display** (`src/features/med-diet-validator/components/
 *    DailyViolations.tsx`): "violations" in the UI context means rendering ration
 *    limit breaches to the user as visual feedback — *display* of clinical
 *    rule failures, not the check itself.
 *
 * When reading code in this module, "validation" always means definition #1
 * (ration-rule checks against AESAN 2022 limits).
 */

export interface RationLimit {
  min?: number;
  max?: number;
  unit: 'day' | 'week';
  /** If true, max=4 when caloric restriction is active (cereals only) */
  restrictOnCaloricDeficit?: boolean;
}

export const RATION_LIMITS: Record<FoodCategoryType, RationLimit> = {
  [FoodCategory.CEREALS]: {
    min: 3,
    max: 6,
    unit: 'day',
    restrictOnCaloricDeficit: true,
  },
  [FoodCategory.VEGETABLES]: {
    min: 3,
    unit: 'day',
  },
  [FoodCategory.FRUITS]: {
    min: 2,
    max: 3,
    unit: 'day',
  },
  [FoodCategory.OLIVE_OIL]: {
    min: 3,
    max: 6,
    unit: 'day',
  },
  [FoodCategory.DAIRY]: {
    max: 3,
    unit: 'day',
  },
  [FoodCategory.LEGUMES]: {
    min: 4,
    unit: 'week',
  },
  [FoodCategory.FISH]: {
    min: 3,
    max: 7,
    unit: 'week',
  },
  [FoodCategory.EGGS]: {
    max: 4,
    unit: 'week',
  },
  [FoodCategory.WHITE_MEAT]: {
    max: 3,
    unit: 'week',
  },
  [FoodCategory.RED_MEAT]: {
    max: 3,
    unit: 'week',
  },
  [FoodCategory.WATER]: {
    min: 4,
    max: 8,
    unit: 'day',
  },
  [FoodCategory.NUTS]: {
    min: 3,
    unit: 'week',
  },
  [FoodCategory.TUBERS]: {
    max: 5,
    unit: 'week',
  },
};

/** Cross-category violation keys. Each value maps to a `validation.*` i18n key. */
export type RationViolationKey = 'validation.crossRule.whiteMeatFish';

export interface RationViolation {
  category: FoodCategoryType;
  current: number;
  limit: number;
  direction: 'under' | 'over';
  unit: 'day' | 'week';
  /** @deprecated Use formatViolation(t, v) instead — locale-aware message formatting at UI layer. */
  message?: string;
  /** Cross-category i18n key (e.g. whiteMeatFish). Bypasses template interpolation. */
  messageKey?: RationViolationKey;
}

export interface RationValidationResult {
  valid: boolean;
  violations: RationViolation[];
  animalProteinCount: number;
}

export interface CountByCategory {
  [FoodCategory.CEREALS]: number;
  [FoodCategory.VEGETABLES]: number;
  [FoodCategory.FRUITS]: number;
  [FoodCategory.OLIVE_OIL]: number;
  [FoodCategory.DAIRY]: number;
  [FoodCategory.LEGUMES]: number;
  [FoodCategory.FISH]: number;
  [FoodCategory.EGGS]: number;
  [FoodCategory.WHITE_MEAT]: number;
  [FoodCategory.RED_MEAT]: number;
  [FoodCategory.WATER]: number;
  [FoodCategory.NUTS]: number;
  [FoodCategory.TUBERS]: number;
}

export function defaultRationCounts(): CountByCategory {
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
    [FoodCategory.RED_MEAT]: 0,
    [FoodCategory.WATER]: 0,
    [FoodCategory.NUTS]: 0,
    [FoodCategory.TUBERS]: 0,
  };
}

/** Count rations per category from a list of food entries */
export function countRations(entries: Food[]): CountByCategory {
  const counts = defaultRationCounts();
  for (const food of entries) {
    counts[food.category] += 1;
  }
  return counts;
}

function checkCategoryLimits(
  counts: CountByCategory,
  category: FoodCategoryType,
  limit: RationLimit,
  options?: { effectiveMax?: number },
): RationViolation[] {
  const violations: RationViolation[] = [];
  const current = counts[category];
  const unit = limit.unit;
  const effectiveMax = options?.effectiveMax ?? limit.max;

  if (effectiveMax !== undefined && current > effectiveMax) {
    violations.push({
      category,
      current,
      limit: effectiveMax,
      direction: 'over',
      unit,
    });
  }

  if (limit.min !== undefined && current < limit.min) {
    violations.push({
      category,
      current,
      limit: limit.min,
      direction: 'under',
      unit,
    });
  }

  return violations;
}

/** Validate daily ration counts against INFORME_ADR limits */
export function validateRations(
  counts: CountByCategory,
  caloricRestrictionActive: boolean,
): RationValidationResult {
  const violations: RationViolation[] = [];

  for (const [category, limit] of Object.entries(RATION_LIMITS) as [
    FoodCategoryType,
    RationLimit,
  ][]) {
    if (limit.unit !== 'day') continue;

    let effectiveMax = limit.max;
    if (limit.restrictOnCaloricDeficit && caloricRestrictionActive) {
      effectiveMax = CEREAL_RESTRICTED_MAX;
    }

    violations.push(...checkCategoryLimits(counts, category, limit, { effectiveMax }));
  }

  // NUTS has a daily max (≤1/día) even though its primary unit is 'week'
  if (counts[FoodCategory.NUTS] > NUTS_MAX_DAILY) {
    violations.push({
      category: FoodCategory.NUTS,
      current: counts[FoodCategory.NUTS],
      limit: NUTS_MAX_DAILY,
      direction: 'over',
      unit: 'day',
    });
  }

  const animalProteinCount = ANIMAL_PROTEIN_CATEGORIES.reduce((sum, cat) => sum + counts[cat], 0);

  return { valid: violations.length === 0, violations, animalProteinCount };
}

/** Validate weekly ration counts */
export function validateWeeklyRations(counts: CountByCategory): RationValidationResult {
  const violations: RationViolation[] = [];
  const weeklyCategories: FoodCategoryType[] = [
    FoodCategory.LEGUMES,
    FoodCategory.FISH,
    FoodCategory.EGGS,
    FoodCategory.WHITE_MEAT,
    FoodCategory.RED_MEAT,
    FoodCategory.NUTS,
  ];

  for (const category of weeklyCategories) {
    violations.push(...checkCategoryLimits(counts, category, RATION_LIMITS[category]));
  }

  const fishMax = RATION_LIMITS[FoodCategory.FISH].max;
  if (
    counts[FoodCategory.WHITE_MEAT] > 0 &&
    fishMax !== undefined &&
    counts[FoodCategory.FISH] > fishMax
  ) {
    violations.push({
      category: FoodCategory.WHITE_MEAT,
      current: counts[FoodCategory.WHITE_MEAT],
      limit: 0,
      direction: 'over',
      unit: 'week',
      messageKey: 'validation.crossRule.whiteMeatFish',
    });
  }

  const animalProteinCount = ANIMAL_PROTEIN_CATEGORIES.reduce((sum, cat) => sum + counts[cat], 0);

  return { valid: violations.length === 0, violations, animalProteinCount };
}

/**
 * AESAN 2022 grammed portion standards per food category (pág. 52).
 * Each category has a valid gram range for one ration.
 */
export const AESAN_GRAM_STANDARDS: Record<FoodCategoryType, { min: number; max: number }> = {
  [FoodCategory.CEREALS]: { min: 40, max: 60 },
  [FoodCategory.VEGETABLES]: { min: 150, max: 200 },
  [FoodCategory.FRUITS]: { min: 120, max: 200 },
  [FoodCategory.OLIVE_OIL]: { min: 10, max: 15 },
  [FoodCategory.DAIRY]: { min: 200, max: 250 },
  [FoodCategory.LEGUMES]: { min: 50, max: 60 },
  [FoodCategory.FISH]: { min: 150, max: 200 },
  [FoodCategory.EGGS]: { min: 50, max: 100 },
  [FoodCategory.WHITE_MEAT]: { min: 100, max: 150 },
  [FoodCategory.RED_MEAT]: { min: 100, max: 150 },
  [FoodCategory.WATER]: { min: 200, max: 250 },
  [FoodCategory.NUTS]: { min: 20, max: 30 },
  [FoodCategory.TUBERS]: { min: 150, max: 200 },
};

export type SafetyAlertSeverity = 'critical' | 'warning';

export interface SafetyAlert {
  severity: SafetyAlertSeverity;
  code: string;
  /** @deprecated Format at UI layer via formatSafetyAlert(). Structured fields below replace this. */
  message: string;
  category: FoodCategoryType;
  acknowledgeRequired: boolean;
  /** Food name for i18n template interpolation. */
  foodName?: string;
  /** Actual grams per ration for i18n template interpolation. */
  actualGrams?: number;
  /** AESAN minimum gram standard for this category. */
  standardMin?: number;
  /** AESAN maximum gram standard for this category. */
  standardMax?: number;
}

/**
 * Validate a food's gramsPerRation against AESAN 2022 gram standards.
 * Returns SafetyAlert[] for portions outside the acceptable range.
 */
export function validateFoodPortions(foods: Food[]): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  for (const food of foods) {
    const standard = AESAN_GRAM_STANDARDS[food.category];
    if (!standard) continue;

    if (food.gramsPerRation < standard.min) {
      alerts.push({
        severity: 'warning',
        code: 'PORTION_TOO_SMALL',
        message: `${food.name}: ${food.gramsPerRation}g (mín ${standard.min}g/ración AESAN 2022)`,
        category: food.category,
        acknowledgeRequired: false,
        foodName: food.name,
        actualGrams: food.gramsPerRation,
        standardMin: standard.min,
        standardMax: standard.max,
      });
    }

    if (food.gramsPerRation > standard.max) {
      alerts.push({
        severity: 'critical',
        code: 'PORTION_TOO_LARGE',
        message: `${food.name}: ${food.gramsPerRation}g (máx ${standard.max}g/ración AESAN 2022)`,
        category: food.category,
        acknowledgeRequired: true,
        foodName: food.name,
        actualGrams: food.gramsPerRation,
        standardMin: standard.min,
        standardMax: standard.max,
      });
    }
  }

  return alerts;
}
