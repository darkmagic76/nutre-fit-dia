import { describe, it, expect, beforeEach } from 'vitest';
import { buildNudgeContext, evaluateRules } from './engine';
import { CooldownTracker } from '@shared/nudge';
import { NUDGE_RULES } from './rules';
import { useTrackerStore, useLogStore } from '@shared/stores';
import { FoodCategory } from '@shared/domain';
import { makeFood } from '@/test/fixtures';
import { emptyCounts } from '@shared/services/rationValidator';
import type { NudgeContext } from '@shared/nudge';

const cerealFood = makeFood({
  id: 'c1',
  name: 'Pan integral',
  category: FoodCategory.CEREALS,
});

const glycemicFruit = makeFood({
  id: 'gf1',
  name: 'Uvas',
  category: FoodCategory.FRUITS,
});

describe('buildNudgeContext', () => {
  beforeEach(() => {
    useTrackerStore.setState({ restrictionActive: false });
    useLogStore.setState({ todayLog: [] });
  });

  it('reads restrictionActive from trackerStore and counts from logStore', () => {
    useTrackerStore.setState({ restrictionActive: true });
    useLogStore.setState({ todayLog: [cerealFood, cerealFood, cerealFood] });

    const ctx = buildNudgeContext();
    expect(ctx.restrictionActive).toBe(true);
    expect(ctx.counts[FoodCategory.CEREALS]).toBe(3);
    expect(ctx.containsHighGlycemicFruit).toBe(false);
    expect(typeof ctx.currentHour).toBe('number');
  });

  it('detects high-glycemic fruit when food is FRUITS and name in glycemic set', () => {
    useLogStore.setState({ todayLog: [glycemicFruit] });

    const ctx = buildNudgeContext();
    expect(ctx.containsHighGlycemicFruit).toBe(true);
  });

  it('returns false for containsHighGlycemicFruit when log is empty', () => {
    const ctx = buildNudgeContext();
    expect(ctx.containsHighGlycemicFruit).toBe(false);
    expect(ctx.counts[FoodCategory.CEREALS]).toBe(0);
    expect(ctx.counts[FoodCategory.VEGETABLES]).toBe(0);
    expect(ctx.counts[FoodCategory.FRUITS]).toBe(0);
  });

  it('category gate: Uvas in non-FRUITS category does NOT set containsHighGlycemicFruit', () => {
    const nonFruitGlycemic = makeFood({
      id: 'gf2',
      name: 'Uvas',
      category: FoodCategory.VEGETABLES,
    });
    useLogStore.setState({ todayLog: [nonFruitGlycemic] });

    const ctx = buildNudgeContext();
    expect(ctx.containsHighGlycemicFruit).toBe(false);
  });

  it('sets environmentalScore and alternatives when food is provided', () => {
    const highCarbonFood = makeFood({
      id: 'chorizo',
      name: 'Chorizo',
      category: FoodCategory.RED_MEAT,
      carbonFootprint: 8.0,
    });
    const ctx = buildNudgeContext(highCarbonFood);

    expect(ctx.environmentalScore).toBeGreaterThanOrEqual(0);
    expect(ctx.alternatives).not.toBeNull();
    expect(ctx.alternatives!.length).toBeGreaterThan(0);
  });

  it('sets environmentalScore to null and alternatives to null when food is NOT provided', () => {
    const ctx = buildNudgeContext();

    expect(ctx.environmentalScore).toBeNull();
    expect(ctx.alternatives).toBeNull();
  });
});

