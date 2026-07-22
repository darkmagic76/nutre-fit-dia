import { useCallback, useRef, useEffect } from 'react';
import { useActivityStore, DEFAULT_WEEKLY_GOAL } from '../activityStore';
import type { ActivityEntry } from '../types';

let streakCount = 0;

export function useActivityTracker() {
  const { weeklyMinutes, strengthSessions, entries, addEntry: storeAddEntry } = useActivityStore();
  const prevEntryCount = useRef(entries.length);

  const meetsModerate =
    weeklyMinutes >= DEFAULT_WEEKLY_GOAL.moderateMinutesMin &&
    weeklyMinutes <= DEFAULT_WEEKLY_GOAL.moderateMinutesMax;

  const meetsStrength = strengthSessions >= DEFAULT_WEEKLY_GOAL.strengthSessionsMin;

  const compliance: number =
    meetsModerate && meetsStrength ? 100 : meetsModerate || meetsStrength ? 50 : 0;

  // Update streak only when a new entry is added
  useEffect(() => {
    if (entries.length > prevEntryCount.current) {
      if (compliance === 100) {
        streakCount++;
      } else {
        streakCount = 0;
      }
      prevEntryCount.current = entries.length;
    }
  }, [entries.length, compliance]);

  const addEntry = useCallback(
    (entry: Omit<ActivityEntry, 'date'> & { date?: string }) => {
      storeAddEntry({
        date: entry.date ?? new Date().toISOString().slice(0, 10),
        moderateMinutes: entry.moderateMinutes,
        strengthSessions: entry.strengthSessions,
      });
    },
    [storeAddEntry],
  );

  return {
    weeklyMinutes,
    strengthSessions,
    entries,
    compliance,
    streak: streakCount,
    meetsModerate,
    meetsStrength,
    weeklyGoal: DEFAULT_WEEKLY_GOAL,
    addEntry,
  };
}
