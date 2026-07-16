import { z } from 'zod'
import { FoodCategorySchema } from './foodCategory'

export const FoodSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: FoodCategorySchema,
  /** Grams per standard ration (AESAN portion) */
  gramsPerRation: z.number().positive(),
  /** kcal per 100g */
  kcalPer100g: z.number().min(0),
  /** g per 100g */
  proteinPer100g: z.number().min(0),
  /** g per 100g */
  carbsPer100g: z.number().min(0),
  /** g per 100g — specifically fiber content */
  fiberPer100g: z.number().min(0).default(0),
  /** g per 100g */
  fatPer100g: z.number().min(0),
  /** g per 100g — saturated fat */
  saturatedFatPer100g: z.number().min(0).default(0),
  /** g per 100g — added sugars (if any) */
  addedSugarsPer100g: z.number().min(0).default(0),
  /** Ingredients that trigger occult sugar detection (FR-3.2) */
  harmfulIngredients: z.array(z.string()).default([]),
  /** Whether this food contains trans fats */
  hasTransFats: z.boolean().default(false),
  /** Whether this is a "processed" food (scanner target) */
  isProcessed: z.boolean().default(false),
  /** kg CO2eq per kg of food (ADR-007, optional for V1) */
  carbonFootprint: z.number().min(0).optional(),
  /** Whether in season for Iberian peninsula (simplified) */
  isSeasonal: z.boolean().default(false),
})

export type Food = z.infer<typeof FoodSchema>

/** Factory: creates a Food with defaults filled in (avoids repeating defaults in data declarations) */
export function food(input: z.input<typeof FoodSchema>): Food {
  return FoodSchema.parse(input)
}