describe('evaluateRules', () => {
  it('returns matching evaluations when rules match and no cooldown', () => {
    const cooldown = new CooldownTracker(() => 0);
    const ctx: NudgeContext = {
      restrictionActive: true,
      animalProteinCount: 0,
      counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 5, [FoodCategory.OLIVE_OIL]: 1 },
      containsHighGlycemicFruit: false,
      currentHour: 12,
      latestGlucose: null,
      lastGlucoseTimestamp: Date.now(),
      lastWeightTimestamp: Date.now(),
      waterRations: 4,
      hasBacalao: false,
      hasEggs: false,
      weeklyActivityMinutes: 200,
      dayOfWeek: 3,
      environmentalScore: null,
      alternatives: null,
      now: 0,
    };

    const results = evaluateRules(ctx, NUDGE_RULES, cooldown);

    // Only CEREALS_RESTRICTION + FRUITS_DEFICIT should match
    expect(results).toHaveLength(2);
    expect(results[0].rule.id).toBe('CEREALS_RESTRICTION');
    expect(results[0].notification.type).toBe('safety_alert');
    expect(results[0].notification.severity).toBe('hard_block');
  });

  it('returns empty when all matching rules are on cooldown', () => {
    const cooldown = new CooldownTracker(() => 0);
    cooldown.register('CEREALS_RESTRICTION');
    cooldown.register('FRUITS_DEFICIT');

    const ctx: NudgeContext = {
      restrictionActive: true,
      animalProteinCount: 0,
      counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 5, [FoodCategory.OLIVE_OIL]: 1 },
      containsHighGlycemicFruit: false,
      currentHour: 12,
      latestGlucose: null,
      lastGlucoseTimestamp: Date.now(),
      lastWeightTimestamp: Date.now(),
      waterRations: 4,
      hasBacalao: false,
      hasEggs: false,
      weeklyActivityMinutes: 200,
      dayOfWeek: 3,
      environmentalScore: null,
      alternatives: null,
      now: 0,
    };

    const results = evaluateRules(ctx, NUDGE_RULES, cooldown);
    expect(results).toHaveLength(0);
  });

  it('returns empty when no rules match', () => {
    const cooldown = new CooldownTracker(() => 0);
    const ctx: NudgeContext = {
      restrictionActive: false,
      animalProteinCount: 0,
      counts: {
        ...emptyCounts(),
        [FoodCategory.OLIVE_OIL]: 1,
        [FoodCategory.FRUITS]: 3,
        [FoodCategory.CEREALS]: 3,
      },
      containsHighGlycemicFruit: false,
      currentHour: 12,
      latestGlucose: null,
      lastGlucoseTimestamp: Date.now(),
      lastWeightTimestamp: Date.now(),
      waterRations: 4,
      hasBacalao: false,
      hasEggs: false,
      weeklyActivityMinutes: 200,
      dayOfWeek: 3,
      environmentalScore: null,
      alternatives: null,
      now: 0,
    };

    const results = evaluateRules(ctx, NUDGE_RULES, cooldown);
    expect(results).toHaveLength(0);
  });

  it('returns empty when rules array is empty', () => {
    const cooldown = new CooldownTracker(() => 0);
    const ctx: NudgeContext = {
      restrictionActive: true,
      animalProteinCount: 0,
      counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 5, [FoodCategory.OLIVE_OIL]: 1 },
      containsHighGlycemicFruit: false,
      currentHour: 12,
      latestGlucose: null,
      lastGlucoseTimestamp: Date.now(),
      lastWeightTimestamp: Date.now(),
      waterRations: 4,
      hasBacalao: false,
      hasEggs: false,
      weeklyActivityMinutes: 200,
      dayOfWeek: 3,
      environmentalScore: null,
      alternatives: null,
      now: 0,
    };

    const results = evaluateRules(ctx, [], cooldown);
    expect(results).toHaveLength(0);
  });

  it('does NOT mutate its parameters (pure function)', () => {
    const cooldown = new CooldownTracker(() => 0);
    const ctx: NudgeContext = {
      restrictionActive: true,
      animalProteinCount: 0,
      counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 5, [FoodCategory.OLIVE_OIL]: 1 },
      containsHighGlycemicFruit: false,
      currentHour: 12,
      latestGlucose: null,
      lastGlucoseTimestamp: Date.now(),
      lastWeightTimestamp: Date.now(),
      waterRations: 4,
      hasBacalao: false,
      hasEggs: false,
      weeklyActivityMinutes: 200,
      dayOfWeek: 3,
      environmentalScore: null,
      alternatives: null,
      now: 0,
    };
    const rulesCount = NUDGE_RULES.length;

    evaluateRules(ctx, NUDGE_RULES, cooldown);

    // Cooldown should NOT have been mutated by evaluateRules
    expect(cooldown.isOnCooldown('CEREALS_RESTRICTION', 1440)).toBe(false);
    // Rules array should be unchanged
    expect(NUDGE_RULES).toHaveLength(rulesCount);
  });

  it('returns multiple evaluations when multiple rules match', () => {
    const cooldown = new CooldownTracker(() => 0);
    const ctx: NudgeContext = {
      restrictionActive: true,
      animalProteinCount: 0,
      counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 6, [FoodCategory.VEGETABLES]: 1 },
      containsHighGlycemicFruit: true,
      currentHour: 22,
      latestGlucose: null,
      lastGlucoseTimestamp: null,
      lastWeightTimestamp: null,
      waterRations: 0,
      hasBacalao: false,
      hasEggs: false,
      weeklyActivityMinutes: 200,
      dayOfWeek: 3,
      environmentalScore: null,
      alternatives: null,
      now: 0,
    };

    const results = evaluateRules(ctx, NUDGE_RULES, cooldown);

    // Should match: CEREALS_RESTRICTION, FRUITS_GLYCEMIC_ALERT, VEGETABLES_DEFICIT
    // + ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER_HYDRATION + AOVE_TAGGING
    expect(results).toHaveLength(8);
    const matchedIds = results.map((r) => r.rule.id);
    expect(matchedIds).toContain('CEREALS_RESTRICTION');
    expect(matchedIds).toContain('FRUITS_GLYCEMIC_ALERT');
    expect(matchedIds).toContain('VEGETABLES_DEFICIT');
  });
});
