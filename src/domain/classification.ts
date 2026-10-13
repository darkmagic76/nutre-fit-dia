import type { Food } from './food';
import { FoodCategory } from './foodCategory';
import { TrafficLightColor } from './trafficLight';
import type { EnvironmentalScore } from './sustainability';

/**
 * Canonical nutrition vocabulary — single source of truth for added-sugar
 * alias patterns on Spanish ingredient labels.
 *
 * Union of patterns from the occult-sugar detector and the scanner adapter.
 * Each consumer applies its own matching semantics (includes vs Set.has).
 * Lives in domain: it is nutrition vocabulary, not UI copy.
 */
export const SUGAR_ALIASES = [
  'azúcar',
  'azucar',
  'sacarosa',
  'sacarina',
  'jarabe',
  'glucosa',
  'fructosa',
  'dextrosa',
  'maltosa',
  'sirope',
  'melaza',
  'miel',
  'maltodextrina',
  'concentrado de zumo',
  'néctar',
  'nectar',
  'panela',
  'zumo concentrado',
  'zumo de fruta concentrado',
];

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
 * Occult sugar detection per FR-3.2 (INFORME_ADR) and SPECS_TECH §3.
 *
 * Scans ingredient lists for hidden added sugars (sacarosa, jarabe, sirope,
 * maltodextrina, concentrado de zumo, etc.) that compromise glycemic control.
 *
 * Detection is language-aware: matches both Spanish ingredient labels.
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

/** Default classification per FoodCategory when no occult/trans fat is present */
const CATEGORY_DEFAULTS: Record<FoodCategory, TrafficLightColor> = {
  // Cereals default to ORANGE (refined-grain risk). Whole-grain vs refined is NOT
  // yet distinguished: the Food model has no `isWholeGrain` attribute, and ADR-005
  // defers that distinction to future work. Do not claim an override that does not
  // exist here (ADR-014 slice 3 — traceability fix C2).
  [FoodCategory.CEREALS]: TrafficLightColor.ORANGE,
  [FoodCategory.VEGETABLES]: TrafficLightColor.GREEN,
  [FoodCategory.FRUITS]: TrafficLightColor.GREEN,
  [FoodCategory.OLIVE_OIL]: TrafficLightColor.GREEN,
  [FoodCategory.DAIRY]: TrafficLightColor.ORANGE,
  [FoodCategory.LEGUMES]: TrafficLightColor.GREEN,
  [FoodCategory.FISH]: TrafficLightColor.GREEN,
  [FoodCategory.EGGS]: TrafficLightColor.GREEN,
  [FoodCategory.WHITE_MEAT]: TrafficLightColor.ORANGE,
  [FoodCategory.RED_MEAT]: TrafficLightColor.ORANGE,
  [FoodCategory.WATER]: TrafficLightColor.GREEN,
  [FoodCategory.NUTS]: TrafficLightColor.GREEN,
  [FoodCategory.TUBERS]: TrafficLightColor.GREEN,
};

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
export function classifyFood(food: Food): TrafficLightColor {
  const detection = detectOccultFromFood(food.harmfulIngredients);

  // Rule 1: occult sugars → RED (clinical override)
  if (detection.hasOccultSugars) {
    return TrafficLightColor.RED;
  }

  // Rule 2: trans fats → RED
  if (detection.hasTransFats || food.hasTransFats) {
    return TrafficLightColor.RED;
  }

  // Rule 3: category default
  return CATEGORY_DEFAULTS[food.category];
}

export interface ClassificationResult {
  color: TrafficLightColor;
  reasons: string[];
  /** Environmental sustainability score (ADR-007). Optional — degrades gracefully when carbon data is missing. */
  environmentalScore?: EnvironmentalScore;
}
