import { describe, it, expect, beforeEach } from 'vitest';
import { useLogStore, useTrackerStore } from '@shared/stores';
import { FoodCategory } from '@shared/domain';
import { makeFood } from '@/test/fixtures';
import { z } from 'zod';

const mockFood = makeFood({
  id: 'test-food-1',
  name: 'Pan integral',
  category: FoodCategory.CEREALS,
  gramsPerRation: 40,
  kcalPer100g: 250,
  proteinPer100g: 8,
  carbsPer100g: 45,
  fiberPer100g: 6,
  fatPer100g: 2,
  saturatedFatPer100g: 0.3,
  carbonFootprint: 0.5,
});

// --- Zod schema for persisted state (structural integrity only) ---
export const LogStateSchema = z.object({
  todayLog: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.nativeEnum(FoodCategory),
      gramsPerRation: z.number(),
      kcalPer100g: z.number(),
      proteinPer100g: z.number(),
      carbsPer100g: z.number(),
      fiberPer100g: z.number(),
      fatPer100g: z.number(),
      saturatedFatPer100g: z.number(),
      carbonFootprint: z.number(),
      imageUrl: z.string().optional(),
      isRestricted: z.boolean().optional(),
    }),
  ),
  todayValidation: z.any().nullable(),
});

describe('logStore', () => {
  const STORAGE_KEY = 'nutrefitdia-log';

  beforeEach(() => {
    localStorage.clear();
    useLogStore.setState({ todayLog: [], todayValidation: null });
    useTrackerStore.setState({ restrictionActive: false });
  });

  it('starts with empty log', () => {
    const state = useLogStore.getState();
    expect(state.todayLog).toEqual([]);
    expect(state.todayValidation).toBeNull();
  });

  it('adds food to log and validates', () => {
    const { addFoodToLog } = useLogStore.getState();
    addFoodToLog(mockFood);

    const state = useLogStore.getState();
    expect(state.todayLog).toHaveLength(1);
    expect(state.todayLog[0].name).toBe('Pan integral');
    expect(state.todayValidation).not.toBeNull();
  });

  it('removes food from log by index', () => {
    const { addFoodToLog, removeFoodFromLog } = useLogStore.getState();
    addFoodToLog(mockFood);
    addFoodToLog({ ...mockFood, id: 'test-food-2', name: 'AOVE' });

    removeFoodFromLog(0);

    const state = useLogStore.getState();
    expect(state.todayLog).toHaveLength(1);
    expect(state.todayLog[0].id).toBe('test-food-2');
  });

  it('revalidates after removal', () => {
    const { addFoodToLog, removeFoodFromLog } = useLogStore.getState();
    addFoodToLog(mockFood);
    expect(useLogStore.getState().todayValidation).not.toBeNull();

    removeFoodFromLog(0);
    expect(useLogStore.getState().todayValidation).not.toBeNull();
  });

  it('reads restrictionActive from trackerStore cross-feature', () => {
    useTrackerStore.setState({ restrictionActive: true });

    const { addFoodToLog } = useLogStore.getState();
    addFoodToLog(mockFood);
    addFoodToLog({ ...mockFood, id: 'c2', name: 'Pan 2' });
    addFoodToLog({ ...mockFood, id: 'c3', name: 'Pan 3' });
    addFoodToLog({ ...mockFood, id: 'c4', name: 'Pan 4' });
    addFoodToLog({ ...mockFood, id: 'c5', name: 'Pan 5' });

    const state = useLogStore.getState();
    expect(state.todayLog).toHaveLength(5);
    expect(state.todayValidation).not.toBeNull();
  });

  // --- PERSIST TESTS ---
  describe('persist', () => {
    /** Await async persist flush */
    async function waitForPersist() {
      await new Promise((r) => setTimeout(r, 0));
    }

    function readStoredState() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error('No stored data');
      return JSON.parse(raw).state as Record<string, unknown>;
    }

    it('writes state to localStorage on change', async () => {
      useLogStore.setState({ todayLog: [mockFood] });
      await waitForPersist();
      const state = readStoredState();
      expect(state.todayLog).toBeDefined();
      expect(Array.isArray(state.todayLog)).toBe(true);
    });

    it('excludes functions from serialized state', async () => {
      useLogStore.setState({ todayLog: [mockFood] });
      await waitForPersist();
      const state = readStoredState();

      const fnKeys = Object.keys(state).filter((k) => typeof state[k] === 'function');
      expect(fnKeys).toEqual([]);
    });

    it('uses defaults on fresh start with empty localStorage', () => {
      const state = useLogStore.getState();
      expect(state.todayLog).toEqual([]);
      expect(state.todayValidation).toBeNull();
    });

    it('multiple food entries all persist to localStorage', async () => {
      const foods = [mockFood, { ...mockFood, id: 'f2' }, { ...mockFood, id: 'f3' }];
      useLogStore.setState({ todayLog: foods });
      await waitForPersist();
      const state = readStoredState();
      expect((state.todayLog as unknown[]).length).toBe(3);
    });
  });
});

// Standalone Zod schema validation tests
describe('LogStateSchema', () => {
  it('accepts valid state with populated todayLog', () => {
    const result = LogStateSchema.safeParse({
      todayLog: [mockFood],
      todayValidation: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty todayLog', () => {
    const result = LogStateSchema.safeParse({
      todayLog: [],
      todayValidation: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-array todayLog', () => {
    const result = LogStateSchema.safeParse({
      todayLog: 'not-an-array',
      todayValidation: null,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing todayLog', () => {
    const result = LogStateSchema.safeParse({
      todayValidation: null,
    });
    expect(result.success).toBe(false);
  });
});

describe('onRehydrateStorage', () => {
  it('resets to defaults when stored data fails schema validation', async () => {
    const STORAGE_KEY = 'nutrefitdia-log';
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { todayLog: 'not-an-array' }, version: 0 }),
    );
    vi.resetModules();
    const mod = await import('./logStore');
    const state = mod.useLogStore.getState();
    expect(state.todayLog).toEqual([]);
    expect(state.todayValidation).toBeNull();
  });
});
