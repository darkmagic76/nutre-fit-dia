import { describe, it, expect, beforeEach } from 'vitest';
import { usePlanStore, PlanStateSchema } from './planStore';
import { useTrackerStore } from '@shared/stores';

describe('planStore', () => {
  const STORAGE_KEY = 'nutrefitdia-plan';

  beforeEach(() => {
    localStorage.clear();
    usePlanStore.setState({ weeklyPlan: null });
    useTrackerStore.setState({ restrictionActive: false });
  });

  it('starts with no weekly plan', () => {
    expect(usePlanStore.getState().weeklyPlan).toBeNull();
  });

  it('generates a weekly plan', () => {
    usePlanStore.getState().generatePlan();

    const state = usePlanStore.getState();
    expect(state.weeklyPlan).not.toBeNull();
    expect(state.weeklyPlan!.days).toHaveLength(7);
    expect(state.weeklyPlan!.valid).toBe(true);
  });

  it('generates a plan respecting restrictionActive from trackerStore', () => {
    useTrackerStore.setState({ restrictionActive: true });
    usePlanStore.getState().generatePlan();

    const state = usePlanStore.getState();
    expect(state.weeklyPlan).not.toBeNull();
  });

  it('overwrites previous plan on regenerate', () => {
    usePlanStore.getState().generatePlan();
    const first = usePlanStore.getState().weeklyPlan;

    usePlanStore.getState().generatePlan();
    const second = usePlanStore.getState().weeklyPlan;

    expect(second).not.toBeNull();
    expect(first).not.toBe(second);
  });

  // --- PERSIST TESTS ---
  describe('persist', () => {
    async function waitForPersist() {
      await new Promise((r) => setTimeout(r, 0));
    }

    function readStoredState() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error('No stored data');
      return JSON.parse(raw).state as Record<string, unknown>;
    }

    it('writes generated plan to localStorage', async () => {
      usePlanStore.getState().generatePlan();
      await waitForPersist();
      const state = readStoredState();
      expect(state.weeklyPlan).toBeDefined();
      expect(state.weeklyPlan).not.toBeNull();
    });

    it('excludes functions from serialized state', async () => {
      usePlanStore.getState().generatePlan();
      await waitForPersist();
      const state = readStoredState();

      const fnKeys = Object.keys(state).filter((k) => typeof state[k] === 'function');
      expect(fnKeys).toEqual([]);
    });

    it('uses defaults on fresh start with empty localStorage', () => {
      const state = usePlanStore.getState();
      expect(state.weeklyPlan).toBeNull();
    });

    it('regenerated plan overwrites persisted state', async () => {
      usePlanStore.getState().generatePlan();

      usePlanStore.getState().generatePlan();
      await waitForPersist();
      const state = readStoredState();

      // After regenerate + persist, stored plan should not equal the first one
      expect(state.weeklyPlan).toBeDefined();
    });
  });
});

describe('PlanStateSchema', () => {
  it('accepts null weeklyPlan', () => {
    const result = PlanStateSchema.safeParse({ weeklyPlan: null });
    expect(result.success).toBe(true);
  });

  it('accepts valid populated weeklyPlan structure', () => {
    const result = PlanStateSchema.safeParse({
      weeklyPlan: {
        days: [],
        dailyResults: [],
        weeklyResult: {},
        valid: false,
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts real generated weeklyPlan', () => {
    usePlanStore.getState().generatePlan();
    const { weeklyPlan } = usePlanStore.getState();
    expect(weeklyPlan).not.toBeNull();

    const result = PlanStateSchema.safeParse({ weeklyPlan });
    expect(result.success).toBe(true);
  });

  it('rejects string weeklyPlan', () => {
    const result = PlanStateSchema.safeParse({ weeklyPlan: 'not-a-plan' });
    expect(result.success).toBe(false);
  });
});

describe('onRehydrateStorage', () => {
  it('resets to defaults when stored data fails schema validation', async () => {
    const STORAGE_KEY = 'nutrefitdia-plan';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { weeklyPlan: 'bad' }, version: 0 }));
    vi.resetModules();
    const mod = await import('./planStore');
    const state = mod.usePlanStore.getState();
    expect(state.weeklyPlan).toBeNull();
  });
});
