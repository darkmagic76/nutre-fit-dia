import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';

/**
 * Zustand-backed adapter for BiomarkerRepository.
 *
 * Thin wrapper — delegates every call to `useBiomarkerStore.getState()`.
 */
export function createZustandBiomarkerRepository(): BiomarkerRepository {
  return {
    getGlucoseHistory: () => useBiomarkerStore.getState().glucoseHistory,
    getWeightHistory: () => useBiomarkerStore.getState().weightHistory,
    getTrend: () => useBiomarkerStore.getState().getTrend(),
    recordGlucose: (reading) => useBiomarkerStore.getState().recordGlucose(reading),
    recordWeight: (kg, cm) => useBiomarkerStore.getState().recordWeight(kg, cm),
    detectIMCThresholdCrossing: () => useBiomarkerStore.getState().detectIMCThresholdCrossing(),
  };
}
