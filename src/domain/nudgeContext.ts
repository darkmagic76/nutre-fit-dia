/** ADR-008: Nudge engine DTOs — ContextInput and NudgeContext */

import type { CountByCategory } from './rationValidator';
import type { Food } from './index';
import type { BiomarkerTrend } from './biomarkerTypes';

/** Pure data input for buildNudgeContext — no framework dependencies. */
export interface ContextInput {
  caloricRestrictionActive: boolean;
  todayLog: Food[];
  weeklyMinutes: number;
  trends: BiomarkerTrend;
  food?: Food;
  /** Food catalog for sustainability substitution lookups. Injected by caller. */
  catalog?: Food[];
}

export interface NudgeContext {
  /** Whether caloric restriction is active (IMC > 25) */
  caloricRestrictionActive: boolean;
  /** Total animal protein servings consumed today */
  animalProteinCount: number;
  /** Ration counts per category for today */
  counts: CountByCategory;
  /** Whether today's log contains a high-glycemic fruit */
  containsHighGlycemicFruit: boolean;
  /** Current hour (0–23) from Date.now() */
  currentHour: number;

  // PR2: biomarker + activity context
  /** Latest glucose reading value (mg/dL), null if none */
  latestGlucose: number | null;
  /** Timestamp of last glucose reading, null if none */
  lastGlucoseTimestamp: number | null;
  /** Timestamp of last weight reading, null if none */
  lastWeightTimestamp: number | null;
  /** Total water rations consumed today */
  waterRations: number;

  // PR3: SystemAction context
  /** Whether today's log contains bacalao */
  hasBacalao: boolean;
  /** Whether today's log contains eggs */
  hasEggs: boolean;
  /** Total weekly activity minutes from activityStore */
  weeklyActivityMinutes: number;
  /** Day of week (0=Sun, 6=Sat) */
  dayOfWeek: number;

  // C4 fix: inject current timestamp for deterministic testing
  /** Current timestamp (ms since epoch), injected for test determinism */
  now: number;

  // M2: smart substitution
  /** Environmental sustainability score (0–100), null when food not provided */
  environmentalScore: number | null;
  /** Sustainable alternatives names, null when food not provided */
  alternatives: string[] | null;
}
