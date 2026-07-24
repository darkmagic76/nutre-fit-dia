import { describe, it, expect } from 'vitest';
import { NUDGE_RULES } from './rules';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from '@shared/domain/glycemicFruits';
import { emptyCounts } from '@shared/services/rationValidator';
import { FoodCategory } from '@shared/domain';
import type { NudgeContext } from '@shared/nudge';

function makeContext(overrides: Partial<NudgeContext> = {}): NudgeContext {
  return {
    restrictionActive: false,
    animalProteinCount: 0,
    counts: emptyCounts(),
    containsHighGlycemicFruit: false,
    currentHour: 12,
    latestGlucose: null,
    lastGlucoseTimestamp: null,
    lastWeightTimestamp: null,
    waterRations: 0,
    hasBacalao: false,
    hasEggs: false,
    weeklyActivityMinutes: 0,
    dayOfWeek: 3,
    environmentalScore: null,
    alternatives: null,
    now: 0,
    ...overrides,
  };
}

describe('NUDGE_RULES', () => {
  describe('CEREALS_RESTRICTION', () => {
    const rule = NUDGE_RULES.find((r) => r.id === 'CEREALS_RESTRICTION');
    it('exists with correct id', () => {
      expect(rule).toBeDefined();
    });

    it('fires when restrictionActive and CEREALS > 4', () => {
      const ctx = makeContext({
        restrictionActive: true,
        counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 5 },
      });
      expect(rule!.condition(ctx)).toBe(true);
    });

    it('does NOT fire when restrictionActive is false despite high cereals', () => {
      const ctx = makeContext({
        restrictionActive: false,
        counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 5 },
      });
      expect(rule!.condition(ctx)).toBe(false);
    });

    it('does NOT fire when CEREALS = 4 (boundary, ≤4 is within limit)', () => {
      const ctx = makeContext({
        restrictionActive: true,
        counts: { ...emptyCounts(), [FoodCategory.CEREALS]: 4 },
      });
      expect(rule!.condition(ctx)).toBe(false);
    });
  });

  describe('FRUITS_GLYCEMIC_ALERT', () => {
    const rule = NUDGE_RULES.find((r) => r.id === 'FRUITS_GLYCEMIC_ALERT');
    it('exists with correct id', () => {
      expect(rule).toBeDefined();
    });

    it('fires when containsHighGlycemicFruit is true', () => {
      const ctx = makeContext({ containsHighGlycemicFruit: true });
      expect(rule!.condition(ctx)).toBe(true);
    });

    it('does NOT fire when containsHighGlycemicFruit is false', () => {
      const ctx = makeContext({ containsHighGlycemicFruit: false });
      expect(rule!.condition(ctx)).toBe(false);
    });
  });

  describe('VEGETABLES_DEFICIT', () => {
    const rule = NUDGE_RULES.find((r) => r.id === 'VEGETABLES_DEFICIT');
    it('exists with correct id', () => {
      expect(rule).toBeDefined();
    });

    it('fires when VEGETABLES < 3 and hour >= 14', () => {
      const ctx = makeContext({
        counts: { ...emptyCounts(), [FoodCategory.VEGETABLES]: 2 },
        currentHour: 20,
      });
      expect(rule!.condition(ctx)).toBe(true);
    });

    it('does NOT fire when hour=13 (before afternoon gate)', () => {
      const ctx = makeContext({
        counts: { ...emptyCounts(), [FoodCategory.VEGETABLES]: 2 },
        currentHour: 13,
      });
      expect(rule!.condition(ctx)).toBe(false);
    });

    it('does NOT fire when VEGETABLES = 3 (sufficient)', () => {
      const ctx = makeContext({
        counts: { ...emptyCounts(), [FoodCategory.VEGETABLES]: 3 },
        currentHour: 21,
      });
      expect(rule!.condition(ctx)).toBe(false);
    });
  });
});

