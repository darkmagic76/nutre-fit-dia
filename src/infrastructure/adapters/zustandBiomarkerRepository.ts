import type { StoreApi } from 'zustand';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useBiomarkerStore, type BiomarkerState } from '@infrastructure/stores/biomarkerStore';

/**
 * Zustand-backed adapter for BiomarkerRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to the injected store. Defaults to the
 * global persisted store; `createContainer()` injects an ephemeral one.
 */
export function createZustandBiomarkerRepository(
  store: StoreApi<BiomarkerState> = useBiomarkerStore,
): BiomarkerRepository & StateExporter {
  return {
    getGlucoseHistory: () => store.getState().glucoseHistory,
    getWeightHistory: () => store.getState().weightHistory,
    getTrend: () => store.getState().getTrend(),
    recordGlucose: (reading) => store.getState().recordGlucose(reading),
    recordWeight: (kg, cm) => store.getState().recordWeight(kg, cm),
    detectIMCThresholdCrossing: () => store.getState().detectIMCThresholdCrossing(),
    clearBiomarkers: () => store.getState().resetBiomarkerHistory(),
    getState: () => store.getState() as unknown as Record<string, unknown>,
  };
}
