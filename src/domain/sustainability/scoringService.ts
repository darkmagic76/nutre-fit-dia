/** ADR-007: Sustainability scoring service — V1 simplified */

import type { Food } from '@shared/domain';
import { Seasonality, Proximity, PackagingLevel, type EnvironmentalScore } from './types';
import {
  CARBON_THRESHOLDS,
  CARBON_CATEGORY_SCORES,
  SCORING_WEIGHTS,
  SEASONALITY_SCORES,
  PROXIMITY_SCORES,
} from './constants';

function categorizeCarbon(value: number): number {
  if (value < CARBON_THRESHOLDS.VERY_LOW) return CARBON_CATEGORY_SCORES.very_low;
  if (value < CARBON_THRESHOLDS.LOW) return CARBON_CATEGORY_SCORES.low;
  if (value < CARBON_THRESHOLDS.MODERATE) return CARBON_CATEGORY_SCORES.moderate;
  if (value < CARBON_THRESHOLDS.HIGH) return CARBON_CATEGORY_SCORES.high;
  return CARBON_CATEGORY_SCORES.very_high;
}

/**
 * Compute the environmental sustainability score for a food item.
 *
 * V1 simplified algorithm (per ADR-007):
 *   score = carbonScore × 0.50 + seasonalityScore × 0.30 + proximityScore × 0.20
 *
 * - Carbon: maps kg CO2eq/kg to category thresholds → score 0–100
 * - Seasonality: isSeasonal → IN_SEASON (100) or OUT_OF_SEASON (30)
 * - Proximity: inferred from isSeasonal → km0 (100) or national (60)
 * - Packaging: defaults to BULK for V1 (no packaging data available)
 * - WaterFootprint: defaults to 0 for V1 (no water data available)
 *
 * Missing carbonFootprint → neutral score (50) for carbon dimension.
 */
export function computeEnvironmentalScore(food: Food): EnvironmentalScore {
  const carbonValue = food.carbonFootprint ?? 0;
  const carbonScore =
    food.carbonFootprint !== undefined
      ? categorizeCarbon(food.carbonFootprint)
      : CARBON_CATEGORY_SCORES.unknown;

  const isSeasonal = food.isSeasonal === true;
  const seasonScore = isSeasonal ? SEASONALITY_SCORES.in_season : SEASONALITY_SCORES.out_of_season;

  const proximityScore = isSeasonal ? PROXIMITY_SCORES.km0 : PROXIMITY_SCORES.national;

  const score = Math.round(
    carbonScore * SCORING_WEIGHTS.carbon +
      seasonScore * SCORING_WEIGHTS.seasonality +
      proximityScore * SCORING_WEIGHTS.proximity,
  );

  return {
    carbonFootprint: carbonValue,
    waterFootprint: 0,
    seasonality: isSeasonal ? Seasonality.IN_SEASON : Seasonality.OUT_OF_SEASON,
    proximity: isSeasonal ? Proximity.LOCAL_KM0 : Proximity.NATIONAL,
    packaging: PackagingLevel.BULK,
    score,
  };
}
