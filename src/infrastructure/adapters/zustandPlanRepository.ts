import type { StoreApi } from 'zustand';
import type { PlanRepository } from '@application/ports/planRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { usePlanStore, type PlanState } from '@infrastructure/stores/planStore';

/**
 * Zustand-backed adapter for PlanRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to the injected store. Defaults to the
 * global persisted store; `createContainer()` injects an ephemeral one.
 */
export function createZustandPlanRepository(
  store: StoreApi<PlanState> = usePlanStore,
): PlanRepository & StateExporter {
  return {
    getPlan: () => store.getState().weeklyPlan,
    generatePlan: () => store.getState().generatePlan(),
    clearPlan: () => store.getState().clearPlan(),
    getState: () => store.getState() as unknown as Record<string, unknown>,
  };
}
