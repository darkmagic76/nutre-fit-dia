import { z } from 'zod'

/**
 * Canonical food categories per ADR-005 (10 groups from INFORME_ADR).
 * SPECS_RF (5 groups) and SPECS_TECH (~7) are UI simplifications, not domain replacements.
 */
export const FoodCategory = {
  CEREALS: 'cereals',
  VEGETABLES: 'vegetables',
  FRUITS: 'fruits',
  OLIVE_OIL: 'olive_oil',
  DAIRY: 'dairy',
  LEGUMES: 'legumes',
  FISH: 'fish',
  EGGS: 'eggs',
  WHITE_MEAT: 'white_meat',
  WATER: 'water',
} as const

export type FoodCategory = (typeof FoodCategory)[keyof typeof FoodCategory]

export const FoodCategorySchema = z.enum([
  'cereals',
  'vegetables',
  'fruits',
  'olive_oil',
  'dairy',
  'legumes',
  'fish',
  'eggs',
  'white_meat',
  'water',
])

/** Groups that count toward animal protein (for NudgeEngine: "si Animal_Protein > 2, sugerir calcio vegetal") */
export const ANIMAL_PROTEIN_CATEGORIES: FoodCategory[] = [
  FoodCategory.DAIRY,
  FoodCategory.FISH,
  FoodCategory.EGGS,
  FoodCategory.WHITE_MEAT,
]
