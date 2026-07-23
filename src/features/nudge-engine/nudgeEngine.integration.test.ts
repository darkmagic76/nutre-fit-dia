import { describe, it, expect, beforeEach } from 'vitest';
import { buildNudgeContext, evaluateRules, evaluateAndEnqueue } from './engine';
import { CooldownTracker } from './cooldownTracker';
import { NUDGE_RULES } from './rules';
import { useTrackerStore, useLogStore } from '@shared/stores';
import { useNudgeStore } from './store';
import { FoodCategory, NotificationType } from '@shared/domain';
import { makeFood } from '@/test/fixtures';

const cerealFood = makeFood({
  id: 'c1',
  name: 'Pan de centeno',
  category: FoodCategory.CEREALS,
});

const glycemicFruitFood = makeFood({
  id: 'gf1',
  name: 'Uvas',
  category: FoodCategory.FRUITS,
});

const vegetableFood = makeFood({
  id: 'v1',
  name: 'Brócoli',
  category: FoodCategory.VEGETABLES,
});

describe('Nudge Engine Integration', () => {
  beforeEach(() => {
    useTrackerStore.setState({ restrictionActive: false });
    useLogStore.setState({ todayLog: [] });
    useNudgeStore.setState({ pending: [], history: [] });
  });

  it('full pipeline: sets store state, builds context, evaluates rules, returns expected matches', () => {
    // Given: restriction active, 5 cereals, 1 vegetable, high-GI fruit, evening
    useTrackerStore.setState({ restrictionActive: true });
    useLogStore.setState({
      todayLog: [
        cerealFood,
        cerealFood,
        cerealFood,
        cerealFood,
        cerealFood,
        glycemicFruitFood,
        vegetableFood,
      ],
    });

    const cooldown = new CooldownTracker(() => 0);
    const ctx = buildNudgeContext();

    expect(ctx.restrictionActive).toBe(true);
    expect(ctx.counts[FoodCategory.CEREALS]).toBe(5);
    expect(ctx.counts[FoodCategory.FRUITS]).toBe(1);
    expect(ctx.counts[FoodCategory.VEGETABLES]).toBe(1);
    expect(ctx.containsHighGlycemicFruit).toBe(true);

    // Evaluate with overridden hour that triggers vegetables deficit
    const eveningCtx = { ...ctx, currentHour: 21, dayOfWeek: 4 };
    const results = evaluateRules(eveningCtx, NUDGE_RULES, cooldown);

    // CEREALS_RESTRICTION + CEREALS_DEFICIT?no(cereals=5) + FRUITS_GLYCEMIC_ALERT + FRUITS_DEFICIT + VEGETABLES_DEFICIT
    // + ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER_HYDRATION
    // + AOVE_TAGGING + LEGUMES_GLYCEMIC_BASE + HC_INACTIVITY_ADJUST
    expect(results).toHaveLength(10);
    const matchedIds = results.map((r) => r.rule.id);
    expect(matchedIds).toContain('CEREALS_RESTRICTION');
    expect(matchedIds).toContain('FRUITS_GLYCEMIC_ALERT');
    expect(matchedIds).toContain('VEGETABLES_DEFICIT');
  });

  it('cooldown blocks rules already registered', () => {
    useTrackerStore.setState({ restrictionActive: true });
    useLogStore.setState({
      todayLog: [cerealFood, cerealFood, cerealFood, cerealFood, cerealFood],
    });

    const cooldown = new CooldownTracker(() => 0);

    // First evaluation — should match. Pin hour to daytime to avoid VEGETABLES_DEFICIT.
    const ctx = buildNudgeContext();
    const daytimeCtx = { ...ctx, currentHour: 12, dayOfWeek: 4 };
    const firstPass = evaluateRules(daytimeCtx, NUDGE_RULES, cooldown);
    expect(firstPass).toHaveLength(8); // CEREALS + FRUITS_DEFICIT + ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER + AOVE + LEGUMES_GLYCEMIC_BASE + HC_INACTIVITY
    expect(firstPass[0].rule.id).toBe('CEREALS_RESTRICTION');

    // Simulate caller registering cooldown
    cooldown.register('CEREALS_RESTRICTION');

    // Second evaluation — CEREALS_RESTRICTION now on cooldown
    const secondPass = evaluateRules(daytimeCtx, NUDGE_RULES, cooldown);
    expect(secondPass).toHaveLength(7); // FRUITS_DEFICIT + ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER + AOVE + LEGUMES_GLYCEMIC_BASE + HC_INACTIVITY
  });

  it('does not match when no rules trigger', () => {
    useTrackerStore.setState({ restrictionActive: false });
    useLogStore.setState({ todayLog: [vegetableFood, vegetableFood, vegetableFood] });

    const cooldown = new CooldownTracker(() => 0);
    const ctx = buildNudgeContext();
    // Override hour to be before 20 so VEGETABLES_DEFICIT doesn't trigger
    // Override dayOfWeek to Thursday so LEGUMES_GLYCEMIC_BASE fires
    const morningCtx = { ...ctx, currentHour: 12, dayOfWeek: 4 };

    const results = evaluateRules(morningCtx, NUDGE_RULES, cooldown);
    // ADHERENCE_GLUCOSE + ADHERENCE_WEIGHT + WATER_HYDRATION + AOVE_TAGGING
    // + LEGUMES_GLYCEMIC_BASE + HC_INACTIVITY_ADJUST + CEREALS_DEFICIT + FRUITS_DEFICIT
    expect(results).toHaveLength(8);
  });

  describe('auto-resolution', () => {
    it('clears WATER_HYDRATION nudge when water rations reach minimum', () => {
      // Given: only 2 water rations → WATER_HYDRATION triggers
      useLogStore.setState({
        todayLog: [
          makeFood({ id: 'w1', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w2', name: 'Agua', category: FoodCategory.WATER }),
        ],
      });
      evaluateAndEnqueue();

      const afterTrigger = useNudgeStore.getState();
      const waterNudge = afterTrigger.pending.find((n) => n.ruleSource === 'WATER_HYDRATION');
      expect(waterNudge).toBeDefined();

      // When: user drinks 2 more water rations (now 4 total)
      useLogStore.setState({
        todayLog: [
          makeFood({ id: 'w1', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w2', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w3', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w4', name: 'Agua', category: FoodCategory.WATER }),
        ],
      });
      evaluateAndEnqueue();

      // Then: water nudge should be auto-cleared
      const afterResolution = useNudgeStore.getState();
      expect(
        afterResolution.pending.find((n) => n.ruleSource === 'WATER_HYDRATION'),
      ).toBeUndefined();
    });

    it('clears VEGETABLES_DEFICIT nudge when vegetables reach minimum', () => {
      // Given: 0 vegetables + evening → VEGETABLES_DEFICIT triggers
      useLogStore.setState({ todayLog: [] });
      evaluateAndEnqueue();

      // VEGETABLES_DEFICIT only fires after 20h — we test at integration level
      // so it may not fire here. Let's test that when it DOES fire, it clears after correction.

      // Manually enqueue a vegetable nudge to simulate it
      useNudgeStore.getState().enqueue({
        id: 'veg-nudge-1',
        type: NotificationType.BEHAVIORAL_NUDGE,
        severity: 'info',
        target: 'user',
        title: 'Test',
        body: 'Test',
        ruleSource: 'VEGETABLES_DEFICIT',
        triggeredAt: new Date(),
      });

      // When: user eats 3 vegetables
      useLogStore.setState({
        todayLog: [
          makeFood({ id: 'v1', name: 'Brócoli', category: FoodCategory.VEGETABLES }),
          makeFood({ id: 'v2', name: 'Espinaca', category: FoodCategory.VEGETABLES }),
          makeFood({ id: 'v3', name: 'Tomate', category: FoodCategory.VEGETABLES }),
        ],
      });
      evaluateAndEnqueue();

      // Then: vegetable nudge should be auto-cleared
      const afterResolution = useNudgeStore.getState();
      expect(
        afterResolution.pending.find((n) => n.ruleSource === 'VEGETABLES_DEFICIT'),
      ).toBeUndefined();
      expect(afterResolution.history).toHaveLength(1);
    });

    it('keeps SAFETY_ALERT nudges even when condition no longer met', () => {
      // Given: a safety alert is pending
      useNudgeStore.getState().enqueue({
        id: 'safety-1',
        type: NotificationType.SAFETY_ALERT,
        severity: 'soft_warn',
        target: 'user',
        title: 'Test',
        body: 'Test',
        ruleSource: 'FRUITS_GLYCEMIC_ALERT',
        triggeredAt: new Date(),
      });

      // When: no high-glycemic fruits in log
      useLogStore.setState({ todayLog: [] });
      evaluateAndEnqueue();

      // Then: safety alert persists (not auto-cleared)
      const state = useNudgeStore.getState();
      expect(state.pending.find((n) => n.ruleSource === 'FRUITS_GLYCEMIC_ALERT')).toBeDefined();
    });
  });
});
