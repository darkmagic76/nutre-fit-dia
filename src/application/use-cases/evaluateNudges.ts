import { buildNudgeContext } from '@domain/nudgeContextBuilder';
import { evaluateRules } from '@domain/nudgeEvaluator';
import { CooldownTracker } from '@domain/cooldownTracker';
import { NotificationSeverity } from '@domain/index';
import type { ContextInput } from '@domain/nudgeContext';
import type { SafetyRule } from '@domain/nudgeTypes';
import type { CooldownTracker as CooldownTrackerType } from '@domain/cooldownTracker';
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
export function evaluateNudges(
  input: ContextInput,
  rules: SafetyRule[],
  notifRepo: NotificationRepository,
): void {
  const ctx = buildNudgeContext(input);

  const cooldown: CooldownTrackerType = new CooldownTracker({
    registerCooldown: (id, t) => notifRepo.registerCooldown(id, t),
    getCooldowns: () => notifRepo.getCooldowns(),
    resetCooldown: (id) => notifRepo.resetCooldown(id),
  });

  const pending = notifRepo.getPending();

  // 1. Auto-resolve stale nudges
  for (const nudge of pending) {
    if (nudge.severity === NotificationSeverity.HARD_BLOCK) continue;
    const rule = rules.find((r) => r.id === nudge.ruleSource);
    if (rule && !rule.condition(ctx)) {
      notifRepo.acknowledge(nudge.id);
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
