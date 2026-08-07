import { countRations } from './rationValidator';
import { FoodCategory, ANIMAL_PROTEIN_CATEGORIES } from './index';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from './glycemicFruits';
import { computeEnvironmentalScore, suggestAlternative } from './sustainability';
import type { ContextInput } from './nudgeContext';
import type { NudgeContext } from './nudgeContext';

/**
 * Build the current nudge context from pure input data.
 *
 * PURE function — no side effects, no store access, no framework imports.
 * All data comes from ContextInput, provided by the caller.
 * Testable with plain objects — no Zustand mocking required.
 */
export function buildNudgeContext(input: ContextInput): NudgeContext {
  const { caloricRestrictionActive, todayLog, weeklyMinutes, trends, food } = input;
  const counts = countRations(todayLog);

  const containsHighGlycemicFruit = todayLog.some(
    (f) =>
      f.category === FoodCategory.FRUITS && HIGH_GLYCEMIC_FRUIT_NAMES.has(f.name.toLowerCase()),
  );

  const animalProteinCount = ANIMAL_PROTEIN_CATEGORIES.reduce((sum, cat) => sum + counts[cat], 0);

  const waterRations = counts[FoodCategory.WATER];
  const hasBacalao = todayLog.some((f) => f.name.toLowerCase().includes('bacalao'));
  const hasEggs = counts[FoodCategory.EGGS] > 0;

  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay();
  const nowTimestamp = now.getTime();

  // M2: smart substitution — compute from optional scanned food
  let environmentalScore: number | null = null;
  let alternatives: string[] | null = null;

  if (food) {
    const envResult = computeEnvironmentalScore(food);
    const altResults = suggestAlternative(food, input.catalog ?? []);
    environmentalScore = envResult.score;
    alternatives = altResults.length > 0 ? altResults.map((f) => f.name) : null;
  }

  return {
    caloricRestrictionActive,
    animalProteinCount,
    counts,
    containsHighGlycemicFruit,
    currentHour,
    latestGlucose: trends.glucoseLatest?.value ?? null,
    lastGlucoseTimestamp: trends.glucoseLatest?.timestamp ?? null,
    lastWeightTimestamp: trends.weightLatest?.timestamp ?? null,
    waterRations,
    hasBacalao,
    hasEggs,
    weeklyActivityMinutes: weeklyMinutes,
    dayOfWeek,
    environmentalScore,
    alternatives,
    now: nowTimestamp,
  };
}
