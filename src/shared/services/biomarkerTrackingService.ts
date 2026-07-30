import { useBiomarkerStore } from '@shared/stores/biomarkerStore';
import type { GlucoseReading, WeightReading, BiomarkerTrend } from './biomarkerTypes';

/**
 * Record a glucose reading. FR-5.1: "Interfaz obligatoria de seguimiento para Glucosa."
 */
export function recordGlucose(glucose: GlucoseReading): void {
  useBiomarkerStore.getState().recordGlucose(glucose);
}

/**
 * Record a weight reading. IMC is computed from weight and height at recording time.
 */
export function recordWeight(weightKg: number, heightCm: number): WeightReading {
  return useBiomarkerStore.getState().recordWeight(weightKg, heightCm);
}

/**
 * Compute biomarker trends: 7-day averages and 30-day weight slope.
 * FR-5.1: "visualización de tendencias para el facultativo."
 */
export function getTrend(): BiomarkerTrend {
  return useBiomarkerStore.getState().getTrend();
}

/**
 * Detect if IMC crossed the clinical threshold between the last two weight readings.
 * Returns 'crossed_above' if IMC went from ≤threshold to >threshold.
 * Returns 'crossed_below' if IMC went from >threshold to ≤threshold.
 * Returns null if insufficient data or no crossing.
 */
export function detectIMCThresholdCrossing(): 'crossed_above' | 'crossed_below' | null {
  return useBiomarkerStore.getState().detectIMCThresholdCrossing();
}

/** Reset history (for testing) */
export function resetBiomarkerHistory(): void {
  useBiomarkerStore.getState().resetBiomarkerHistory();
}
