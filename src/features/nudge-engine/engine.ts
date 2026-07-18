import { useTrackerStore } from '@features/metabolic-tracker/store'
import { useLogStore } from '@features/med-diet-validator/store'
import { countRations } from '@shared/services/rationValidator'
import { FoodCategory, ANIMAL_PROTEIN_CATEGORIES, type SystemNotification } from '@shared/domain'
import { getTrend } from '@features/metabolic-tracker/services/biomarkerTrackingService'
import { HIGH_GLYCEMIC_FRUITS } from './rules'
import type { NudgeContext, NudgeEvaluation, SafetyRule } from './types'
import type { CooldownTracker } from './cooldownTracker'

/**
 * Build the current nudge context by reading store state.
 *
 * This is the ONE integration boundary that reads Zustand stores.
 * All impurity is concentrated here — evaluateRules stays pure.
 */
export function buildNudgeContext(): NudgeContext {
  const { restrictionActive } = useTrackerStore.getState()
  const { todayLog } = useLogStore.getState()
  const trends = getTrend()

  const counts = countRations(todayLog)

  const containsHighGlycemicFruit = todayLog.some(
    f => f.category === FoodCategory.FRUITS && HIGH_GLYCEMIC_FRUITS.has(f.name),
  )

  const animalProteinCount = ANIMAL_PROTEIN_CATEGORIES.reduce(
    (sum, cat) => sum + counts[cat],
    0,
  )

  const waterRations = counts[FoodCategory.WATER]

  const currentHour = new Date().getHours()

  return {
    restrictionActive,
    animalProteinCount,
    isTodayValid: true,
    counts,
    containsHighGlycemicFruit,
    currentHour,
    latestGlucose: trends.glucoseLatest?.value ?? null,
    lastGlucoseTimestamp: trends.glucoseLatest?.timestamp ?? null,
    lastWeightTimestamp: trends.weightLatest?.timestamp ?? null,
    waterRations,
  }
}

function buildNotification(rule: SafetyRule): SystemNotification {
  return {
    id: `${rule.id}-${Date.now()}`,
    type: rule.type,
    severity: rule.severity,
    target: 'user',
    title: rule.title,
    body: rule.body,
    ruleSource: rule.id,
    triggeredAt: new Date(),
  }
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
  cooldown: CooldownTracker,
): NudgeEvaluation[] {
  return rules
    .filter(rule => rule.condition(ctx) && !cooldown.isOnCooldown(rule.id, rule.cooldown))
    .map(rule => ({
      rule,
      notification: buildNotification(rule),
    }))
}
