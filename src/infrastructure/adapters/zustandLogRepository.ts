import type { LogRepository } from '@application/ports/logRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useLogStore } from '@infrastructure/stores/logStore';

/**
 * Zustand-backed adapter for LogRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to `useLogStore.getState()`.
 */
export function createZustandLogRepository(): LogRepository & StateExporter {
  return {
    getTodayLog: () => useLogStore.getState().todayLog,
    addFood: (food, caloricRestrictionActive) =>
      useLogStore.getState().addFoodToLog(food, caloricRestrictionActive),
    removeFood: (index, caloricRestrictionActive) =>
      useLogStore.getState().removeFoodFromLog(index, caloricRestrictionActive),
    clearLog: () => useLogStore.setState({ todayLog: [], todayValidation: null }),
    getState: () => useLogStore.getState() as unknown as Record<string, unknown>,
  };
}
