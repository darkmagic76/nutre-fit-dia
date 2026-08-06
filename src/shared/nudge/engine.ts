// Backward-compat barrel: delegates to domain + application locations.
// Domain functions
export { buildNudgeContext } from '../../domain/nudgeContextBuilder';
export { evaluateRules } from '../../domain/nudgeEvaluator';

// Types (re-export from domain)
export type { ContextInput } from '../../domain/nudgeContext';
export type { NudgeContext } from '../../domain/nudgeContext';
export type { NudgeRule, SafetyRule, NudgeEvaluation } from '../../domain/nudgeTypes';

// Integration boundary — thin wrapper that reads stores and delegates to the use case
import { useTrackerStore, useLogStore, useActivityStore } from '@shared/stores';
import { useBiomarkerStore } from '@shared/stores';
import { useNudgeStore } from '@shared/stores';
import { NUDGE_RULES } from '../../infrastructure/nudge/rules';
import { evaluateNudges } from '../../application/use-cases/evaluateNudges';
import type { NotificationRepository } from '../../application/ports/notificationRepository';
import type { Food } from '@shared/domain';
import type { ContextInput } from '../../domain/nudgeContext';

/** Build ContextInput by reading current store state. */
function buildContextFromStores(food?: Food): ContextInput {
  const { caloricRestrictionActive } = useTrackerStore.getState();
  const { todayLog } = useLogStore.getState();
  const { weeklyMinutes } = useActivityStore.getState();
  const trends = useBiomarkerStore.getState().getTrend();

  return { caloricRestrictionActive, todayLog, weeklyMinutes, trends, food };
}

/** Thin adapter: nudgeStore → NotificationRepository port. */
function makeNotificationPort(): NotificationRepository {
  return {
    enqueue: (n) => useNudgeStore.getState().enqueue(n),
    acknowledge: (id) => useNudgeStore.getState().acknowledge(id),
    dismiss: (id) => useNudgeStore.getState().dismiss(id),
    getPending: () => useNudgeStore.getState().pending,
    getHistory: () => useNudgeStore.getState().history,
    getCooldowns: () => useNudgeStore.getState().cooldowns,
    registerCooldown: (id, t) => useNudgeStore.getState().registerCooldown(id, t),
    resetCooldown: (id) => useNudgeStore.getState().resetCooldown(id),
  };
}

/**
 * Full pipeline: read stores → build context → delegate to evaluateNudges use case.
 *
 * Backward-compat wrapper. New consumers should use the use case directly via
 * the composition root (Phase 5).
 */
export function evaluateAndEnqueue(food?: Food): void {
  const input = buildContextFromStores(food);
  const notifRepo = makeNotificationPort();
  evaluateNudges(input, NUDGE_RULES, notifRepo);
}
