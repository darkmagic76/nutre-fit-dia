import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import { useTrackerStore } from '@shared/stores/trackerStore';
import { generateWeeklyPlan, type WeeklyPlan } from './services/planGenerator';

interface PlanState {
  weeklyPlan: WeeklyPlan | null;

  generatePlan: () => void;
}

// Zod schema for persisted state (structural integrity — matches WeeklyPlan shape)
const MealEntrySchema = z.object({
  food: z.any(), // Food is a complex domain object validated at creation
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
      dailyResults: z.array(z.any()),
      weeklyResult: z.any(),
      valid: z.boolean(),
    })
    .nullable(),
});

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      weeklyPlan: null,

      generatePlan: () => {
        const { restrictionActive } = useTrackerStore.getState();
        set({ weeklyPlan: generateWeeklyPlan(restrictionActive) });
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
