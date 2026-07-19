import { computeIMC, IMC_NORMAL_MAX } from '@shared/utils'
import type { GlucoseReading, WeightReading, BiomarkerTrend } from './biomarkerTypes'

const glucoseHistory: GlucoseReading[] = []
const weightHistory: WeightReading[] = []

/**
 * Record a glucose reading. FR-5.1: "Interfaz obligatoria de seguimiento para Glucosa."
 */
export function recordGlucose(glucose: GlucoseReading): void {
  glucoseHistory.push(glucose)
}

/**
 * Record a weight reading. IMC is computed from weight and height at recording time.
 */
export function recordWeight(weightKg: number, heightCm: number): WeightReading {
  const imc = computeIMC(weightKg, heightCm)
  const reading: WeightReading = {
    value: weightKg,
    timestamp: Date.now(),
    imc,
  }
  weightHistory.push(reading)
  return reading
}

/**
 * Compute biomarker trends: 7-day averages and 30-day weight slope.
 * FR-5.1: "visualización de tendencias para el facultativo."
 */
export function getTrend(): BiomarkerTrend {
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  const recentGlucose = glucoseHistory.filter(r => now - r.timestamp <= sevenDays)
  const recentWeight = weightHistory.filter(r => now - r.timestamp <= sevenDays)
  const thirtyDayWeights = weightHistory.filter(r => now - r.timestamp <= thirtyDays)

  const glucoseAvg7d = recentGlucose.length >= 2
    ? Math.round(recentGlucose.reduce((s, r) => s + r.value, 0) / recentGlucose.length)
    : null

  const weightAvg7d = recentWeight.length >= 2
    ? Math.round(recentWeight.reduce((s, r) => s + r.value, 0) / recentWeight.length * 10) / 10
    : null

  let weightTrend: number | null = null
  if (thirtyDayWeights.length >= 2) {
    const sorted = [...thirtyDayWeights].sort((a, b) => a.timestamp - b.timestamp)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const daysElapsed = (last.timestamp - first.timestamp) / (24 * 60 * 60 * 1000)
    weightTrend = daysElapsed > 0
      ? Math.round(((last.value - first.value) / daysElapsed) * 100) / 100
      : 0
  }

  return {
    glucoseAvg7d,
    glucoseLatest: glucoseHistory.at(-1) ?? null,
    weightAvg7d,
    weightLatest: weightHistory.at(-1) ?? null,
    weightTrend,
  }
}

/**
 * Detect if IMC crossed the clinical threshold between the last two weight readings.
 * Returns 'crossed_above' if IMC went from ≤threshold to >threshold.
 * Returns 'crossed_below' if IMC went from >threshold to ≤threshold.
 * Returns null if insufficient data or no crossing.
 */
export function detectIMCThresholdCrossing(): 'crossed_above' | 'crossed_below' | null {
  if (weightHistory.length < 2) return null

  const prev = weightHistory[weightHistory.length - 2].imc
  const curr = weightHistory[weightHistory.length - 1].imc

  if (prev <= IMC_NORMAL_MAX && curr > IMC_NORMAL_MAX) return 'crossed_above'
  if (prev > IMC_NORMAL_MAX && curr <= IMC_NORMAL_MAX) return 'crossed_below'
  return null
}

/** Reset history (for testing) */
export function resetBiomarkerHistory(): void {
  glucoseHistory.length = 0
  weightHistory.length = 0
}
