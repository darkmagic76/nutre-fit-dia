/** BiomarkerRepository — application port for biomarker side effects. */
export interface BiomarkerRepository {
  /** Record a glucose reading (mg/dL, timestamp, fasting/postprandial). */
  recordGlucose(input: {
    value: number;
    timestamp: number;
    context: 'fasting' | 'postprandial';
  }): void;

  /** Record a weight reading (kg, cm). */
  recordWeight(weight: number, height: number): void;

  /** Detect if IMC has crossed a clinical threshold since last reading. */
  detectIMCThresholdCrossing(): 'crossed_above' | 'crossed_below' | null;
}
