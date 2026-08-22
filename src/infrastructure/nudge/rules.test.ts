import { describe, it, expect } from 'vitest';
import { NUDGE_RULES } from './rules';
import { FoodCategory } from '@domain/foodCategory';
import type { NudgeContext } from '@domain/nudgeTypes';

function makeContext(overrides: Partial<NudgeContext> = {}): NudgeContext {
  return {
    counts: {
      cereals: 0,
      vegetables: 0,
      fruits: 0,
      olive_oil: 0,
      dairy: 0,
      legumes: 0,
      fish: 0,
      eggs: 0,
      white_meat: 0,
      red_meat: 0,
      water: 0,
      nuts: 0,
      tubers: 0,
    },
    animalProteinCount: 0,
    waterRations: 0,
    containsHighGlycemicFruit: false,
    hasBacalao: false,
    hasEggs: false,
    caloricRestrictionActive: false,
    dayOfWeek: 5,
    currentHour: 12,
    now: Date.now(),
    lastGlucoseTimestamp: null,
    lastWeightTimestamp: null,
    latestGlucose: null,
    weeklyActivityMinutes: 0,
    environmentalScore: null,
    alternatives: null,
    ...overrides,
  };
}

describe('nudge rules — TUBERS', () => {
  it('TUBERS_EXCESS nudge fires when weekly count >= 6', () => {
    const rule = NUDGE_RULES.find((r) => r.id === 'TUBERS_EXCESS');
    expect(rule).toBeDefined();
    const ctx = makeContext({ counts: { ...makeContext().counts, [FoodCategory.TUBERS]: 6 } });
    expect(rule!.condition(ctx)).toBe(true);
  });

  it('TUBERS_EXCESS nudge does NOT fire when weekly count === 5', () => {
    const rule = NUDGE_RULES.find((r) => r.id === 'TUBERS_EXCESS');
    expect(rule).toBeDefined();
    const ctx = makeContext({ counts: { ...makeContext().counts, [FoodCategory.TUBERS]: 5 } });
    expect(rule!.condition(ctx)).toBe(false);
  });

  it('no TUBERS_DEFICIT nudge exists', () => {
    const deficitRule = NUDGE_RULES.find(
      (r) => r.id.includes('TUBERS') && r.id.includes('DEFICIT'),
    );
    expect(deficitRule).toBeUndefined();
  });
});
