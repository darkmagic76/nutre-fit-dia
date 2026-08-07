// Re-export barrel — delegates to @domain/sustainability
export {
  Seasonality,
  Proximity,
  PackagingLevel,
  type SeasonalityType,
  type ProximityType,
  type PackagingLevelType,
  type EnvironmentalScore,
  PROTEIN_EMISSION_RATIOS,
  CARBON_THRESHOLDS,
  CARBON_CATEGORY_SCORES,
  SCORING_WEIGHTS,
  SEASONALITY_SCORES,
  PROXIMITY_SCORES,
  computeEnvironmentalScore,
  suggestAlternative,
  BLUE_FISH_IDS,
} from '../../domain/sustainability/index';
