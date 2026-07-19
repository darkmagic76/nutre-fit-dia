import { FoodCategory } from '@shared/domain'
import type { Food } from '@shared/domain'

export function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 'test-food',
    name: 'Test Food',
    category: FoodCategory.VEGETABLES,
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
    ...overrides,
  }
}

export function makeEntries(category: FoodCategory, times = 1): Food[] {
  return Array.from({ length: times }, (_, i) =>
    makeFood({
      id: `test-${category}-${i}`,
      name: `Test ${category}`,
      category,
    }),
  )
}
