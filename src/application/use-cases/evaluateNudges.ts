import { buildNudgeContext } from '@domain/nudgeContextBuilder';
import { evaluateRules } from '@domain/nudgeEvaluator';
import { CooldownTracker } from '@domain/cooldownTracker';
import type { ContextInput } from '@domain/nudgeContext';
import type { SafetyRule } from '@domain/nudgeTypes';
import type { CooldownOps } from '@domain/cooldownTracker';
import type { NotificationRepository } from '@application/ports/notificationRepository';

// ─── Use Case ──────────────────────────────────────────────────────────────

/**
 * Evaluate nudge rules and enqueue notifications via port.
 *
 * Pure orchestration — receives context, rules, and notification port.
 * No Zustand, no store imports, no React.
 *
 * @param input  Pre-built ContextInput (caller reads stores or passes test data)
 * @param rules  Safety rules to evaluate against
 * @param notifRepo  NotificationRepository port for side effects
 */
/** Factory for CooldownOps from NotificationRepository — pure, testable. */
export function createCooldownOps(notifRepo: NotificationRepository): CooldownOps {
  return {
    registerCooldown: (id, t) => notifRepo.registerCooldown(id, t),
    getCooldowns: () => notifRepo.getCooldowns(),
    resetCooldown: (id) => notifRepo.resetCooldown(id),
  };
}

export function evaluateNudges(
  input: ContextInput,
  rules: SafetyRule[],
  notifRepo: NotificationRepository,
): void {
  const ctx = buildNudgeContext(input);

  const cooldown = new CooldownTracker(createCooldownOps(notifRepo));

  const pending = notifRepo.getPending();

  // 1. Auto-resolve stale nudges.
  // A nudge clears once its rule condition stops holding, regardless of
  // severity. HARD_BLOCK alerts (e.g. CEREALS_RESTRICTION) are NOT sticky: when
  // the user corrects the excess — e.g. removes a cereal ration back to the
  // allowed limit — the alert must disappear on the next evaluation.
  //
  // Resetting the cooldown on resolution closes the nudge lifecycle: the next
  // time the condition holds again it is a NEW event, not spam, so it must be
  // allowed to re-fire instead of being blocked by the previous cooldown window.
  for (const nudge of pending) {
    const rule = rules.find((r) => r.id === nudge.ruleSource);
    if (rule && !rule.condition(ctx)) {
      notifRepo.acknowledge(nudge.id);
      cooldown.reset(rule.id);
    }
  }

  // 2. Evaluate rules against current context
  const results = evaluateRules(ctx, rules, cooldown);

  // 3. Enqueue new notifications
  for (const result of results) {
    notifRepo.enqueue(result.notification);
    cooldown.register(result.rule.id);
  }
}
