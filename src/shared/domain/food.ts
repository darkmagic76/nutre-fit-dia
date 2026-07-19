import { z } from 'zod'
import { FoodCategorySchema } from './foodCategory'

/**
 * FR-5.2: Cultural and social metadata per UNESCO Mediterranean diet values.
 * Attached to foods that represent traditional preparations, not raw ingredients.
 */
export const CulturalMetadataSchema = z.object({
  /** Indicates a traditional Mediterranean cuisine preparation */
  traditionalCuisine: z.boolean().default(false),
  /** Encourages eating in company — UNESCO social eating value */
  socialEating: z.boolean().default(false),
  /** Cooking technique (if applicable) */
  cookingTechnique: z.enum(['steam', 'boiled', 'grilled', 'raw', 'stew']).optional(),
  /** Geographic origin of the dish */
  geographicOrigin: z.string().optional(),
  /** Biological value of the protein (0–100, higher = more complete amino acid profile) */
  proteinBiologicalValue: z.number().min(0).max(100).optional(),
  /** Whether this preparation is a core erMedDiet staple */
  erMedDiet: z.boolean().default(false),
})

export type CulturalMetadata = z.infer<typeof CulturalMetadataSchema>

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
  /** Whether food has cosmetic defects (odd shape, spots) but is perfectly edible */
  isUglyProduce: z.boolean().default(false),
  /** Whether food is local AND seasonal AND unpackaged (superset of isSeasonal) */
  isZeroWaste: z.boolean().default(false),
  /** High-priority protein source (e.g., Bacalao 0.7% fat per SPECS_TECH §3, INFORME_ADR). planGenerator favors these in selection. */
  isHighPriority: z.boolean().default(false),
  /** kg CO2eq per kg of food (ADR-007, optional for V1) */
  carbonFootprint: z.number().min(0).optional(),
  /** Whether in season for Iberian peninsula (simplified) */
  isSeasonal: z.boolean().default(false),
  /** Cultural and social metadata (FR-5.2, UNESCO). Present on traditional preparations, not raw ingredients. */
  culturalMetadata: CulturalMetadataSchema.optional(),
})

export type Food = z.infer<typeof FoodSchema>

/** Factory: creates a Food with defaults filled in (avoids repeating defaults in data declarations) */
export function food(input: z.input<typeof FoodSchema>): Food {
  return FoodSchema.parse(input)
}