describe('HIGH_GLYCEMIC_FRUIT_NAMES set', () => {
  it('contains known high-glycemic fruits', () => {
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('uvas')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('dátiles')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('higos')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('uvas pasas')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('plátano maduro')).toBe(true);
  });

  it('does not contain low-glycemic fruits like manzana', () => {
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('manzana')).toBe(false);
  });
});

describe('DAIRY_CALCIUM_NUDGE', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'DAIRY_CALCIUM_NUDGE');
  it('fires when animalProteinCount > 2', () => {
    expect(rule!.condition(makeContext({ animalProteinCount: 3 }))).toBe(true);
  });
  it('does not fire when animalProteinCount = 2', () => {
    expect(rule!.condition(makeContext({ animalProteinCount: 2 }))).toBe(false);
  });
});

describe('WATER_HYDRATION', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'WATER_HYDRATION');
  it('fires when waterRations < 4', () => {
    expect(rule!.condition(makeContext({ waterRations: 2 }))).toBe(true);
  });
  it('does not fire when waterRations = 4', () => {
    expect(rule!.condition(makeContext({ waterRations: 4 }))).toBe(false);
  });
});

describe('HYPERGLYCEMIA_NUDGE', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'HYPERGLYCEMIA_NUDGE');
  it('fires when glucose > 180', () => {
    expect(rule!.condition(makeContext({ latestGlucose: 200 }))).toBe(true);
  });
  it('does not fire when glucose is null', () => {
    expect(rule!.condition(makeContext({ latestGlucose: null }))).toBe(false);
  });
});

describe('ADHERENCE_GLUCOSE', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'ADHERENCE_GLUCOSE');
  it('fires when lastGlucoseTimestamp is null', () => {
    expect(rule!.condition(makeContext({ lastGlucoseTimestamp: null }))).toBe(true);
  });
  it('does not fire when glucose was recorded recently', () => {
    // now=0, lastGlucoseTimestamp=0 → diff=0 &lt; 4h → no nudge
    expect(rule!.condition(makeContext({ lastGlucoseTimestamp: 0, now: 0 }))).toBe(false);
  });
});

describe('ADHERENCE_WEIGHT', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'ADHERENCE_WEIGHT');
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
  it('fires when lastWeightTimestamp is null', () => {
    expect(rule!.condition(makeContext({ lastWeightTimestamp: null }))).toBe(true);
  });
  it('fires when weight was recorded >4h ago', () => {
    // now=FOUR_HOURS_MS+1, lastWeightTimestamp=0 → diff > 4h → fire
    expect(rule!.condition(makeContext({ lastWeightTimestamp: 0, now: FOUR_HOURS_MS + 1 }))).toBe(
      true,
    );
  });
  it('does not fire when weight was recorded recently', () => {
    // now=0, lastWeightTimestamp=0 → diff=0 < 4h → no nudge
    expect(rule!.condition(makeContext({ lastWeightTimestamp: 0, now: 0 }))).toBe(false);
  });
});

describe('AOVE_TAGGING', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'AOVE_TAGGING');
  it('fires when olive_oil count is 0', () => {
    expect(rule!.condition(makeContext())).toBe(true);
  });
});

describe('LEGUMES_GLYCEMIC_BASE', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'LEGUMES_GLYCEMIC_BASE');
  it('fires on day >= 4 with legumes < 1', () => {
    expect(
      rule!.condition(
        makeContext({ dayOfWeek: 5, counts: { ...emptyCounts(), [FoodCategory.LEGUMES]: 0 } }),
      ),
    ).toBe(true);
  });
  it('does not fire on Monday (day=1)', () => {
    expect(rule!.condition(makeContext({ dayOfWeek: 1 }))).toBe(false);
  });
});

describe('FISH_COD_TAG', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'FISH_COD_TAG');
  it('fires when hasBacalao is true', () => {
    expect(rule!.condition(makeContext({ hasBacalao: true }))).toBe(true);
  });
});

