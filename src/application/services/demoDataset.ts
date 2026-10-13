import type { ProfileInput } from '@application/dtos/ProfileInput';

/**
 * Production-safe demo dataset — independent from `src/test/fixtures.ts`.
 * Unit fixture changes MUST NOT alter demo output (spec: no fixture leakage).
 */
export const DEMO_METRICS_INPUT: ProfileInput = {
  weight: '70',
  height: '165',
  age: '45',
  diagnosisAge: '30',
  gender: 'female',
  paf: '1.2',
  glucose: '100',
  glucoseContext: 'fasting',
};

/** Food IDs seeded into the daily log (worked hint: AOVE GREEN, cola RED). */
export const DEMO_ENTRY_IDS: readonly string[] = ['oil-aove', 'proc-refresco-cola'];

/** High-carbon trigger food for the substitution step (Ternera, 27 kg CO2e/kg). */
export const DEMO_TRIGGER_FOOD_ID = 'meat-ternera';
