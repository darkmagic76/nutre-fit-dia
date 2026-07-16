/** ADR-006: Activity Goal Tracker V1 — domain types */

export interface ActivityEntry {
  /** ISO date string (YYYY-MM-DD) */
  date: string
  /** Minutes of moderate-intensity activity */
  moderateMinutes: number
  /** Number of strength training sessions */
  strengthSessions: number
}

export interface WeeklyGoal {
  /** WHO/OMS: 150–300 min/week of moderate activity */
  moderateMinutesMin: 150
  moderateMinutesMax: 300
  /** WHO/OMS: at least 2 days/week of strength training */
  strengthSessionsMin: 2
}

export const DEFAULT_WEEKLY_GOAL = {
  moderateMinutesMin: 150,
  moderateMinutesMax: 300,
  strengthSessionsMin: 2,
} as const satisfies WeeklyGoal

export interface ComplianceReport {
  /** ISO week start date */
  weekStart: string
  /** Total moderate minutes accumulated */
  totalModerateMinutes: number
  /** Total strength sessions completed */
  totalStrengthSessions: number
  /** 150 ≤ minutes ≤ 300 */
  meetsModerateTarget: boolean
  /** sessions ≥ 2 */
  meetsStrengthTarget: boolean
  /** Both targets met */
  isCompliant: boolean
}
