import type { SafetyRule, NudgeEvaluation, NudgeContext } from './nudgeTypes';
import type { SystemNotification } from './index';
import type { CooldownTracker as CooldownTrackerType } from './cooldownTracker';

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
