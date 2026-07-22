import type { Food } from '@shared/domain';
import { FoodCategory } from '@shared/domain';
import { foods } from '@shared/data/foods';
import { CEREAL_RESTRICTED_MAX } from '@shared/constants/clinical';
import {
  validateRations,
  validateWeeklyRations,
  countRations,
  emptyCounts,
  type CountByCategory,
  type ValidationResult,
} from '@shared/services/rationValidator';
import { computeEnvironmentalScore } from '@shared/sustainability';

export const MealType = {
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  SNACK: 'SNACK',
} as const;

export type MealType = (typeof MealType)[keyof typeof MealType];

interface MealSlot {
  meal: MealType;
  rations: number;
}

/**
 * Simplified meal plan entry.
 */
export interface MealEntry {
  food: Food;
  rations: number;
  mealType?: MealType;
}

export interface DailyMeal {
  day: number; // 1..7
  entries: MealEntry[];
}

export interface WeeklyPlan {
  days: DailyMeal[];
  dailyResults: ValidationResult[];
  weeklyResult: ValidationResult;
  valid: boolean;
}

/**
 * Generate a basic weekly plan that satisfies erMedDiet ration limits.
 *
 * Strategy: template-based. Each day follows a preset pattern of food categories,
 * ensuring daily minimums are met. Weekly totals accumulate for weekly validation.
 *
 * Food selection prefers sustainability: lower carbon footprint + seasonal first.
 */
export function generateWeeklyPlan(restrictionActive: boolean, mealCount = 4): WeeklyPlan {
  const dailyTemplate = buildDailyTemplate(restrictionActive, mealCount);
  const weeklySlots = getWeeklySlots();
  const days: DailyMeal[] = [];
  const weeklyCounts = emptyCounts();

  for (let day = 1; day <= DAYS_IN_WEEK; day++) {
    const dailyEntries = dailyTemplate.flatMap((slot) =>
      slot.mealSlots.map((ms) => ({
        food: pickSustainableFood(slot.category, day),
        rations: ms.rations,
        mealType: ms.meal,
      })),
    );

    // Merge weekly-distributed slots into their target day
    const dayWeeklySlots = weeklySlots.filter((s) => s.day === day);
    const extraEntries = dayWeeklySlots.map((slot) => ({
      food: pickSustainableFood(slot.category, day),
      rations: slot.rations,
      mealType: slot.mealType,
    }));

    const entries: MealEntry[] = [...dailyEntries, ...extraEntries];

    // Post-process: enforce AOVE in every main meal
    const enforcedEntries = enforceAOVE(entries, day);

    // Accumulate weekly counts
    for (const entry of enforcedEntries) {
      weeklyCounts[entry.food.category] += entry.rations;
    }

    days.push({ day, entries: enforcedEntries });
  }

  const dailyResults = days.map((d) => {
    const dayFoods: Food[] = d.entries.flatMap((e) =>
      Array.from({ length: e.rations }, () => e.food),
    );
    return validateRations(countRations(dayFoods), restrictionActive);
  });

  const weeklyResult = validateWeeklyRations(weeklyCounts);
  const valid = dailyResults.every((r) => r.valid) && weeklyResult.valid;

  return { days, dailyResults, weeklyResult, valid };
}

interface TemplateSlot {
  category: FoodCategory;
  mealSlots: MealSlot[];
}

const DAYS_IN_WEEK = 7;
const BASE_MEAL_COUNT = 3; // breakfast + lunch + dinner
const CEREAL_NON_DINNER_RATIONS = 3; // breakfast(1) + lunch(2)

const CEREAL_DAILY_NORMAL = 5;

function buildDailyTemplate(restrictionActive: boolean, mealCount = 4): TemplateSlot[] {
  const cerealMax = restrictionActive ? CEREAL_RESTRICTED_MAX : CEREAL_DAILY_NORMAL;
  const cerealDinner = Math.max(cerealMax - CEREAL_NON_DINNER_RATIONS, 0); // 2 normally, 1 when restricted

  const baseSlots: TemplateSlot[] = [
    {
      category: FoodCategory.CEREALS,
      mealSlots: [
        { meal: MealType.BREAKFAST, rations: 1 },
        { meal: MealType.LUNCH, rations: 2 },
        { meal: MealType.DINNER, rations: cerealDinner },
      ],
    },
    {
      category: FoodCategory.VEGETABLES,
      mealSlots: [
        { meal: MealType.LUNCH, rations: 2 },
        { meal: MealType.DINNER, rations: 1 },
      ],
    },
    {
      category: FoodCategory.OLIVE_OIL,
      mealSlots: [
        { meal: MealType.BREAKFAST, rations: 1 },
        { meal: MealType.LUNCH, rations: 1 },
        { meal: MealType.DINNER, rations: 1 },
      ],
    },
  ];

  // mealCount=3 has no SNACK — FRUITS goes entirely to BREAKFAST, WATER min 4
  if (mealCount <= 3) {
    baseSlots.push(
      { category: FoodCategory.FRUITS, mealSlots: [{ meal: MealType.BREAKFAST, rations: 2 }] },
      {
        category: FoodCategory.WATER,
        mealSlots: [
          { meal: MealType.BREAKFAST, rations: 1 },
          { meal: MealType.LUNCH, rations: 2 },
          { meal: MealType.DINNER, rations: 1 },
        ],
      },
    );
    return baseSlots;
  }

  // 4+ meals: include SNACK slot(s)
  const snackCount = mealCount - BASE_MEAL_COUNT; // B+L+D = 3 base meals
  const waterSlots: MealSlot[] = [
    { meal: MealType.BREAKFAST, rations: 1 },
    { meal: MealType.LUNCH, rations: 1 },
    { meal: MealType.DINNER, rations: 1 },
  ];
  for (let i = 0; i < snackCount; i++) {
    waterSlots.push({ meal: MealType.SNACK, rations: 1 });
  }

  baseSlots.push(
    {
      category: FoodCategory.FRUITS,
      mealSlots: [
        { meal: MealType.BREAKFAST, rations: 1 },
        { meal: MealType.SNACK, rations: 1 },
      ],
    },
    { category: FoodCategory.WATER, mealSlots: waterSlots },
  );

  return baseSlots;
}

