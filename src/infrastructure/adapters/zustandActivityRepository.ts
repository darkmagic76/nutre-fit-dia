import type { StoreApi } from 'zustand';
import type { ActivityRepository } from '@application/ports/activityRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useActivityStore, type ActivityState } from '@infrastructure/stores/activityStore';

/**
 * Zustand-backed adapter for ActivityRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to the injected store. Defaults to the
 * global persisted store; `createContainer()` injects an ephemeral one.
 */
export function createZustandActivityRepository(
  store: StoreApi<ActivityState> = useActivityStore,
): ActivityRepository & StateExporter {
  return {
    getWeeklyMinutes: () => store.getState().weeklyMinutes,
    getStrengthSessions: () => store.getState().strengthSessions,
    getEntries: () => store.getState().entries,
    addEntry: (entry) => store.getState().addEntry(entry),
    getStreak: () => store.getState().streak,
    clearActivity: () => store.getState().resetWeek(),
    getState: () => store.getState() as unknown as Record<string, unknown>,
  };
}
