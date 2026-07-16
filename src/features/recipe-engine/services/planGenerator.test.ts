import { describe, it, expect } from 'vitest'
import { generateWeeklyPlan, getWeeklyCounts } from './planGenerator'
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
