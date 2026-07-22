/** ADR-006: Activity Goal Tracker V1 — domain types (shared: used by activity-tracker + nudge-engine) */

export interface ActivityEntry {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Minutes of moderate-intensity activity */
  moderateMinutes: number;
  /** Number of strength training sessions */
  strengthSessions: number;
}

export interface WeeklyGoal {
  /** WHO/OMS: 150–300 min/week of moderate activity */
  moderateMinutesMin: 150;
  moderateMinutesMax: 300;
  /** WHO/OMS: at least 2 days/week of strength training */
  strengthSessionsMin: 2;
}

export const DEFAULT_WEEKLY_GOAL = {
  moderateMinutesMin: 150,
  moderateMinutesMax: 300,
  strengthSessionsMin: 2,
} as const satisfies WeeklyGoal;
