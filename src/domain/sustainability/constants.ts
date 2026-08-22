/** ADR-007: Sustainability scoring — reference data from Poore & Nemecek (2018), EAT-Lancet */

/**
 * Relative emission ratios from Poore & Nemecek (2018) emission data.
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
} as const;

/**
 * Carbon footprint thresholds for categorization (kg CO2eq per kg of food).
 * Based on Poore & Nemecek (2018) emission data and EAT-Lancet planetary boundaries.
 * NOTE: The official dietary report does not publish numerical CO2eq values — only qualitative assessments.
 */
export const CARBON_THRESHOLDS = {
  VERY_LOW: 0.5,
  LOW: 1.5,
  MODERATE: 3.0,
  HIGH: 5.0,
} as const;

/** Score assigned to each carbon category. Higher = more sustainable. */
export const CARBON_CATEGORY_SCORES = {
  very_low: 100,
  low: 80,
  moderate: 60,
  high: 40,
  very_high: 20,
  unknown: 50,
} as const;

/**
 * Scoring weights for the composite environmental score.
 * Configurable — clinical teams can tune without code changes.
 *
 * NOTE: These are design weights, not AESAN 2022 priorities.
 * Carbon dominates (50%) per Poore & Nemecek (2018) findings on food system emissions.
 * Seasonality second (30%) — local/seasonal reduces transport emissions.
 * Proximity third (20%) — complements seasonality for food miles.
 */
export const SCORING_WEIGHTS = {
  carbon: 0.5,
  seasonality: 0.3,
  proximity: 0.2,
} as const;

/** Seasonality score mapping */
export const SEASONALITY_SCORES = {
  in_season: 100,
  greenhouse: 60,
  out_of_season: 30,
} as const;

/** Proximity score mapping */
export const PROXIMITY_SCORES = {
  km0: 100,
  national: 60,
  imported: 30,
} as const;
