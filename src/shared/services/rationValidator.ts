import { FoodCategory, ANIMAL_PROTEIN_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '@shared/domain';
import { CEREAL_RESTRICTED_MAX } from '@shared/constants/clinical';
import { es } from '@shared/i18n/es';
import type { FoodCategory as FoodCategoryType } from '@shared/domain';
import type { Food } from '@shared/domain';

/**
 * Ration limits per INFORME_ADR FR-2 and ADR-005.
 *
 * Daily limits: per-day constraints (most groups)
 * Weekly limits: per-week constraints (legumes, fish, eggs, white meat)
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
};

export interface RationViolation {
  category: FoodCategoryType;
  current: number;
  limit: number;
  direction: 'under' | 'over';
  unit: 'day' | 'week';
  message: string;
}

export interface ValidationResult {
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
    [FoodCategory.RED_MEAT]: 0,
    [FoodCategory.WATER]: 0,
  };
}

/** Count rations per category from a list of food entries */
export function countRations(entries: Food[]): CountByCategory {
  const counts = emptyCounts();
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
  const suffix = unit === 'day' ? es['validation.unitDay'] : es['validation.unitWeek'];
  const effectiveMax = options?.effectiveMax ?? limit.max;
  const displayName = CATEGORY_DISPLAY_NAMES[category] ?? category;

  if (effectiveMax !== undefined && current > effectiveMax) {
    violations.push({
      category,
      current,
      limit: effectiveMax,
      direction: 'over',
      unit,
      message: `${displayName}: ${current} raciones (máx ${effectiveMax}/${suffix})`,
    });
  }

  if (limit.min !== undefined && current < limit.min) {
    violations.push({
      category,
      current,
      limit: limit.min,
      direction: 'under',
      unit,
      message: `${displayName}: ${current} raciones (mín ${limit.min}/${suffix})`,
    });
  }

  return violations;
}

/** Validate daily ration counts against INFORME_ADR limits */
export function validateRations(
  counts: CountByCategory,
  restrictionActive: boolean,
): ValidationResult {
  const violations: RationViolation[] = [];

  for (const [category, limit] of Object.entries(RATION_LIMITS) as [
    FoodCategoryType,
    RationLimit,
  ][]) {
    if (limit.unit !== 'day') continue;

    let effectiveMax = limit.max;
    if (limit.restrictOnCaloricDeficit && restrictionActive) {
      effectiveMax = CEREAL_RESTRICTED_MAX;
    }

    violations.push(...checkCategoryLimits(counts, category, limit, { effectiveMax }));
  }

  const animalProteinCount = ANIMAL_PROTEIN_CATEGORIES.reduce((sum, cat) => sum + counts[cat], 0);

  return { valid: violations.length === 0, violations, animalProteinCount };
}

/** Validate weekly ration counts */
export function validateWeeklyRations(counts: CountByCategory): ValidationResult {
  const violations: RationViolation[] = [];
  const weeklyCategories: FoodCategoryType[] = [
    FoodCategory.LEGUMES,
    FoodCategory.FISH,
    FoodCategory.EGGS,
    FoodCategory.WHITE_MEAT,
    FoodCategory.RED_MEAT,
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
      message: 'Carnes blancas: restringir si se han superado raciones de pescado',
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
  [FoodCategory.LEGUMES]: { min: 60, max: 80 },
  [FoodCategory.FISH]: { min: 150, max: 200 },
  [FoodCategory.EGGS]: { min: 50, max: 100 },
  [FoodCategory.WHITE_MEAT]: { min: 100, max: 150 },
  [FoodCategory.RED_MEAT]: { min: 100, max: 150 },
  [FoodCategory.WATER]: { min: 200, max: 250 },
};

export type SafetyAlertSeverity = 'critical' | 'warning';

export interface SafetyAlert {
  severity: SafetyAlertSeverity;
  code: string;
  message: string;
  category: FoodCategoryType;
  acknowledgeRequired: boolean;
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
      });
    }

    if (food.gramsPerRation > standard.max) {
      alerts.push({
        severity: 'critical',
        code: 'PORTION_TOO_LARGE',
        message: `${food.name}: ${food.gramsPerRation}g (máx ${standard.max}g/ración AESAN 2022)`,
        category: food.category,
        acknowledgeRequired: true,
      });
    }
  }

  return alerts;
}
