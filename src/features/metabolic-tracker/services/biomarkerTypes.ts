/**
 * Biomarker types per FR-5.1 (Monitoreo de Biomarcadores).
 */

export interface GlucoseReading {
  value: number        // mg/dL
  timestamp: number    // Date.now()
  context: 'fasting' | 'postprandial'
}

export interface WeightReading {
  value: number        // kg
  timestamp: number    // Date.now()
  imc: number          // kg/m² at time of reading
}

export interface BiomarkerTrend {
  /** Average glucose over last 7 days, or null if < 2 readings */
  glucoseAvg7d: number | null
  /** Latest glucose reading, or null if no readings */
  glucoseLatest: GlucoseReading | null
  /** Average weight over last 7 days, or null if < 2 readings */
  weightAvg7d: number | null
  /** Latest weight reading, or null if no readings */
  weightLatest: WeightReading | null
  /** Slope of weight over last 30 days (kg/day), null if < 2 readings */
  weightTrend: number | null
  /** Slopes: positive means rising, negative means falling */
}
