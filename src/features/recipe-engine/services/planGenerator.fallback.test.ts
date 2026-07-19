import { describe, it, expect, vi } from 'vitest'
import { FoodCategory } from '@shared/domain'

vi.mock('@shared/data/foods', () => ({
  foods: [
    { id: 'p1', name: 'Cereal P', category: FoodCategory.CEREALS, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p2', name: 'Verdura P', category: FoodCategory.VEGETABLES, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p3', name: 'Fruta P', category: FoodCategory.FRUITS, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p4', name: 'AOVE P', category: FoodCategory.OLIVE_OIL, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p5', name: 'Agua P', category: FoodCategory.WATER, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p6', name: 'Lacteo P', category: FoodCategory.DAIRY, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p7', name: 'Legumbre P', category: FoodCategory.LEGUMES, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p8', name: 'Pescado P', category: FoodCategory.FISH, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p9', name: 'Huevo P', category: FoodCategory.EGGS, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
    { id: 'p10', name: 'Carne P', category: FoodCategory.WHITE_MEAT, gramsPerRation: 100, kcalPer100g: 300, proteinPer100g: 5, carbsPer100g: 40, fiberPer100g: 1, fatPer100g: 10, saturatedFatPer100g: 2, addedSugarsPer100g: 5, harmfulIngredients: [], hasTransFats: false, isProcessed: true, isSeasonal: false, carbonFootprint: 1 },
  ],
}))

import { generateWeeklyPlan } from './planGenerator'

describe('planGenerator fallback — no non-processed foods', () => {
  it('generates a plan using processed foods when no natural options exist', () => {
    const plan = generateWeeklyPlan(false)
    expect(plan.days).toHaveLength(7)
    expect(plan.valid).toBe(true)
  })

  it('every day has processed foods in every required category', () => {
    const plan = generateWeeklyPlan(false)
    for (const day of plan.days) {
      const categories = day.entries.map(e => e.food.category)
      expect(categories).toContain(FoodCategory.CEREALS)
      expect(categories).toContain(FoodCategory.VEGETABLES)
      expect(categories).toContain(FoodCategory.FRUITS)
      expect(categories).toContain(FoodCategory.OLIVE_OIL)
      expect(categories).toContain(FoodCategory.WATER)

      for (const entry of day.entries) {
        expect(entry.food.isProcessed).toBe(true)
      }
    }
  })
})
