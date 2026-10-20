import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import { useTrackerStore, type TrackerState } from './trackerStore';
import { FoodSchema } from '@domain/food';
import { RationValidationResultSchema } from '@domain/rationValidator';
import type { WeeklyPlan } from '@domain/plan';
import { generateWeeklyPlan } from '@application/services/planGenerator';

export interface PlanState {
  weeklyPlan: WeeklyPlan | null;

  generatePlan: () => void;
  clearPlan: () => void;
}

/**
 * Minimal read-only tracker contract. The plan generator only needs the
 * restriction flag; injecting it (instead of importing the global store)
 * lets each container own a tracker/plan pair that stays in sync.
 */
type TrackerStoreApi = { getState: () => Pick<TrackerState, 'caloricRestrictionActive'> };

// Zod schema for persisted state (structural integrity — matches WeeklyPlan shape).
// Reuses domain schemas (FoodSchema, RationValidationResultSchema) as the single
// source of truth for nested domain values (ADR-014 slice 2 — replaces z.any()).
const MealEntrySchema = z.object({
  food: FoodSchema,
  rations: z.number(),
  mealType: z.string().optional(),
});

export const PlanStateSchema = z.object({
  weeklyPlan: z
    .object({
      days: z.array(
        z.object({
          day: z.number(),
          entries: z.array(MealEntrySchema),
        }),
      ),
      dailyResults: z.array(RationValidationResultSchema),
      weeklyResult: RationValidationResultSchema,
      valid: z.boolean(),
    })
    .nullable(),
});

/**
 * State creator factory — the tracker is a parameter, not a module import,
 * so the persisted singleton and an ephemeral store each read their own.
 */
const createPlanState =
  (tracker: TrackerStoreApi): StateCreator<PlanState> =>
  (set) => ({
    weeklyPlan: null,

    generatePlan: () => {
      const { caloricRestrictionActive } = tracker.getState();
      set({ weeklyPlan: generateWeeklyPlan(caloricRestrictionActive) });
    },

    clearPlan: () => {
      set({ weeklyPlan: null });
    },
  });

export const usePlanStore = create<PlanState>()(
  persist(createPlanState(useTrackerStore), {
    ...createPersistConfig('plan'),
    onRehydrateStorage: () => (state, error) => {
      if (error) return;
      if (state) {
        const parsed = PlanStateSchema.safeParse(state);
        if (!parsed.success) {
          usePlanStore.setState({ weeklyPlan: null });
        }
      }
    },
  }),
);

/**
 * Ephemeral plan store — a fresh, non-persisted instance per call, wired to
 * the caller's tracker. `createContainer()` passes the store set's tracker so
 * two containers never share state and never hydrate the same localStorage key.
 */
export function createPlanStore(tracker: TrackerStoreApi) {
  return create<PlanState>()(createPlanState(tracker));
}