/**
 * Weekly slots distributed across days to satisfy weekly minimums.
 * Ensures legumes ≥4/week, fish ≥3/week, eggs ≤4, white meat ≤3, dairy ≤3/day.
 */
function getWeeklySlots(): {
  day: number;
  category: FoodCategory;
  rations: number;
  mealType: MealType;
}[] {
  const rawSlots: { day: number; category: FoodCategory; rations: number }[] = [
    // Legumes: 4/week minimum — distribute Mon/Wed/Fri/Sun
    { day: 1, category: FoodCategory.LEGUMES, rations: 1 },
    { day: 3, category: FoodCategory.LEGUMES, rations: 1 },
    { day: 5, category: FoodCategory.LEGUMES, rations: 1 },
    { day: 7, category: FoodCategory.LEGUMES, rations: 1 },
    // Fish: 3/week minimum — Tue/Thu/Sat
    { day: 2, category: FoodCategory.FISH, rations: 1 },
    { day: 4, category: FoodCategory.FISH, rations: 1 },
    { day: 6, category: FoodCategory.FISH, rations: 1 },
    // Eggs: 2/week (under max 4)
    { day: 1, category: FoodCategory.EGGS, rations: 1 },
    { day: 5, category: FoodCategory.EGGS, rations: 1 },
    // Dairy: 2 days (under max 3/day)
    { day: 2, category: FoodCategory.DAIRY, rations: 1 },
    { day: 4, category: FoodCategory.DAIRY, rations: 1 },
    // White meat: 2/week (under max 3)
    { day: 3, category: FoodCategory.WHITE_MEAT, rations: 1 },
    { day: 7, category: FoodCategory.WHITE_MEAT, rations: 1 },
  ];

  // Alternating mealType per day: first → LUNCH, second → DINNER, third → LUNCH, etc.
  const dayCounter: Record<number, number> = {};
  return rawSlots.map((slot) => {
    dayCounter[slot.day] = (dayCounter[slot.day] || 0) + 1;
    const mealType = dayCounter[slot.day] % 2 === 1 ? MealType.LUNCH : MealType.DINNER;
    return { ...slot, mealType };
  });
}

/**
 * Pick a food from the catalog, preferring sustainability.
 *
 * Ranks available natural (non-processed) foods by environmental score,
 * then cycles through them per day for variety while keeping carbon footprint low.
 */
function pickSustainableFood(category: FoodCategory, day: number): Food {
  const options = foods
    .filter((f) => f.category === category && !f.isProcessed)
    .sort((a, b) => {
      // High-priority protein sources first (SPECS_TECH §3: Bacalao 0.7% fat)
      if (a.isHighPriority && !b.isHighPriority) return -1;
      if (!a.isHighPriority && b.isHighPriority) return 1;
      // Then by environmental score (descending)
      return computeEnvironmentalScore(b).score - computeEnvironmentalScore(a).score;
    });

  if (options.length === 0) {
    // Fallback to first in category, including processed if no natural
    const fallback = foods.filter((f) => f.category === category);
    return fallback[day % fallback.length];
  }
  return options[day % options.length];
}

/**
 * Enforce AOVE in every main meal (BREAKFAST, LUNCH, DINNER) as a post-processing step.
 * If a main meal has no OLIVE_OIL entry, add one.
 * Gracefully handles missing catalog — if no OLIVE_OIL food is available, skip silently.
 */
export function enforceAOVE(entries: MealEntry[], day: number): MealEntry[] {
  const mainMeals = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];
  const result = [...entries];

  for (const meal of mainMeals) {
    const hasAOVE = result.some(
      (e) => e.mealType === meal && e.food.category === FoodCategory.OLIVE_OIL,
    );
    if (!hasAOVE) {
      const aoveFood = pickSustainableFood(FoodCategory.OLIVE_OIL, day);
      if (aoveFood) {
        result.push({ food: aoveFood, rations: 1, mealType: meal });
      }
    }
  }

  return result;
}

/**
 * Aggregate weekly counts from a plan.
 */
export function getWeeklyCounts(plan: WeeklyPlan): CountByCategory {
  const counts = emptyCounts();
  for (const day of plan.days) {
    for (const entry of day.entries) {
      counts[entry.food.category] += entry.rations;
    }
  }
  return counts;
}
