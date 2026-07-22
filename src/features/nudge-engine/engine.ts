import { useTrackerStore, useLogStore, useActivityStore } from '@shared/stores';
import { countRations } from '@shared/services/rationValidator';
import {
  FoodCategory,
  ANIMAL_PROTEIN_CATEGORIES,
  NotificationType,
  type Food,
  type SystemNotification,
} from '@shared/domain';
import { computeEnvironmentalScore, suggestAlternative } from '@shared/sustainability';
import { getTrend } from '@shared/services/biomarkerTrackingService';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from '@shared/domain/glycemicFruits';
import { NUDGE_RULES } from './rules';
import { CooldownTracker } from './cooldownTracker';
import { useNudgeStore } from './store';
import type { NudgeContext, NudgeEvaluation, SafetyRule } from './types';
import type { CooldownTracker as CooldownTrackerType } from './cooldownTracker';

/**
 * Build the current nudge context by reading store state.
 *
 * This is the ONE integration boundary that reads Zustand stores.
 * All impurity is concentrated here — evaluateRules stays pure.
 *
 * @param food - Optional scanned food to compute environmental score and alternatives.
 */
export function buildNudgeContext(food?: Food): NudgeContext {
  const { restrictionActive } = useTrackerStore.getState();
  const { todayLog } = useLogStore.getState();
  const { weeklyMinutes } = useActivityStore.getState();
  const trends = getTrend();

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
    const altResults = suggestAlternative(food);
    environmentalScore = envResult.score;
    alternatives = altResults.length > 0 ? altResults.map((f) => f.name) : null;
  }

  return {
    restrictionActive,
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

function buildNotification(rule: SafetyRule, ctx: NudgeContext): SystemNotification {
  return {
    id: `${rule.id}-${Date.now()}`,
    type: rule.type,
    severity: rule.severity,
    target: 'user',
    title: rule.title,
    body: typeof rule.body === 'function' ? rule.body(ctx) : rule.body,
    ruleSource: rule.id,
    triggeredAt: new Date(),
  };
}

/**
 * Evaluate rules against the current context.
 *
 * PURE function — no side effects, no store access, no cooldown registration.
 * Returns NudgeEvaluation[] for matching rules that are not on cooldown.
 * Caller is responsible for registering cooldown after enqueuing.
 */
export function evaluateRules(
  ctx: NudgeContext,
  rules: SafetyRule[],
  cooldown: CooldownTrackerType,
): NudgeEvaluation[] {
  return rules
    .filter((rule) => rule.condition(ctx) && !cooldown.isOnCooldown(rule.id, rule.cooldown))
    .map((rule) => ({
      rule,
      notification: buildNotification(rule, ctx),
    }));
}

/** Singleton cooldown tracker — persists across evaluateAndEnqueue calls */
const cooldownTracker = new CooldownTracker();

/**
 * Full pipeline: resolve stale nudges → build context → evaluate rules → enqueue notifications → register cooldowns.
 *
 * This is the integration point called by UI components (NutritionalTrafficLightContainer, MedDietValidatorContainer)
 * whenever a user action might trigger nudges.
 *
 * Auto-resolution: before enqueuing new nudges, any pending BEHAVIORAL_NUDGE or SYSTEM_ACTION
 * whose rule condition is no longer met by the current context is automatically moved to history.
 * This ensures nudges disappear when the user corrects the underlying condition
 * (e.g., drinking enough water clears the hydration nudge, eating enough vegetables clears the vegetable nudge).
 * SAFETY_ALERTs are excluded — they persist until explicitly acknowledged by the user.
 */
export function evaluateAndEnqueue(food?: Food): void {
  const ctx = buildNudgeContext(food);
  const { enqueue, acknowledge, pending } = useNudgeStore.getState();

  // 1. Auto-resolve stale nudges: any non-safety pending nudge whose rule condition is no longer met
  for (const nudge of pending) {
    if (nudge.type === NotificationType.SAFETY_ALERT) continue;

    const rule = NUDGE_RULES.find((r) => r.id === nudge.ruleSource);
    if (rule && !rule.condition(ctx)) {
      acknowledge(nudge.id);
    }
  }

  // 2. Evaluate rules against current context
  const results = evaluateRules(ctx, NUDGE_RULES, cooldownTracker);

  // 3. Enqueue new notifications
  for (const result of results) {
    enqueue(result.notification);
    cooldownTracker.register(result.rule.id);
  }
}
