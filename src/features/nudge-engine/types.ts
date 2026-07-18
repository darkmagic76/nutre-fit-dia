/** ADR-008: Nudge engine contract — rules and context */

import type { CountByCategory } from '@shared/services/rationValidator'
import type {
  NotificationSeverity,
  NotificationType,
  SystemNotification,
} from '@shared/domain'

export interface NudgeRule {
  id: string
  type: NotificationType
  /** Minimum minutes between repeated triggers of this rule */
  cooldown: number
}

export interface SafetyRule extends NudgeRule {
  severity: NotificationSeverity
  condition: (ctx: NudgeContext) => boolean
  title: string
  body: string
}

export interface NudgeContext {
  /** Whether caloric restriction is active (IMC > 25) */
  restrictionActive: boolean
  /** Total animal protein servings consumed today */
  animalProteinCount: number
  /** Whether the current day's log is valid */
  isTodayValid: boolean
  /** Ration counts per category for today */
  counts: CountByCategory
  /** Whether today's log contains a high-glycemic fruit */
  containsHighGlycemicFruit: boolean
  /** Current hour (0–23) from Date.now() */
  currentHour: number

  // PR2: biomarker + activity context
  /** Latest glucose reading value (mg/dL), null if none */
  latestGlucose: number | null
  /** Timestamp of last glucose reading, null if none */
  lastGlucoseTimestamp: number | null
  /** Timestamp of last weight reading, null if none */
  lastWeightTimestamp: number | null
  /** Total water rations consumed today */
  waterRations: number
}

export interface NudgeEvaluation {
  rule: NudgeRule
  notification: SystemNotification
}
