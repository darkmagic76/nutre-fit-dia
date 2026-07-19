/** ADR-007: Sustainability scoring — reference data from AESAN 2022 / EAT-Lancet */

/**
 * Relative emission ratios from SPECS_TECH §7 and ADR-007.
 * Legumes = baseline (1×). Higher values = proportionally higher emissions.
 */
export const PROTEIN_EMISSION_RATIOS = {
  legumes: 1,
  eggs: 6,
  poultry: 7,
  pork: 11,
  beef: 50,
  fish_white: 4,
  fish_blue: 5,
} as const

/**
 * Carbon footprint thresholds for categorization (kg CO2eq per kg of food).
 * Based on AESAN 2022 reference data and EAT-Lancet planetary boundaries.
 */
export const CARBON_THRESHOLDS = {
  VERY_LOW: 0.5,
  LOW: 1.5,
  MODERATE: 3.0,
  HIGH: 5.0,
} as const

/** Score assigned to each carbon category. Higher = more sustainable. */
export const CARBON_CATEGORY_SCORES = {
  very_low: 100,
  low: 80,
  moderate: 60,
  high: 40,
  very_high: 20,
  unknown: 50,
} as const

/**
 * Scoring weights for the composite environmental score.
 * Configurable — clinical teams can tune without code changes.
 *
 * Carbon dominates (50%) per AESAN 2022 priority on climate impact.
 * Seasonality second (30%) — local/seasonal reduces transport emissions.
 * Proximity third (20%) — complements seasonality for food miles.
 */
export const SCORING_WEIGHTS = {
  carbon: 0.50,
  seasonality: 0.30,
  proximity: 0.20,
} as const

/** Seasonality score mapping */
export const SEASONALITY_SCORES = {
  in_season: 100,
  greenhouse: 60,
  out_of_season: 30,
} as const

/** Proximity score mapping */
export const PROXIMITY_SCORES = {
  km0: 100,
  national: 60,
  imported: 30,
} as const
