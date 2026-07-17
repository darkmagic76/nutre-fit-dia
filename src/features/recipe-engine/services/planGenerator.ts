import type { Food } from '@shared/domain'
import { FoodCategory } from '@shared/domain'
import { foods } from '@shared/data/foods'
import {
  validateRations,
  validateWeeklyRations,
  countRations,
  emptyCounts,
  RATION_LIMITS,
  type CountByCategory,
  type ValidationResult,
} from '@shared/services/rationValidator'

/**
 * Simplified meal plan entry.
 */
export interface MealEntry {
  food: Food
  rations: number
}

export interface DailyMeal {
  day: number // 1..7
  entries: MealEntry[]
}

export interface WeeklyPlan {
  days: DailyMeal[]
  dailyResults: ValidationResult[]
  weeklyResult: ValidationResult
  valid: boolean
}

/**
 * Generate a basic weekly plan that satisfies erMedDiet ration limits.
 *
 * Strategy: template-based. Each day follows a preset pattern of food categories,
 * ensuring daily minimums are met. Weekly totals accumulate for weekly validation.
 */
export function generateWeeklyPlan(restrictionActive: boolean): WeeklyPlan {
  const dailyTemplate = buildDailyTemplate(restrictionActive)
  const weeklySlots = getWeeklySlots()
  const days: DailyMeal[] = []
  const weeklyCounts = emptyCounts()

  for (let day = 1; day <= 7; day++) {
    const dailyEntries = dailyTemplate.map(slot => ({
      food: pickFood(slot.category, day),
      rations: slot.rations,
    }))

    // Merge weekly-distributed slots into their target day
    const dayWeeklySlots = weeklySlots.filter(s => s.day === day)
    const extraEntries = dayWeeklySlots.map(slot => ({
      food: pickFood(slot.category, day),
      rations: slot.rations,
    }))

    const entries = [...dailyEntries, ...extraEntries]

    // Accumulate weekly counts
    for (const entry of entries) {
      weeklyCounts[entry.food.category] += entry.rations
    }

    days.push({ day, entries })
  }

  const dailyResults = days.map(d => {
    const dayFoods: Food[] = d.entries.flatMap(e =>
      Array.from({ length: e.rations }, () => e.food),
    )
    return validateRations(countRations(dayFoods), restrictionActive)
  })

  const weeklyResult = validateWeeklyRations(weeklyCounts)
  const valid = dailyResults.every(r => r.valid) && weeklyResult.valid

  return { days, dailyResults, weeklyResult, valid }
}

interface TemplateSlot {
  category: FoodCategory
  rations: number
}

const CEREAL_DAILY_NORMAL = 5
const CEREAL_DAILY_RESTRICTED = 4

function buildDailyTemplate(restrictionActive: boolean): TemplateSlot[] {
  const cerealMax = restrictionActive ? CEREAL_DAILY_RESTRICTED : CEREAL_DAILY_NORMAL
  return [
    { category: FoodCategory.CEREALS, rations: cerealMax },
    { category: FoodCategory.VEGETABLES, rations: RATION_LIMITS[FoodCategory.VEGETABLES].min! },
    { category: FoodCategory.FRUITS, rations: RATION_LIMITS[FoodCategory.FRUITS].min! },
    { category: FoodCategory.OLIVE_OIL, rations: RATION_LIMITS[FoodCategory.OLIVE_OIL].min! },
    { category: FoodCategory.WATER, rations: RATION_LIMITS[FoodCategory.WATER].min! },
  ]
}

/**
 * Weekly slots distributed across days to satisfy weekly minimums.
 * Ensures legumes ≥4/week, fish ≥3/week, eggs ≤4, white meat ≤3, dairy ≤3/day.
 */
function getWeeklySlots(): { day: number; category: FoodCategory; rations: number }[] {
  return [
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
  ]
}

/** Pick a food from the catalog, cycling through available options per day */
function pickFood(category: FoodCategory, day: number): Food {
  const options = foods.filter(f => f.category === category && !f.isProcessed)
  if (options.length === 0) {
    // Fallback to first in category, including processed if no natural
    const fallback = foods.filter(f => f.category === category)
    return fallback[day % fallback.length]
  }
  return options[day % options.length]
}

/**
 * Aggregate weekly counts from a plan.
 */
export function getWeeklyCounts(plan: WeeklyPlan): CountByCategory {
  const counts = emptyCounts()
  for (const day of plan.days) {
    for (const entry of day.entries) {
      counts[entry.food.category] += entry.rations
    }
  }
  return counts
}
