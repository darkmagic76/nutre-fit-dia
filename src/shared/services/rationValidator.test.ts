import { describe, it, expect } from 'vitest'
import { validateRations, validateWeeklyRations, countRations, emptyCounts, AESAN_GRAM_STANDARDS, validateFoodPortions } from './rationValidator'
import { FoodCategory } from '@shared/domain'
import type { CountByCategory } from './rationValidator'
import { makeEntries, makeFood } from '@/test/fixtures'

function countsWith(overrides: Partial<CountByCategory> = {}): CountByCategory {
  return { ...emptyCounts(), ...overrides }
}

describe('rationValidator', () => {
  describe('validateRations (daily)', () => {
    it('passes with a balanced daily intake', () => {
      const entries = [
        ...makeEntries(FoodCategory.CEREALS, 4),
        ...makeEntries(FoodCategory.VEGETABLES, 3),
        ...makeEntries(FoodCategory.FRUITS, 2),
        ...makeEntries(FoodCategory.OLIVE_OIL, 3),
        ...makeEntries(FoodCategory.WATER, 5),
      ]
      const counts = countRations(entries)
      const result = validateRations(counts, false)
      expect(result.valid).toBe(true)
      expect(result.violations).toEqual([])
    })

    it('fails when cereals exceed 6 (no restriction)', () => {
      const counts = countsWith({ [FoodCategory.CEREALS]: 7 })
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('over')
      expect(result.violations[0].category).toBe(FoodCategory.CEREALS)
    })

    it('fails when cereals exceed 4 with caloric restriction active', () => {
      const counts = countsWith({ [FoodCategory.CEREALS]: 5 })
      const result = validateRations(counts, true)
      expect(result.valid).toBe(false)
      expect(result.violations[0].limit).toBe(4)
    })

    it('passes with 4 cereals when restriction is active', () => {
      const counts = countsWith({
        [FoodCategory.CEREALS]: 4,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      })
      const result = validateRations(counts, true)
      expect(result.valid).toBe(true)
    })

    it('fails when vegetables are below minimum (3)', () => {
      const counts = countsWith({
        [FoodCategory.VEGETABLES]: 2,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      })
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('under')
      expect(result.violations[0].category).toBe(FoodCategory.VEGETABLES)
    })

    it('fails when fruits exceed max (3)', () => {
      const counts = countsWith({
        [FoodCategory.FRUITS]: 4,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      })
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('over')
    })

    it('fails when dairy exceeds max (3)', () => {
      const counts = countsWith({
        [FoodCategory.DAIRY]: 5,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      })
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('over')
    })

    it('passes with 3 dairy (at limit)', () => {
      const counts = countsWith({
        [FoodCategory.DAIRY]: 3,
        [FoodCategory.CEREALS]: 3,
        [FoodCategory.VEGETABLES]: 3,
        [FoodCategory.FRUITS]: 2,
        [FoodCategory.OLIVE_OIL]: 3,
        [FoodCategory.WATER]: 4,
      })
      const result = validateRations(counts, false)
      expect(result.valid).toBe(true)
    })

    it('fails when AOVE exceeds max (6)', () => {
      const counts = countsWith({ [FoodCategory.OLIVE_OIL]: 7 })
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
    })

    it('fails when water is below min (4)', () => {
      const counts = countsWith({ [FoodCategory.WATER]: 2 })
      const result = validateRations(counts, false)
      expect(result.valid).toBe(false)
      expect(result.violations[0].direction).toBe('under')
    })
  })

  describe('validateWeeklyRations', () => {
    it('passes with balanced weekly intake', () => {
      const counts = countsWith({
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 3,
        [FoodCategory.EGGS]: 3,
        [FoodCategory.WHITE_MEAT]: 2,
      })
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(true)
    })

    it('fails when legumes are below 4/week', () => {
      const counts = countsWith({ [FoodCategory.LEGUMES]: 2 })
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.LEGUMES)
    })

    it('fails when fish is below 3/week', () => {
      const counts = countsWith({
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 1,
      })
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.FISH)
    })

    it('fails when eggs exceed 4/week', () => {
      const counts = countsWith({
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 3,
        [FoodCategory.EGGS]: 5,
      })
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.EGGS)
    })

    it('fails when white meat exceeds 3/week', () => {
      const counts = countsWith({
        [FoodCategory.LEGUMES]: 4,
        [FoodCategory.FISH]: 3,
        [FoodCategory.WHITE_MEAT]: 4,
      })
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations[0].category).toBe(FoodCategory.WHITE_MEAT)
    })

    it('fails cross-rule: white meat with excessive fish', () => {
      const counts = countsWith({
        [FoodCategory.FISH]: 100,
        [FoodCategory.WHITE_MEAT]: 1,
      })
      const result = validateWeeklyRations(counts)
      expect(result.valid).toBe(false)
      expect(result.violations.some(v => v.category === FoodCategory.WHITE_MEAT)).toBe(true)
    })
  })

  describe('animalProteinCount', () => {
    it('counts dairy, fish, eggs, and white meat as animal protein', () => {
      const counts = countsWith({
        [FoodCategory.DAIRY]: 2,
        [FoodCategory.FISH]: 1,
        [FoodCategory.EGGS]: 1,
        [FoodCategory.WHITE_MEAT]: 1,
      })
      const result = validateRations(counts, false)
      expect(result.animalProteinCount).toBe(5)
    })

    it('does not count legumes as animal protein', () => {
      const counts = countsWith({ [FoodCategory.LEGUMES]: 4 })
      const result = validateRations(counts, false)
      expect(result.animalProteinCount).toBe(0)
    })
  })

  describe('countRations', () => {
    it('counts entries per category', () => {
      const entries = [
        ...makeEntries(FoodCategory.CEREALS, 3),
        ...makeEntries(FoodCategory.VEGETABLES, 4),
        ...makeEntries(FoodCategory.FISH, 2),
      ]
      const counts = countRations(entries)
      expect(counts[FoodCategory.CEREALS]).toBe(3)
      expect(counts[FoodCategory.VEGETABLES]).toBe(4)
      expect(counts[FoodCategory.FISH]).toBe(2)
    })
  })

  describe('AESAN_GRAM_STANDARDS', () => {
    it('covers all 10 food categories', () => {
      expect(Object.keys(AESAN_GRAM_STANDARDS)).toHaveLength(10)
    })

    it('has valid bread range (40-60g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.CEREALS]).toEqual({ min: 40, max: 60 })
    })

    it('has valid fish range (150-200g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.FISH]).toEqual({ min: 150, max: 200 })
    })
  })

  describe('validateFoodPortions', () => {
    it('returns empty for food within standard', () => {
      const food = makeFood({ category: FoodCategory.CEREALS, gramsPerRation: 50 })
      expect(validateFoodPortions([food])).toEqual([])
    })

    it('returns warning for portion below minimum', () => {
      const food = makeFood({ category: FoodCategory.CEREALS, gramsPerRation: 30 })
      const alerts = validateFoodPortions([food])
      expect(alerts).toHaveLength(1)
      expect(alerts[0].severity).toBe('warning')
      expect(alerts[0].code).toBe('PORTION_TOO_SMALL')
      expect(alerts[0].acknowledgeRequired).toBe(false)
    })

    it('returns critical for portion above maximum', () => {
      const food = makeFood({ category: FoodCategory.FISH, gramsPerRation: 250 })
      const alerts = validateFoodPortions([food])
      expect(alerts).toHaveLength(1)
      expect(alerts[0].severity).toBe('critical')
      expect(alerts[0].code).toBe('PORTION_TOO_LARGE')
      expect(alerts[0].acknowledgeRequired).toBe(true)
    })

    it('returns alert for portion below minimum (warning)', () => {
      const food = makeFood({ category: FoodCategory.WATER, gramsPerRation: 100 })
      const alerts = validateFoodPortions([food])
      expect(alerts).toHaveLength(1)
      expect(alerts[0].severity).toBe('warning')
    })

    it('returns alerts for multiple foods', () => {
      const small = makeFood({ category: FoodCategory.CEREALS, gramsPerRation: 20 })
      const large = makeFood({ category: FoodCategory.FISH, gramsPerRation: 300 })
      const alerts = validateFoodPortions([small, large])
      expect(alerts).toHaveLength(2)
    })

    it('accepts food at exact boundary', () => {
      const min = makeFood({ category: FoodCategory.CEREALS, gramsPerRation: 40 })
      const max = makeFood({ category: FoodCategory.CEREALS, gramsPerRation: 60 })
      expect(validateFoodPortions([min])).toEqual([])
      expect(validateFoodPortions([max])).toEqual([])
    })
  })
})
