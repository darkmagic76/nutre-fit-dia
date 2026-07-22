/** ADR-008: Nudge taxonomy — canonical notification model */

import { defineEnum } from '@shared/utils';
import type { ValuesOf } from '@shared/utils';

export const NotificationType = defineEnum({
  SAFETY_ALERT: 'safety_alert',
  SYSTEM_ACTION: 'system_action',
  BEHAVIORAL_NUDGE: 'behavioral_nudge',
});

export type NotificationType = ValuesOf<typeof NotificationType>;

export const NotificationSeverity = defineEnum({
  HARD_BLOCK: 'hard_block',
  SOFT_WARN: 'soft_warn',
  INFO: 'info',
});

export type NotificationSeverity = ValuesOf<typeof NotificationSeverity>;

export interface SystemNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  target: 'user' | 'dietitian' | 'system';
  title: string;
  body: string;
  ruleSource: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  dismissedAt?: Date;
}
