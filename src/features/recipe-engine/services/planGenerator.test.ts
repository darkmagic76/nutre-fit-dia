import { describe, it, expect } from 'vitest'
import { generateWeeklyPlan, getWeeklyCounts, MealType, enforceAOVE } from './planGenerator'
import { FoodCategory } from '@shared/domain'

describe('planGenerator', () => {
  describe('generateWeeklyPlan', () => {
    it('generates a 7-day plan', () => {
      const plan = generateWeeklyPlan(false)
      expect(plan.days).toHaveLength(7)
    })

    it('generates a valid plan without restriction', () => {
      const plan = generateWeeklyPlan(false)
      expect(plan.valid).toBe(true)
      for (const result of plan.dailyResults) {
        expect(result.valid).toBe(true)
      }
    })

    it('generates a valid plan with caloric restriction', () => {
      const plan = generateWeeklyPlan(true)
      expect(plan.valid).toBe(true)
    })

    it('each day has entries for required categories', () => {
      const plan = generateWeeklyPlan(false)
      for (const day of plan.days) {
        const categories = day.entries.map(e => e.food.category)
        expect(categories).toContain(FoodCategory.CEREALS)
        expect(categories).toContain(FoodCategory.VEGETABLES)
        expect(categories).toContain(FoodCategory.FRUITS)
        expect(categories).toContain(FoodCategory.OLIVE_OIL)
        expect(categories).toContain(FoodCategory.WATER)
      }
    })

    it('uses only non-processed foods from catalog', () => {
      const plan = generateWeeklyPlan(false)
      for (const day of plan.days) {
        for (const entry of day.entries) {
          expect(entry.food.isProcessed).toBe(false)
        }
      }
    })

    it('weekly counts are tracked correctly', () => {
      const plan = generateWeeklyPlan(false)
      const counts = getWeeklyCounts(plan)
      // 7 days × 5 cereals = 35
      expect(counts[FoodCategory.CEREALS]).toBe(35)
    })
  })
})

describe('MealType', () => {
  it('defines four meal type values', () => {
    expect(MealType.BREAKFAST).toBe('BREAKFAST')
    expect(MealType.LUNCH).toBe('LUNCH')
    expect(MealType.DINNER).toBe('DINNER')
    expect(MealType.SNACK).toBe('SNACK')
  })

  it('assigns a valid mealType to every entry in generated plan', () => {
    const plan = generateWeeklyPlan(false)
    const validMeals = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK]
    for (const day of plan.days) {
      for (const entry of day.entries) {
        expect(validMeals).toContain(entry.mealType)
      }
    }
  })
})

