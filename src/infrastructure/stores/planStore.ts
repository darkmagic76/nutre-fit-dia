import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import { useTrackerStore } from './trackerStore';
import { FoodSchema } from '@domain/food';
import { RationValidationResultSchema } from '@domain/rationValidator';
import type { WeeklyPlan } from '@domain/plan';
import { generateWeeklyPlan } from '@application/services/planGenerator';

interface PlanState {
  weeklyPlan: WeeklyPlan | null;

  generatePlan: () => void;
}

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

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      weeklyPlan: null,

      generatePlan: () => {
        const { caloricRestrictionActive } = useTrackerStore.getState();
        set({ weeklyPlan: generateWeeklyPlan(caloricRestrictionActive) });
      },
    }),
    {
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
    },
  ),
);
