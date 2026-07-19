import type { Food } from '@shared/domain'
import { FoodCategory, TrafficLightColor } from '@shared/domain'
import { detectOccultFromFood } from './occultSugarDetector'
import { computeEnvironmentalScore } from '@shared/sustainability'
import type { EnvironmentalScore } from '@shared/sustainability'

/**
 * Classifies a food into Green/Orange/Red per FR-3.1 (Semáforo Nutricional, Modelo Hospital Rey Juan Carlos)
 * and SPECS_TECH §3.
 *
 * Priority order:
 * 1. Occult sugars detected → RED (FR-3.2 — overrides everything)
 * 2. Trans fats → RED
 * 3. Category-based defaults
 * 4. Specific overrides (high GI fruits, processed items)
 */

/** Default classification per FoodCategory when no occult/trans fat is present */
const CATEGORY_DEFAULTS: Record<FoodCategory, TrafficLightColor> = {
  [FoodCategory.CEREALS]: TrafficLightColor.ORANGE,     // refined risk; whole-grain override below
  [FoodCategory.VEGETABLES]: TrafficLightColor.GREEN,
  [FoodCategory.FRUITS]: TrafficLightColor.GREEN,
  [FoodCategory.OLIVE_OIL]: TrafficLightColor.GREEN,
  [FoodCategory.DAIRY]: TrafficLightColor.ORANGE,
  [FoodCategory.LEGUMES]: TrafficLightColor.GREEN,
  [FoodCategory.FISH]: TrafficLightColor.GREEN,
  [FoodCategory.EGGS]: TrafficLightColor.GREEN,
  [FoodCategory.WHITE_MEAT]: TrafficLightColor.ORANGE,
  [FoodCategory.WATER]: TrafficLightColor.GREEN,
}

/**
 * FR-3.2: "Si se detecta coincidencia en ingredientes, el producto se clasificará
 * automáticamente como Rojo (Evitar), independientemente de su aporte calórico total."
 */
export function classifyFood(food: Food): TrafficLightColor {
  const detection = detectOccultFromFood(food.harmfulIngredients)

  // Rule 1: occult sugars → RED (clinical override)
  if (detection.hasOccultSugars) {
    return TrafficLightColor.RED
  }

  // Rule 2: trans fats → RED
  if (detection.hasTransFats || food.hasTransFats) {
    return TrafficLightColor.RED
  }

  // Rule 3: category default
  return CATEGORY_DEFAULTS[food.category]
}

export interface ClassificationResult {
  color: TrafficLightColor
  reasons: string[]
  /** Environmental sustainability score (ADR-007). Optional — degrades gracefully when carbon data is missing. */
  environmentalScore?: EnvironmentalScore
}

export function classifyFoodWithReasons(food: Food): ClassificationResult {
  const detection = detectOccultFromFood(food.harmfulIngredients)
  const reasons: string[] = []

  if (detection.hasOccultSugars) {
    reasons.push(`Azúcares ocultos detectados: ${detection.detectedSugars.join(', ')}`)
    return { color: TrafficLightColor.RED, reasons }
  }

  if (detection.hasTransFats || food.hasTransFats) {
    reasons.push('Contiene grasas trans')
    return { color: TrafficLightColor.RED, reasons }
  }

  if (food.isProcessed && food.harmfulIngredients.length > 0) {
    reasons.push('Producto procesado con ingredientes no recomendados')
  }

  const color = CATEGORY_DEFAULTS[food.category]
  const environmentalScore = computeEnvironmentalScore(food)
  return { color, reasons, environmentalScore }
}
