import { describe, it, expect } from 'vitest';
import {
  CEREAL_RESTRICTED_MAX,
  CEREAL_MIN_RATIONS,
  VEGETABLE_MIN_RATIONS,
  VEGETABLE_NUDGE_HOUR_THRESHOLD,
  FRUIT_MIN_RATIONS,
  ANIMAL_PROTEIN_NUDGE_THRESHOLD,
  WATER_MIN_RATIONS,
  HYPERGLYCEMIA_THRESHOLD_MG_DL,
  LEGUMES_CHECK_DAY_THRESHOLD,
  LEGUMES_MIN_WEEKLY_CHECK,
  FISH_EXCESS_THRESHOLD,
  WEEKLY_ACTIVITY_MINUTES_TARGET,
  MAX_ALTERNATIVES_TO_SHOW,
  LOW_ENVIRONMENTAL_SCORE_THRESHOLD,
} from './clinical';

describe('clinical constants', () => {
  it('exports all 14 clinical thresholds with correct values', () => {
    // Existing constant — CEREAL_RESTRICTED_MAX preserved unchanged
    expect(CEREAL_RESTRICTED_MAX).toBe(4);

    // Nutritional thresholds (AESAN 2022 / PREDIMED-Plus / WHO)
    expect(CEREAL_MIN_RATIONS).toBe(3);
    expect(VEGETABLE_MIN_RATIONS).toBe(3);
    expect(VEGETABLE_NUDGE_HOUR_THRESHOLD).toBe(14);
    expect(FRUIT_MIN_RATIONS).toBe(2);
    expect(WATER_MIN_RATIONS).toBe(4);

    // Behavioral thresholds
    expect(ANIMAL_PROTEIN_NUDGE_THRESHOLD).toBe(2);
    expect(HYPERGLYCEMIA_THRESHOLD_MG_DL).toBe(180);
    expect(LEGUMES_CHECK_DAY_THRESHOLD).toBe(4);
    expect(LEGUMES_MIN_WEEKLY_CHECK).toBe(1);
    expect(FISH_EXCESS_THRESHOLD).toBe(7);
    expect(WEEKLY_ACTIVITY_MINUTES_TARGET).toBe(150);
    // VEGETABLE_NUDGE_HOUR_THRESHOLD already tested above — verify idempotent
    expect(VEGETABLE_NUDGE_HOUR_THRESHOLD).toBe(14);

    // Sustainability thresholds
    expect(MAX_ALTERNATIVES_TO_SHOW).toBe(3);
    expect(LOW_ENVIRONMENTAL_SCORE_THRESHOLD).toBe(30);
  });

  it('exports CEREAL_RESTRICTED_MAX equal to 4', () => {
    // Separate test per REQ-CEREAL-RESTRICTED-MAX-PRESERVED
    expect(CEREAL_RESTRICTED_MAX).toBe(4);
  });
});
