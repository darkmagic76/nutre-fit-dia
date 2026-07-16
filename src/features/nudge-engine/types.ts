/** ADR-008: Nudge engine contract — rules and context */

import type { NotificationType, SystemNotification } from '@shared/domain'

export interface NudgeRule {
  id: string
  type: NotificationType
  /** Minimum minutes between repeated triggers of this rule */
  cooldown: number
}

export interface NudgeContext {
  /** Whether caloric restriction is active (IMC > 25) */
  restrictionActive: boolean
  /** Total animal protein servings consumed today */
  animalProteinCount: number
  /** Minutes since last hydration nudge */
  minutesSinceHydration: number
  /** Whether the current day's log is valid */
  isTodayValid: boolean
}

export interface NudgeEvaluation {
  rule: NudgeRule
  notification: SystemNotification
}
