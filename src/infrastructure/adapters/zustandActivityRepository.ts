import type { ActivityRepository } from '@application/ports/activityRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useActivityStore } from '@infrastructure/stores/activityStore';

/**
 * Zustand-backed adapter for ActivityRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to `useActivityStore.getState()`.
 */
export function createZustandActivityRepository(): ActivityRepository & StateExporter {
  return {
    getWeeklyMinutes: () => useActivityStore.getState().weeklyMinutes,
    getStrengthSessions: () => useActivityStore.getState().strengthSessions,
    getEntries: () => useActivityStore.getState().entries,
    addEntry: (entry) => useActivityStore.getState().addEntry(entry),
    getStreak: () => useActivityStore.getState().streak,
    getState: () => useActivityStore.getState() as unknown as Record<string, unknown>,
  };
}