describe('meal distribution', () => {
  describe('4-meal standard (default mealCount=4)', () => {
    function getDayBreakdown(plan: import('./planGenerator').WeeklyPlan, dayIndex: number): Record<string, Record<string, number>> {
      const day = plan.days[dayIndex]
      const breakdown: Record<string, Record<string, number>> = {}
      for (const entry of day.entries) {
        const cat = entry.food.category
        const meal = entry.mealType!
        if (!breakdown[cat]) breakdown[cat] = {}
        breakdown[cat][meal] = (breakdown[cat][meal] || 0) + entry.rations
      }
      return breakdown
    }

    it('distributes CEREALS as B(1)+L(2)+D(2)', () => {
      const plan = generateWeeklyPlan(false)
      const d = getDayBreakdown(plan, 0)
      expect(d[FoodCategory.CEREALS]).toEqual({
        [MealType.BREAKFAST]: 1,
        [MealType.LUNCH]: 2,
        [MealType.DINNER]: 2,
      })
    })

    it('distributes VEGETABLES as L(2)+D(1)', () => {
      const plan = generateWeeklyPlan(false)
      const d = getDayBreakdown(plan, 0)
      expect(d[FoodCategory.VEGETABLES]).toEqual({
        [MealType.LUNCH]: 2,
        [MealType.DINNER]: 1,
      })
    })

    it('distributes FRUITS as B(1)+SNACK(1)', () => {
      const plan = generateWeeklyPlan(false)
      const d = getDayBreakdown(plan, 0)
      expect(d[FoodCategory.FRUITS]).toEqual({
        [MealType.BREAKFAST]: 1,
        [MealType.SNACK]: 1,
      })
    })

    it('distributes OLIVE_OIL as B(1)+L(1)+D(1)', () => {
      const plan = generateWeeklyPlan(false)
      const d = getDayBreakdown(plan, 0)
      expect(d[FoodCategory.OLIVE_OIL]).toEqual({
        [MealType.BREAKFAST]: 1,
        [MealType.LUNCH]: 1,
        [MealType.DINNER]: 1,
      })
    })

    it('distributes WATER as B(1)+L(1)+D(1)+SNACK(1)', () => {
      const plan = generateWeeklyPlan(false)
      const d = getDayBreakdown(plan, 0)
      expect(d[FoodCategory.WATER]).toEqual({
        [MealType.BREAKFAST]: 1,
        [MealType.LUNCH]: 1,
        [MealType.DINNER]: 1,
        [MealType.SNACK]: 1,
      })
    })
  })

  describe('restrictionActive reduces CEREALS', () => {
    it('limits CEREALS to max 4 per day when restriction is active', () => {
      const plan = generateWeeklyPlan(true)
      for (const day of plan.days) {
        let totalCereals = 0
        for (const entry of day.entries) {
          if (entry.food.category === FoodCategory.CEREALS) {
            totalCereals += entry.rations
          }
        }
        expect(totalCereals).toBeLessThanOrEqual(4)
      }
    })
  })

  describe('3-meal distribution (no SNACK)', () => {
    function getDayBreakdown(plan: import('./planGenerator').WeeklyPlan, dayIndex: number): Record<string, Record<string, number>> {
      const day = plan.days[dayIndex]
      const breakdown: Record<string, Record<string, number>> = {}
      for (const entry of day.entries) {
        const cat = entry.food.category
        const meal = entry.mealType!
        if (!breakdown[cat]) breakdown[cat] = {}
        breakdown[cat][meal] = (breakdown[cat][meal] || 0) + entry.rations
      }
      return breakdown
    }

    it('has no SNACK entries', () => {
      const plan = generateWeeklyPlan(false, 3)
      for (const day of plan.days) {
        for (const entry of day.entries) {
          expect(entry.mealType).not.toBe(MealType.SNACK)
        }
      }
    })

    it('assigns FRUITS entirely to BREAKFAST', () => {
      const plan = generateWeeklyPlan(false, 3)
      const d = getDayBreakdown(plan, 0)
      expect(d[FoodCategory.FRUITS][MealType.BREAKFAST]).toBe(2)
      expect(d[FoodCategory.FRUITS][MealType.SNACK]).toBeUndefined()
    })

    it('distributes WATER as B(1)+L(2)+D(1) (min 4 rations)', () => {
      const plan = generateWeeklyPlan(false, 3)
      const d = getDayBreakdown(plan, 0)
      expect(d[FoodCategory.WATER]).toEqual({
        [MealType.BREAKFAST]: 1,
        [MealType.LUNCH]: 2,
        [MealType.DINNER]: 1,
      })
    })
  })

  describe('6-meal distribution with 3 SNACKs', () => {
    it('has SNACK entries in the plan', () => {
      const plan = generateWeeklyPlan(false, 6)
      const snackCount = plan.days[0].entries.filter(e => e.mealType === MealType.SNACK).length
      expect(snackCount).toBeGreaterThan(0)
    })
  })

  describe('AOVE enforcement', () => {
  it('every day has AOVE >=1 in BREAKFAST, LUNCH, and DINNER', () => {
    const plan = generateWeeklyPlan(false)
    for (const day of plan.days) {
      for (const meal of [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER]) {
        const aoveRations = day.entries
          .filter(e => e.mealType === meal && e.food.category === FoodCategory.OLIVE_OIL)
          .reduce((sum, e) => sum + e.rations, 0)
        expect(aoveRations).toBeGreaterThanOrEqual(1)
      }
    }
  })

  describe('enforceAOVE pure function', () => {
    const aoveFood = {
      id: 'aove-test', name: 'AOVE Test', category: FoodCategory.OLIVE_OIL,
      gramsPerRation: 10, kcalPer100g: 900, proteinPer100g: 0, carbsPer100g: 0,
      fiberPer100g: 0, fatPer100g: 100, isSeasonal: true, carbonFootprint: 0.5,
    }
    const cerealFood = {
      id: 'cereal-test', name: 'Cereal Test', category: FoodCategory.CEREALS,
      gramsPerRation: 50, kcalPer100g: 200, proteinPer100g: 5, carbsPer100g: 40,
      fiberPer100g: 2, fatPer100g: 1, isSeasonal: true, carbonFootprint: 0.5,
    }

    it('does not add extra AOVE when all main meals already have it', () => {
      const entries = [
        { food: cerealFood, rations: 1, mealType: MealType.BREAKFAST },
        { food: aoveFood, rations: 1, mealType: MealType.BREAKFAST },
        { food: aoveFood, rations: 1, mealType: MealType.LUNCH },
        { food: aoveFood, rations: 1, mealType: MealType.DINNER },
      ]
      const result = enforceAOVE(entries, 1)
      expect(result).toHaveLength(4)
    })

    it('adds AOVE to LUNCH when missing', () => {
      const entries = [
        { food: cerealFood, rations: 1, mealType: MealType.BREAKFAST },
        { food: aoveFood, rations: 1, mealType: MealType.BREAKFAST },
        { food: aoveFood, rations: 1, mealType: MealType.DINNER },
      ]
      const result = enforceAOVE(entries, 1)
      expect(result).toHaveLength(4)
      const added = result.find(e => e.mealType === MealType.LUNCH && e.food.category === FoodCategory.OLIVE_OIL)
      expect(added).toBeDefined()
    })

    it('does not crash when no OLIVE_OIL food is available', () => {
      const entries = [
        { food: cerealFood, rations: 1, mealType: MealType.BREAKFAST },
      ]
      expect(() => enforceAOVE(entries, 1)).not.toThrow()
    })
  })
})

describe('weekly items alternation', () => {
    it('assigns first weekly item on day 1 to LUNCH and second to DINNER', () => {
      const plan = generateWeeklyPlan(false)
      const day1 = plan.days[0]
      const weeklyEntries = day1.entries.filter(e =>
        [FoodCategory.LEGUMES, FoodCategory.EGGS, FoodCategory.FISH, FoodCategory.DAIRY, FoodCategory.WHITE_MEAT].includes(e.food.category),
      )
      // Day 1 has LEGUMES and EGGS → first is LUNCH, second is DINNER
      const weeklyMeals = weeklyEntries.map(e => e.mealType)
      expect(weeklyMeals[0]).toBe(MealType.LUNCH)
      expect(weeklyMeals[1]).toBe(MealType.DINNER)
    })

    it('does not assign weekly items to BREAKFAST or SNACK', () => {
      const plan = generateWeeklyPlan(false)
      for (const day of plan.days) {
        for (const entry of day.entries) {
          if ([FoodCategory.LEGUMES, FoodCategory.EGGS, FoodCategory.FISH, FoodCategory.DAIRY, FoodCategory.WHITE_MEAT].includes(entry.food.category)) {
            expect(entry.mealType).not.toBe(MealType.BREAKFAST)
            expect(entry.mealType).not.toBe(MealType.SNACK)
          }
        }
      }
    })
  })

describe('high-priority food selection', () => {
  it('prioritizes Bacalao over other FISH in plan generation', () => {
    const plan = generateWeeklyPlan(false)
    // Bacalao is isHighPriority: true. Collect all FISH entries across the week.
    const allFish = plan.days.flatMap(d => d.entries.filter(e => e.food.category === FoodCategory.FISH))
    expect(allFish.length).toBeGreaterThan(0)
    // At least one Bacalao entry must appear — it's prioritized first among FISH
    const bacalaoEntries = allFish.filter(e => e.food.name.toLowerCase().includes('bacalao'))
    expect(bacalaoEntries.length).toBeGreaterThanOrEqual(1)
    expect(bacalaoEntries[0].food.isHighPriority).toBe(true)
  })
})
})