describe('EGGS_RED_MEAT_ALT', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'EGGS_RED_MEAT_ALT');
  it('fires when RED_MEAT > 0 and no eggs', () => {
    expect(
      rule!.condition(
        makeContext({ hasEggs: false, counts: { ...emptyCounts(), [FoodCategory.RED_MEAT]: 1 } }),
      ),
    ).toBe(true);
  });

  it('does NOT fire on white meat alone (no RED_MEAT)', () => {
    expect(
      rule!.condition(
        makeContext({ hasEggs: false, counts: { ...emptyCounts(), [FoodCategory.WHITE_MEAT]: 1 } }),
      ),
    ).toBe(false);
  });

  it('does NOT fire when eggs present even with RED_MEAT', () => {
    expect(
      rule!.condition(
        makeContext({ hasEggs: true, counts: { ...emptyCounts(), [FoodCategory.RED_MEAT]: 1 } }),
      ),
    ).toBe(false);
  });
});

describe('WHITE_MEAT_RESTRICT', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'WHITE_MEAT_RESTRICT');
  it('fires when FISH > 7 and WHITE_MEAT > 0', () => {
    expect(
      rule!.condition(
        makeContext({
          counts: { ...emptyCounts(), [FoodCategory.FISH]: 8, [FoodCategory.WHITE_MEAT]: 1 },
        }),
      ),
    ).toBe(true);
  });
  it('does not fire when FISH is within limit', () => {
    expect(
      rule!.condition(
        makeContext({
          counts: { ...emptyCounts(), [FoodCategory.FISH]: 7, [FoodCategory.WHITE_MEAT]: 1 },
        }),
      ),
    ).toBe(false);
  });
});

describe('HC_INACTIVITY_ADJUST', () => {
  const rule = NUDGE_RULES.find((r) => r.id === 'HC_INACTIVITY_ADJUST');
  it('fires when weeklyActivityMinutes < 150', () => {
    expect(rule!.condition(makeContext({ weeklyActivityMinutes: 100 }))).toBe(true);
  });
  it('does not fire when weeklyActivityMinutes >= 150', () => {
    expect(rule!.condition(makeContext({ weeklyActivityMinutes: 200 }))).toBe(false);
  });
});

describe('SUSTAINABLE_SUBSTITUTION', () => {
  const rule = () => NUDGE_RULES.find((r) => r.id === 'SUSTAINABLE_SUBSTITUTION');

  it('exists with correct id', () => {
    expect(rule()).toBeDefined();
  });

  it('fires when environmentalScore < 30 and alternatives exist', () => {
    const ctx = makeContext({
      environmentalScore: 20,
      alternatives: ['lentejas', 'garbanzos', 'caballa'],
    });
    expect(rule()!.condition(ctx)).toBe(true);
  });

  it('does NOT fire when environmentalScore >= 30', () => {
    const ctx = makeContext({
      environmentalScore: 45,
      alternatives: ['lentejas'],
    });
    expect(rule()!.condition(ctx)).toBe(false);
  });

  it('does NOT fire when alternatives is null', () => {
    const ctx = makeContext({
      environmentalScore: 20,
      alternatives: null,
    });
    expect(rule()!.condition(ctx)).toBe(false);
  });

  it('does NOT fire when alternatives is empty array', () => {
    const ctx = makeContext({
      environmentalScore: 12,
      alternatives: [],
    });
    expect(rule()!.condition(ctx)).toBe(false);
  });

  it('body includes alternative names when rule fires', () => {
    const ctx = makeContext({
      environmentalScore: 20,
      alternatives: ['lentejas', 'garbanzos', 'sardinas'],
    });
    const bodyFn = rule()!.body;
    expect(typeof bodyFn).toBe('function');
    const body = bodyFn(ctx);
    expect(body).toContain('lentejas');
    expect(body).toContain('garbanzos');
    expect(body).toContain('sardinas');
  });

  it('body handles empty alternatives gracefully', () => {
    const ctx = makeContext({
      environmentalScore: 20,
      alternatives: [],
    });
    const bodyFn = rule()!.body;
    expect(typeof bodyFn).toBe('function');
    const body = bodyFn(ctx);
    expect(body).toBe('nudge.body.sustainableSubstitution|');
  });
});
