import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { computeIMC, IMC_NORMAL_MAX } from '@shared/utils';
import type { GlucoseReading, WeightReading, BiomarkerTrend } from '../../domain/biomarkerTypes';
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

      getTrend: () => {
        const { glucoseHistory, weightHistory } = get();
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        const recentGlucose = glucoseHistory.filter((r) => now - r.timestamp <= sevenDays);
        const recentWeight = weightHistory.filter((r) => now - r.timestamp <= sevenDays);
        const thirtyDayWeights = weightHistory.filter((r) => now - r.timestamp <= thirtyDays);

        const glucoseAvg7d =
          recentGlucose.length >= 2
            ? Math.round(recentGlucose.reduce((s, r) => s + r.value, 0) / recentGlucose.length)
            : null;

        const weightAvg7d =
          recentWeight.length >= 2
            ? Math.round(
                (recentWeight.reduce((s, r) => s + r.value, 0) / recentWeight.length) * 10,
              ) / 10
            : null;

        let weightTrend: number | null = null;
        if (thirtyDayWeights.length >= 2) {
          const sorted = [...thirtyDayWeights].sort((a, b) => a.timestamp - b.timestamp);
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          const daysElapsed = (last.timestamp - first.timestamp) / (24 * 60 * 60 * 1000);
          weightTrend =
            daysElapsed > 0
              ? Math.round(((last.value - first.value) / daysElapsed) * 100) / 100
              : 0;
        }

        return {
          glucoseAvg7d,
          glucoseLatest: glucoseHistory.at(-1) ?? null,
          weightAvg7d,
          weightLatest: weightHistory.at(-1) ?? null,
          weightTrend,
        };
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
