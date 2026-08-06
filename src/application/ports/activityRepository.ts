import type { ActivityEntry } from '@domain/activity';

/** ActivityRepository — application port for activity tracking data. */
export interface ActivityRepository {
  /** Total moderate-intensity minutes this week. */
  getWeeklyMinutes(): number;

  /** Number of strength training sessions this week. */
  getStrengthSessions(): number;

  /** All activity entries for the current week. */
  getEntries(): ActivityEntry[];

  /** Add an activity entry (accumulates weekly minutes and sessions). */
  addEntry(entry: ActivityEntry): void;

  /** Get current streak (consecutive weeks of 100% compliance). */
  getStreak(): number;
}
