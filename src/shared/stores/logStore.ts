import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import type { Food } from '@shared/domain';
import { useTrackerStore } from '@shared/stores/trackerStore';
import {
  countRations,
  validateRations,
  type ValidationResult,
} from '@shared/services/rationValidator';

interface LogState {
  todayLog: Food[];
  todayValidation: ValidationResult | null;

  addFoodToLog: (food: Food) => void;
  removeFoodFromLog: (index: number) => void;
}

// Zod schema for persisted state (structural integrity only — not business rules)
const LogStateSchema = z.object({
  todayLog: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
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

function evaluateLog(log: Food[]) {
  const { restrictionActive } = useTrackerStore.getState();
  const counts = countRations(log);
  return validateRations(counts, restrictionActive);
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      todayLog: [],
      todayValidation: null,

      addFoodToLog: (food) => {
        const { todayLog } = get();
        const log = [...todayLog, food];
        set({ todayLog: log, todayValidation: evaluateLog(log) });
      },

      removeFoodFromLog: (index) => {
        const { todayLog } = get();
        const log = todayLog.filter((_, i) => i !== index);
        set({ todayLog: log, todayValidation: evaluateLog(log) });
      },
    }),
    {
      ...createPersistConfig('log'),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        if (state) {
          const parsed = LogStateSchema.safeParse(state);
          if (!parsed.success) {
            useLogStore.setState({ todayLog: [], todayValidation: null });
          }
        }
      },
    },
  ),
);
