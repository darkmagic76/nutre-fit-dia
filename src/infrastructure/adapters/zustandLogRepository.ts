import type { LogRepository } from '@application/ports/logRepository';
import { useLogStore } from '@infrastructure/stores/logStore';

/**
 * Zustand-backed adapter for LogRepository.
 *
 * Thin wrapper — delegates every call to `useLogStore.getState()`.
 */
export function createZustandLogRepository(): LogRepository {
  return {
    getTodayLog: () => useLogStore.getState().todayLog,
    addFood: (food) => useLogStore.getState().addFoodToLog(food),
    removeFood: (index) => useLogStore.getState().removeFoodFromLog(index),
    clearLog: () => useLogStore.setState({ todayLog: [], todayValidation: null }),
  };
}
