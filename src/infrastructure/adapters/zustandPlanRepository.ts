import type { PlanRepository } from '@application/ports/planRepository';
import { usePlanStore } from '@infrastructure/stores/planStore';

/**
 * Zustand-backed adapter for PlanRepository.
 *
 * Thin wrapper — delegates every call to `usePlanStore.getState()`.
 */
export function createZustandPlanRepository(): PlanRepository {
  return {
    getPlan: () => usePlanStore.getState().weeklyPlan,
    generatePlan: () => usePlanStore.getState().generatePlan(),
  };
}
