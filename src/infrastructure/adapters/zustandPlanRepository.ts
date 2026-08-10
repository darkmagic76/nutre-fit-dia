import type { PlanRepository } from '@application/ports/planRepository';
import type { StateExporter } from '@application/ports/stateExporter';
import { usePlanStore } from '@infrastructure/stores/planStore';

/**
 * Zustand-backed adapter for PlanRepository + StateExporter.
 *
 * Thin wrapper — delegates every call to `usePlanStore.getState()`.
 */
export function createZustandPlanRepository(): PlanRepository & StateExporter {
  return {
    getPlan: () => usePlanStore.getState().weeklyPlan,
    generatePlan: () => usePlanStore.getState().generatePlan(),
    getState: () => usePlanStore.getState() as unknown as Record<string, unknown>,
  };
}
