import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { computeIMC, IMC_NORMAL_MAX } from '@domain/imc';
import type { GlucoseReading, WeightReading, BiomarkerTrend } from '../../domain/biomarkerTypes';
import { computeBiomarkerTrend } from '../../domain/biomarkerTypes';
import { createPersistConfig } from '@infrastructure/storage';

// Zod schema for persisted state (structural integrity only — not business rules)
const BiomarkerStateSchema = z.object({
  glucoseHistory: z.array(
    z.object({
      value: z.number(),
      timestamp: z.number(),
      context: z.enum(['fasting', 'postprandial']),
    }),
  ),
  weightHistory: z.array(
    z.object({
      value: z.number(),
      timestamp: z.number(),
      imc: z.number(),
    }),
  ),
});

interface BiomarkerState {
  glucoseHistory: GlucoseReading[];
  weightHistory: WeightReading[];

  recordGlucose: (glucose: GlucoseReading) => void;
  recordWeight: (weightKg: number, heightCm: number) => WeightReading;
  getTrend: () => BiomarkerTrend;
  detectIMCThresholdCrossing: () => 'crossed_above' | 'crossed_below' | null;
  resetBiomarkerHistory: () => void;
}

export const useBiomarkerStore = create<BiomarkerState>()(
  persist(
    (set, get) => ({
      glucoseHistory: [],
      weightHistory: [],

      recordGlucose: (glucose) => {
        set({ glucoseHistory: [...get().glucoseHistory, glucose] });
      },

      recordWeight: (weightKg, heightCm) => {
        const imc = computeIMC(weightKg, heightCm);
        const reading: WeightReading = {
          value: weightKg,
          timestamp: Date.now(),
          imc,
        };
        set({ weightHistory: [...get().weightHistory, reading] });
        return reading;
      },

      getTrend: (): BiomarkerTrend => {
        const { glucoseHistory, weightHistory } = get();
        return computeBiomarkerTrend(glucoseHistory, weightHistory);
      },

      detectIMCThresholdCrossing: () => {
        const { weightHistory } = get();
        if (weightHistory.length < 2) return null;

        const prev = weightHistory[weightHistory.length - 2].imc;
        const curr = weightHistory[weightHistory.length - 1].imc;

        if (prev <= IMC_NORMAL_MAX && curr > IMC_NORMAL_MAX) return 'crossed_above';
        if (prev > IMC_NORMAL_MAX && curr <= IMC_NORMAL_MAX) return 'crossed_below';
        return null;
      },

      resetBiomarkerHistory: () => {
        set({ glucoseHistory: [], weightHistory: [] });
      },
    }),
    {
      ...createPersistConfig('biomarker', {
        sensitiveFields: ['glucoseHistory', 'weightHistory'],
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        if (state) {
          const parsed = BiomarkerStateSchema.safeParse(state);
          if (!parsed.success) {
            useBiomarkerStore.setState({ glucoseHistory: [], weightHistory: [] });
          }
        }
      },
    },
  ),
);
