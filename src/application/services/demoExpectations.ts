import { TrafficLightColor } from '@domain/trafficLight';

/**
 * Frozen expectations for the guided demo — a canary, not a source of truth.
 *
 * These values are the output of the clinical thresholds, the AESAN catalog
 * and the plan/substitution generators at the time the demo was designed.
 * `computeDemoChecks` compares live output against them, so a legitimate domain
 * change turns a tour step to "Incorrecto" and the demo e2e goes red instead of
 * silently showcasing numbers that no longer match the domain.
 *
 * Update procedure: confirm the new output is clinically correct, then update
 * this object in the same commit together with the evidence (spec/ADR).
 */
export const DEMO_EXPECTED = {
  seeded: 'seeded',
  bmr: 1345,
  tdee: 1614,
  oil: TrafficLightColor.GREEN,
  cola: TrafficLightColor.RED,
  planValid: true,
  planDays: 7,
  alternativesMin: 1,
  alternativesMax: 3,
  dailyViolations: 5,
  weeklyViolations: 3,
} as const;
