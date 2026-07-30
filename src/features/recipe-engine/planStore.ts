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

// Zod schema for persisted state (structural integrity only — not business rules)
const PlanStateSchema = z.object({
  weeklyPlan: z
    .object({
      days: z.array(
        z.object({
          day: z.string(),
          meals: z.object({
            breakfast: z.array(z.any()),
            lunch: z.array(z.any()),
            dinner: z.array(z.any()),
            snack: z.array(z.any()),
          }),
          restrictionActive: z.boolean(),
        }),
      ),
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
