import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistConfig } from '@infrastructure/storage';
import { z } from 'zod';
import type { Food } from '@shared/domain';
import {
  countRations,
  validateRations,
  type RationValidationResult,
} from '../../domain/rationValidator';

interface LogState {
  todayLog: Food[];
  todayValidation: RationValidationResult | null;

  addFoodToLog: (food: Food, caloricRestrictionActive: boolean) => void;
  removeFoodFromLog: (index: number, caloricRestrictionActive: boolean) => void;
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

/**
 * Pure function: evaluate log against AESAN ration limits.
 * Decoupled from any store — receives caloricRestrictionActive as parameter.
 */
export function evaluateLog(
  log: Food[],
  caloricRestrictionActive: boolean,
): RationValidationResult {
  const counts = countRations(log);
  return validateRations(counts, caloricRestrictionActive);
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      todayLog: [],
      todayValidation: null,

      addFoodToLog: (food, caloricRestrictionActive) => {
        const { todayLog } = get();
        const log = [...todayLog, food];
        set({ todayLog: log, todayValidation: evaluateLog(log, caloricRestrictionActive) });
      },

      removeFoodFromLog: (index, caloricRestrictionActive) => {
        const { todayLog } = get();
        const log = todayLog.filter((_, i) => i !== index);
        set({ todayLog: log, todayValidation: evaluateLog(log, caloricRestrictionActive) });
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
