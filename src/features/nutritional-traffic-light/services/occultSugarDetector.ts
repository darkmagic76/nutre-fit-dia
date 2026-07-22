/**
 * Occult sugar detection per FR-3.2 (INFORME_ADR) and SPECS_TECH §3.
 *
 * Scans ingredient lists for hidden added sugars (sacarosa, jarabe, sirope,
 * maltodextrina, concentrado de zumo, etc.) that compromise glycemic control.
 *
 * Detection is language-aware: matches both Spanish ingredient labels.
 */

import { SUGAR_ALIASES } from '@shared/domain/sugarAliases';

const TRANS_FAT_PATTERNS = [
  'grasa hidrogenada',
  'grasa parcialmente hidrogenada',
  'aceite hidrogenado',
  'margarina',
];

export interface OccultDetectionResult {
  hasOccultSugars: boolean;
  detectedSugars: string[];
  hasTransFats: boolean;
  detectedTransFats: string[];
}

/**
 * Detects occult sugars and trans fats in a food's label.
 * Primary input: food.harmfulIngredients (pre-parsed).
 * Secondary input: any ingredient string list (raw OCR text).
 */
export function detectOccultSubstances(ingredients: string[]): OccultDetectionResult {
  const normalizedIngredients = ingredients.map((i) => i.toLowerCase().trim());

  const detectedSugars = SUGAR_ALIASES.filter((pattern) =>
    normalizedIngredients.some((ingredient) => ingredient.includes(pattern)),
  );

  const detectedTransFats = TRANS_FAT_PATTERNS.filter((pattern) =>
    normalizedIngredients.some((ingredient) => ingredient.includes(pattern)),
  );

  return {
    hasOccultSugars: detectedSugars.length > 0,
    detectedSugars,
    hasTransFats: detectedTransFats.length > 0,
    detectedTransFats,
  };
}

/**
 * Convenience: detect occult substances from a Food entity's harmfulIngredients.
 */
export function detectOccultFromFood(harmfulIngredients: string[]): OccultDetectionResult {
  return detectOccultSubstances(harmfulIngredients);
}
