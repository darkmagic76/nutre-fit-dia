import type { GlucoseReading, WeightReading, BiomarkerTrend } from '@domain/index';

/** BiomarkerRepository — application port for biomarker data access. */
export interface BiomarkerRepository {
  /** Get glucose reading history. */
  getGlucoseHistory(): GlucoseReading[];

  /** Get weight reading history. */
  getWeightHistory(): WeightReading[];

  /** Get computed biomarker trend (7d glucose avg, 30d weight trend, etc.). */
  getTrend(): BiomarkerTrend;

  /** Record a glucose reading. */
  recordGlucose(reading: GlucoseReading): void;

  /** Record a weight reading (returns the created WeightReading). */
  recordWeight(kg: number, cm: number): WeightReading;

  /** Detect if IMC has crossed a clinical threshold since last reading. */
  detectIMCThresholdCrossing(): 'crossed_above' | 'crossed_below' | null;
}
