import type { ActivityRepository } from '@application/ports/activityRepository';
import { useActivityStore } from '@infrastructure/stores/activityStore';

/**
 * Zustand-backed adapter for ActivityRepository.
 *
 * Thin wrapper — delegates every call to `useActivityStore.getState()`.
 */
export function createZustandActivityRepository(): ActivityRepository {
  return {
    getWeeklyMinutes: () => useActivityStore.getState().weeklyMinutes,
    getStrengthSessions: () => useActivityStore.getState().strengthSessions,
    getEntries: () => useActivityStore.getState().entries,
    addEntry: (entry) => useActivityStore.getState().addEntry(entry),
    getStreak: () => useActivityStore.getState().streak,
  };
}
