import { describe, it, expect, beforeEach } from 'vitest';
import { buildNudgeContext } from '@domain/nudgeContextBuilder';
import { evaluateRules } from '@domain/nudgeEvaluator';
import { container } from '@infrastructure/compositionRoot';
import { CooldownTracker } from '@domain/cooldownTracker';
import type { CooldownOps } from '@domain/cooldownTracker';
import type { ContextInput } from '@domain/nudgeContext';
import { NUDGE_RULES } from '../../infrastructure/nudge/rules';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { FoodCategory } from '@domain/foodCategory';
import { NotificationType } from '@domain/notification';
import { makeFood } from '@/test/fixtures';

/** Build ContextInput from current store state — integration helper. */
function storeContextInput(overrides: Partial<ContextInput> = {}): ContextInput {
  const { caloricRestrictionActive } = useTrackerStore.getState();
  const { todayLog } = useLogStore.getState();
  const { weeklyMinutes } = useActivityStore.getState();
  const trends = useBiomarkerStore.getState().getTrend();
  return { caloricRestrictionActive, todayLog, weeklyMinutes, trends, ...overrides };
}

/** Store-backed CooldownOps for integration tests. */
function storeCooldownOps(): CooldownOps {
  return {
    registerCooldown: (id, timestamp) => useNudgeStore.getState().registerCooldown(id, timestamp),
    getCooldowns: () => useNudgeStore.getState().cooldowns,
    resetCooldown: (id) => useNudgeStore.getState().resetCooldown(id),
  };
}

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
    localStorage.clear();
    useTrackerStore.setState({ caloricRestrictionActive: false });
    useLogStore.setState({ todayLog: [] });
    useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
    useActivityStore.setState({ weeklyMinutes: 200 });
    useBiomarkerStore.setState({ glucoseHistory: [], weightHistory: [] });
  });

  it('full pipeline: sets store state, builds context, evaluates rules, returns expected matches', () => {
    useTrackerStore.setState({ caloricRestrictionActive: true });
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

    const cooldown = new CooldownTracker(storeCooldownOps(), () => 0);
    const ctx = buildNudgeContext(storeContextInput());

    expect(ctx.caloricRestrictionActive).toBe(true);
    expect(ctx.counts[FoodCategory.CEREALS]).toBe(5);
    expect(ctx.counts[FoodCategory.FRUITS]).toBe(1);
    expect(ctx.counts[FoodCategory.VEGETABLES]).toBe(1);
    expect(ctx.containsHighGlycemicFruit).toBe(true);

    const eveningCtx = { ...ctx, currentHour: 21, dayOfWeek: 4 };
    const results = evaluateRules(eveningCtx, NUDGE_RULES, cooldown);

    expect(results).toHaveLength(10);
    const matchedIds = results.map((r) => r.rule.id);
    expect(matchedIds).toContain('CEREALS_RESTRICTION');
    expect(matchedIds).toContain('FRUITS_GLYCEMIC_ALERT');
    expect(matchedIds).toContain('VEGETABLES_DEFICIT');
  });

  it('cooldown blocks rules already registered', () => {
    useTrackerStore.setState({ caloricRestrictionActive: true });
    useLogStore.setState({
      todayLog: [cerealFood, cerealFood, cerealFood, cerealFood, cerealFood],
    });

    const cooldown = new CooldownTracker(storeCooldownOps(), () => 0);
    const ctx = buildNudgeContext(storeContextInput());
    const daytimeCtx = { ...ctx, currentHour: 12, dayOfWeek: 4 };

    const firstPass = evaluateRules(daytimeCtx, NUDGE_RULES, cooldown);
    expect(firstPass).toHaveLength(8);
    expect(firstPass[0].rule.id).toBe('CEREALS_RESTRICTION');

    cooldown.register('CEREALS_RESTRICTION');

    const secondPass = evaluateRules(daytimeCtx, NUDGE_RULES, cooldown);
    expect(secondPass).toHaveLength(7);
  });

  it('does not match when no rules trigger', () => {
    useTrackerStore.setState({ caloricRestrictionActive: false });
    useLogStore.setState({ todayLog: [vegetableFood, vegetableFood, vegetableFood] });

    const cooldown = new CooldownTracker(storeCooldownOps(), () => 0);
    const ctx = buildNudgeContext(storeContextInput());
    const morningCtx = { ...ctx, currentHour: 12, dayOfWeek: 4 };

    const results = evaluateRules(morningCtx, NUDGE_RULES, cooldown);
    expect(results).toHaveLength(8);
  });

  describe('auto-resolution', () => {
    it('clears WATER_HYDRATION nudge when water rations reach minimum', () => {
      useLogStore.setState({
        todayLog: [
          makeFood({ id: 'w1', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w2', name: 'Agua', category: FoodCategory.WATER }),
        ],
      });

      useNudgeStore.getState().enqueue({
        id: 'water-test',
        type: NotificationType.BEHAVIORAL_NUDGE,
        severity: 'soft_nudge',
        target: 'user',
        title: 'Hydrate',
        body: 'Drink water',
        ruleSource: 'WATER_HYDRATION',
        triggeredAt: new Date(),
      });

      expect(useNudgeStore.getState().pending).toHaveLength(1);

      // Add more water to satisfy hydration rule
      useLogStore.setState({
        todayLog: [
          makeFood({ id: 'w1', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w2', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w3', name: 'Agua', category: FoodCategory.WATER }),
          makeFood({ id: 'w4', name: 'Agua', category: FoodCategory.WATER }),
        ],
      });

      // container.evaluateNudges reads stores via adapter → should auto-resolve WATER_HYDRATION
      const input = storeContextInput();
      container.evaluateNudges(input);

      const waterStillPending = useNudgeStore
        .getState()
        .pending.some((n) => n.ruleSource === 'WATER_HYDRATION');
      expect(waterStillPending).toBe(false);
    });

    it('clears CEREALS_RESTRICTION nudge after removing a food drops the count back to the limit', () => {
      // Reproduces the reported flow: 5 cereals under caloric restriction fires
      // the nudge; removing one food (back to 4) must auto-resolve it.
      useTrackerStore.setState({ caloricRestrictionActive: true });
      useLogStore.setState({
        todayLog: [cerealFood, cerealFood, cerealFood, cerealFood, cerealFood],
      });

      // Fire the nudge for the 5-cereal state.
      container.evaluateNudges(storeContextInput());
      expect(
        useNudgeStore.getState().pending.some((n) => n.ruleSource === 'CEREALS_RESTRICTION'),
      ).toBe(true);

      // Remove one cereal via the real store action → count returns to 4 (within limit).
      useLogStore.getState().removeFoodFromLog(0, true);
      expect(useLogStore.getState().todayLog).toHaveLength(4);

      // Re-evaluate with the CURRENT store state (4 cereals) → must auto-resolve.
      container.evaluateNudges(storeContextInput());
      expect(
        useNudgeStore.getState().pending.some((n) => n.ruleSource === 'CEREALS_RESTRICTION'),
      ).toBe(false);
    });

    it('re-fires CEREALS_RESTRICTION after resolve→exceed again within the cooldown window', () => {
      // Full reported lifecycle: exceed (fires) → drop to limit (resolves +
      // clears cooldown) → exceed again → must re-fire, NOT stay silent because
      // of the 24h cooldown registered on the first firing.
      useTrackerStore.setState({ caloricRestrictionActive: true });

      // 1. Exceed → fires and registers the 24h cooldown.
      useLogStore.setState({
        todayLog: [cerealFood, cerealFood, cerealFood, cerealFood, cerealFood],
      });
      container.evaluateNudges(storeContextInput());
      expect(
        useNudgeStore.getState().pending.some((n) => n.ruleSource === 'CEREALS_RESTRICTION'),
      ).toBe(true);

      // 2. Drop back to the limit → auto-resolves and clears the cooldown.
      useLogStore.setState({
        todayLog: [cerealFood, cerealFood, cerealFood, cerealFood],
      });
      container.evaluateNudges(storeContextInput());
      expect(
        useNudgeStore.getState().pending.some((n) => n.ruleSource === 'CEREALS_RESTRICTION'),
      ).toBe(false);

      // 3. Exceed again → must re-fire despite the original 24h cooldown.
      useLogStore.setState({
        todayLog: [cerealFood, cerealFood, cerealFood, cerealFood, cerealFood],
      });
      container.evaluateNudges(storeContextInput());
      expect(
        useNudgeStore.getState().pending.some((n) => n.ruleSource === 'CEREALS_RESTRICTION'),
      ).toBe(true);
    });
  });
});
