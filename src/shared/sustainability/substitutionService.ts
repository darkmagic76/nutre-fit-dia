/**
 * ADR-007 / SPECS_TECH §4: Sustainable food substitution service.
 *
 * Given a high-carbon-protein food, suggest up to 3 protein-equivalent
 * alternatives (LEGUMES + blue FISH) ranked by environmental score descending.
 * Pure function — zero side effects, reads the in-memory food catalog.
 */

import type { Food } from '@shared/domain'
import { FoodCategory } from '@shared/domain'
import { foods } from '@shared/data/foods'
import { computeEnvironmentalScore } from './scoringService'

/**
 * Blue fish IDs validated against AESAN 2.4.2.1.
 * Salmon and sardines are classified as blue (fatty) fish per AESAN guidelines.
 */
export const BLUE_FISH_IDS = ['fish-sardinas', 'fish-salmon'] as const

/**
 * Determine whether a food item should trigger substitution.
 * Trigger when the food is WHITE_MEAT or has a high carbon footprint (≥ 4.0).
 */
function isTriggerFood(food: Food): boolean {
  return food.category === FoodCategory.WHITE_MEAT || (food.carbonFootprint ?? 0) >= 4.0
}

/**
 * Check whether a food item is a blue fish (FISH category + known blue fish ID).
 */
function isBlueFish(food: Food): boolean {
  return food.category === FoodCategory.FISH && (BLUE_FISH_IDS as readonly string[]).includes(food.id)
}

/**
 * Given a high-carbon-protein food, suggest protein-equivalent alternatives
 * from LEGUMES and blue FISH ranked by environmental score descending.
 *
 * @param food - The input food to find substitutes for.
 * @returns At most 3 Food items sorted by score descending, or [] if no trigger or no candidates.
 */
export function suggestAlternative(food: Food): Food[] {
  // Step 1: Trigger gate — only high-carbon or white_meat foods trigger substitution
  if (!isTriggerFood(food)) {
    return []
  }

  // Step 2: Filter candidates — LEGUMES + blue FISH, exclude self
  const candidates = foods.filter(f =>
    f.id !== food.id &&
    (
      f.category === FoodCategory.LEGUMES ||
      isBlueFish(f)
    ),
  )

  if (candidates.length === 0) {
    return []
  }

  // Step 3: Score, sort descending, top 3
  return candidates
    .map(f => ({ food: f, score: computeEnvironmentalScore(f).score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(entry => entry.food)
}
