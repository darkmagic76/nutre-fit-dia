import type { LogRepository } from '@application/ports/logRepository';
import { useLogStore } from '@infrastructure/stores/logStore';

/**
 * Zustand-backed adapter for LogRepository.
 *
 * Thin wrapper — delegates every call to `useLogStore.getState()`.
 * Reads caloricRestrictionActive from trackerStore to satisfy the logStore API.
 */
export function createZustandLogRepository(): LogRepository {
  return {
    getTodayLog: () => useLogStore.getState().todayLog,
    addFood: (food, caloricRestrictionActive) =>
      useLogStore.getState().addFoodToLog(food, caloricRestrictionActive),
    removeFood: (index, caloricRestrictionActive) =>
      useLogStore.getState().removeFoodFromLog(index, caloricRestrictionActive),
    clearLog: () => useLogStore.setState({ todayLog: [], todayValidation: null }),
  };
}
