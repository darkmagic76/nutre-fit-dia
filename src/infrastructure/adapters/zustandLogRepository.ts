import type { StoreApi } from 'zustand';
import type { LogRepository } from '@application/ports/logRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { useLogStore, type LogState } from '@infrastructure/stores/logStore';

/**
 * Zustand-backed adapter for LogRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to the injected store. Defaults to the
 * global persisted store; `createContainer()` injects an ephemeral one.
 */
export function createZustandLogRepository(
  store: StoreApi<LogState> = useLogStore,
): LogRepository & StateExporter {
  return {
    getTodayLog: () => store.getState().todayLog,
    addFood: (food, caloricRestrictionActive) =>
      store.getState().addFoodToLog(food, caloricRestrictionActive),
    removeFood: (index, caloricRestrictionActive) =>
      store.getState().removeFoodFromLog(index, caloricRestrictionActive),
    clearLog: () => store.setState({ todayLog: [], todayValidation: null }),
    getState: () => store.getState() as unknown as Record<string, unknown>,
  };
}
