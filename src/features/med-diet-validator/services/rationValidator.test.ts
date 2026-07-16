import { describe, it, expect } from 'vitest'
import { validateRations, validateWeeklyRations, countRations, emptyCounts } from './rationValidator'
import { FoodCategory } from '@shared/domain'
import type { Food } from '@shared/domain'

function makeEntry(category: FoodCategory, times = 1): Food[] {
  return Array.from({ length: times }, (_, i) => ({
    id: `test-${category}-${i}`,
    name: `Test ${category}`,
    category,
    gramsPerRation: 100,
    kcalPer100g: 100,
    proteinPer100g: 5,
    carbsPer100g: 10,
    fiberPer100g: 2,
    fatPer100g: 2,
    saturatedFatPer100g: 0.5,
    addedSugarsPer100g: 0,
    harmfulIngredients: [],
    hasTransFats: false,
    isProcessed: false,
    isSeasonal: false,
  }))
}

describe('rationValidator', () => {
  describe('validateRations (daily)', () => {
    it('passes with a balanced daily intake', () => {
      const entries = [
        ...makeEntry(FoodCategory.CEREALS, 4),
        ...makeEntry(FoodCategory.VEGETABLES, 3),
        ...makeEntry(FoodCategory.FRUITS, 2),
        ...makeEntry(FoodCategory.OLIVE_OIL, 3),
        ...makeEntry(FoodCategory.WATER, 5),
      ]
      const counts = countRations(entries)
      const result = validateRations(counts, false)
      expect(result.valid).toBe(true)
      expect(result.violations).toEqual([])
    })

    it('fails when cereals exceed 6 (no restriction)', () => {
      const counts = { ...emptyCounts(), [FoodCategory.CEREALS]: 7 }
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('over')
      expect(result.violations[0].category).toBe(FoodCategory.CEREALS)
    })

    it('fails when cereals exceed 4 with caloric restriction active', () => {
      const counts = { ...emptyCounts(), [FoodCategory.CEREALS]: 5 }
      const result = validateRations(counts, true /* restrictionActive */)
      expect(result.valid).toBe(false)
      expect(result.violations[0].limit).toBe(4) // max 4 with restriction
    })

    it('passes with 4 cereals when restriction is active', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.CEREALS]: 4,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      }
      const result = validateRations(counts, true)
      expect(result.valid).toBe(true)
    })

    it('fails when vegetables are below minimum (3)', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.VEGETABLES]: 2,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      }
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('under')
      expect(result.violations[0].category).toBe(FoodCategory.VEGETABLES)
    })

    it('fails when fruits exceed max (3)', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.FRUITS]: 4,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      }
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('over')
    })

    it('fails when dairy exceeds max (3)', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.DAIRY]: 5,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      }
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('over')
    })

    it('passes with 3 dairy (at limit)', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.DAIRY]: 3,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      }
      const result = validateRations(counts, false)
      expect(result.valid).toBe(true)
    })

    it('fails when AOVE exceeds max (6)', () => {
      const counts = { ...emptyCounts(), [FoodCategory.OLIVE_OIL]: 7 }
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
    })

    it('fails when water is below min (4)', () => {
      const counts = { ...emptyCounts(), [FoodCategory.WATER]: 2 }
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('under')
    })
  })

  describe('validateWeeklyRations', () => {
    it('passes with balanced weekly intake', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 3,
        [FoodCategory.EGGS]: 3,
        [FoodCategory.WHITE_MEAT]: 2,
      }
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(true)
    })

    it('fails when legumes are below 4/week', () => {
      const counts = { ...emptyCounts(), [FoodCategory.LEGUMES]: 2 }
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.LEGUMES)
    })

    it('fails when fish is below 3/week', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 1,
      }
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.FISH)
    })

    it('fails when eggs exceed 4/week', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 3,
        [FoodCategory.EGGS]: 5,
      }
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.EGGS)
    })

    it('fails when white meat exceeds 3/week', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 3,
        [FoodCategory.WHITE_MEAT]: 4,
      }
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.WHITE_MEAT)
    })

    it('fails cross-rule: white meat with excessive fish', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.FISH]: 100, // way over
        [FoodCategory.WHITE_MEAT]: 1,
      }
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations.some(v => v.category === FoodCategory.WHITE_MEAT)).toBe(true)
    })
  })

  describe('animalProteinCount', () => {
    it('counts dairy, fish, eggs, and white meat as animal protein', () => {
      const counts = {
        ...emptyCounts(),
        [FoodCategory.DAIRY]: 2,
        [FoodCategory.FISH]: 1,
        [FoodCategory.EGGS]: 1,
        [FoodCategory.WHITE_MEAT]: 1,
      }
      const result = validateRations(counts, false)
      expect(result.animalProteinCount).toBe(5)
    })

    it('does not count legumes as animal protein', () => {
      const counts = { ...emptyCounts(), [FoodCategory.LEGUMES]: 4 }
      const result = validateRations(counts, false)
      expect(result.animalProteinCount).toBe(0)
    })
  })

  describe('countRations', () => {
    it('counts entries per category', () => {
      const entries = [
        ...makeEntry(FoodCategory.CEREALS, 3),
        ...makeEntry(FoodCategory.VEGETABLES, 4),
        ...makeEntry(FoodCategory.FISH, 2),
      ]
      const counts = countRations(entries)
      expect(counts[FoodCategory.CEREALS]).toBe(3)
      expect(counts[FoodCategory.VEGETABLES]).toBe(4)
      expect(counts[FoodCategory.FISH]).toBe(2)
    })
  })
})
