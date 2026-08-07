/**
 * Biomarker types per FR-5.1 (Monitoreo de Biomarcadores).
 */

export interface GlucoseReading {
  value: number; // mg/dL
  timestamp: number; // Date.now()
  context: 'fasting' | 'postprandial';
}

export interface WeightReading {
  value: number; // kg
  timestamp: number; // Date.now()
  imc: number; // kg/m² at time of reading
}

export interface BiomarkerTrend {
  /** Average glucose over last 7 days, or null if < 2 readings */
  glucoseAvg7d: number | null;
  /** Latest glucose reading, or null if no readings */
  glucoseLatest: GlucoseReading | null;
  /** Average weight over last 7 days, or null if < 2 readings */
  weightAvg7d: number | null;
  /** Latest weight reading, or null if no readings */
  weightLatest: WeightReading | null;
  /** Slope of weight over last 30 days (kg/day), null if < 2 readings */
  weightTrend: number | null;
  /** Slopes: positive means rising, negative means falling */
}

/**
 * Compute biomarker trends from raw history arrays.
 * Pure function — no side effects, no store access.
 */
export function computeBiomarkerTrend(
  glucoseHistory: GlucoseReading[],
  weightHistory: WeightReading[],
): BiomarkerTrend {
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
      ? Math.round((recentWeight.reduce((s, r) => s + r.value, 0) / recentWeight.length) * 10) / 10
      : null;

  let weightTrend: number | null = null;
  if (thirtyDayWeights.length >= 2) {
    const sorted = [...thirtyDayWeights].sort((a, b) => a.timestamp - b.timestamp);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const daysElapsed = (last.timestamp - first.timestamp) / (24 * 60 * 60 * 1000);
    weightTrend =
      daysElapsed > 0 ? Math.round(((last.value - first.value) / daysElapsed) * 100) / 100 : 0;
  }

  return {
    glucoseAvg7d,
    glucoseLatest: glucoseHistory.at(-1) ?? null,
    weightAvg7d,
    weightLatest: weightHistory.at(-1) ?? null,
    weightTrend,
  };
}
