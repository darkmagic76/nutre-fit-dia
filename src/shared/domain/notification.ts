/** ADR-008: Nudge taxonomy — canonical notification model */

export const NotificationType = {
  SAFETY_ALERT: 'safety_alert',
  SYSTEM_ACTION: 'system_action',
  BEHAVIORAL_NUDGE: 'behavioral_nudge',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationSeverity = {
  HARD_BLOCK: 'hard_block',
  SOFT_WARN: 'soft_warn',
  INFO: 'info',
} as const

export type NotificationSeverity = (typeof NotificationSeverity)[keyof typeof NotificationSeverity]

export interface SystemNotification {
  id: string
  type: NotificationType
  severity: NotificationSeverity
  target: 'user' | 'dietitian' | 'system'
  title: string
  body: string
  ruleSource: string
  triggeredAt: Date
  acknowledgedAt?: Date
  dismissedAt?: Date
}
