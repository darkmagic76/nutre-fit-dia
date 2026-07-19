export {
  Seasonality,
  Proximity,
  PackagingLevel,
} from './types'

export type {
  Seasonality as SeasonalityType,
  Proximity as ProximityType,
  PackagingLevel as PackagingLevelType,
  EnvironmentalScore,
} from './types'

export {
  PROTEIN_EMISSION_RATIOS,
  CARBON_THRESHOLDS,
  CARBON_CATEGORY_SCORES,
  SCORING_WEIGHTS,
  SEASONALITY_SCORES,
  PROXIMITY_SCORES,
} from './constants'

export { computeEnvironmentalScore } from './scoringService'
export { suggestAlternative, BLUE_FISH_IDS } from './substitutionService'
