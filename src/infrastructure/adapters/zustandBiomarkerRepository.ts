import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';

/**
 * Zustand-backed adapter for BiomarkerRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to `useBiomarkerStore.getState()`.
 */
export function createZustandBiomarkerRepository(): BiomarkerRepository & StateExporter {
  return {
    getGlucoseHistory: () => useBiomarkerStore.getState().glucoseHistory,
    getWeightHistory: () => useBiomarkerStore.getState().weightHistory,
    getTrend: () => useBiomarkerStore.getState().getTrend(),
    recordGlucose: (reading) => useBiomarkerStore.getState().recordGlucose(reading),
    recordWeight: (kg, cm) => useBiomarkerStore.getState().recordWeight(kg, cm),
    detectIMCThresholdCrossing: () => useBiomarkerStore.getState().detectIMCThresholdCrossing(),
    getState: () => useBiomarkerStore.getState() as unknown as Record<string, unknown>,
  };
}
