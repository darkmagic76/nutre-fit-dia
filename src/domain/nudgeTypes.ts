/** ADR-008: Nudge engine DTOs — rule and evaluation contracts */

import type { NotificationSeverity, NotificationType, SystemNotification } from './index';
import type { NudgeContext } from './nudgeContext';

export type { NudgeContext } from './nudgeContext';

export interface NudgeRule {
  id: string;
  type: NotificationType;
  /** Minimum minutes between repeated triggers of this rule */
  cooldown: number;
}

export interface SafetyRule extends NudgeRule {
  severity: NotificationSeverity;
  condition: (ctx: NudgeContext) => boolean;
  title: string;
  body: string | ((ctx: NudgeContext) => string);
}

export interface NudgeEvaluation {
  rule: NudgeRule;
  notification: SystemNotification;
}
