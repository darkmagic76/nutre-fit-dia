import { useTrackerStore, useLogStore, useActivityStore } from '@shared/stores';
import { countRations } from '@shared/services/rationValidator';
import {
  FoodCategory,
  ANIMAL_PROTEIN_CATEGORIES,
  NotificationSeverity,
  type Food,
  type SystemNotification,
} from '@shared/domain';
import { computeEnvironmentalScore, suggestAlternative } from '@shared/sustainability';
import { useBiomarkerStore } from '@shared/stores';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from '@shared/domain/glycemicFruits';
import { NUDGE_RULES } from './rules';
import { CooldownTracker } from './cooldownTracker';
import { useNudgeStore } from '@shared/stores';
import type { ContextInput, NudgeContext, NudgeEvaluation, SafetyRule } from './types';
import type { CooldownTracker as CooldownTrackerType } from './cooldownTracker';

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
    const altResults = suggestAlternative(food);
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

/**
 * Build ContextInput by reading current store state.
 *
 * This is the ONE integration boundary that reads Zustand stores.
 * All impurity is concentrated here — domain functions stay pure.
 */
function buildContextFromStores(food?: Food): ContextInput {
  const { caloricRestrictionActive } = useTrackerStore.getState();
  const { todayLog } = useLogStore.getState();
  const { weeklyMinutes } = useActivityStore.getState();
  const trends = useBiomarkerStore.getState().getTrend();

  return { caloricRestrictionActive, todayLog, weeklyMinutes, trends, food };
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

/**
 * Full pipeline: read stores → build context → evaluate rules → enqueue → register cooldowns.
 *
 * This is the integration point called by UI components whenever a user action might trigger nudges.
 * It reads store state to build the context, then delegates to pure domain functions.
 * nudgeStore is the nudge system's own state — this function orchestrates it.
 *
 * For pure contexts (testing, callers with pre-built state), use buildNudgeContext() + evaluateRules() directly.
 */
export function evaluateAndEnqueue(food?: Food): void {
  const input = buildContextFromStores(food);
  const ctx = buildNudgeContext(input);
  const { enqueue, acknowledge, pending } = useNudgeStore.getState();
  const cooldown = new CooldownTracker({
    registerCooldown: (id, t) => useNudgeStore.getState().registerCooldown(id, t),
    getCooldowns: () => useNudgeStore.getState().cooldowns,
    resetCooldown: (id) => useNudgeStore.getState().resetCooldown(id),
  });

  // 1. Auto-resolve stale nudges: pending whose rule condition is no longer met.
  //    Only HARD_BLOCK severity is excluded — they require explicit user acknowledgement.
  //    SOFT_WARN and INFO auto-resolve when the triggering condition disappears
  //    (e.g., removing a high-glycemic fruit from the daily log clears the alert).
  for (const nudge of pending) {
    if (nudge.severity === NotificationSeverity.HARD_BLOCK) continue;

    const rule = NUDGE_RULES.find((r) => r.id === nudge.ruleSource);
    if (rule && !rule.condition(ctx)) {
      acknowledge(nudge.id);
    }
  }

  // 2. Evaluate rules against current context
  const results = evaluateRules(ctx, NUDGE_RULES, cooldown);

  // 3. Enqueue new notifications
  for (const result of results) {
    enqueue(result.notification);
    cooldown.register(result.rule.id);
  }
}
