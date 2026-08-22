import { usePlanStore, useTrackerStore } from '@infrastructure/stores';
import type { WeeklyPlan } from '@domain/plan';
import type { CaloricTargetOutput } from '@domain/caloricTargetService';

/**
 * Feature-local access hook for the recipe-engine store dependencies.
 *
 * Encapsulates the infrastructure stores so the container depends on this
 * feature-owned hook instead of importing `@infrastructure/stores` directly
 * (ADR-014 slice 1 — Clean Architecture dependency rule + Scope Rule).
 */
export interface RecipeEngineState {
  weeklyPlan: WeeklyPlan | null;
  generatePlan: () => void;
  caloricRestrictionActive: boolean;
  setRestrictionActive: (v: boolean) => void;
  caloricTarget: CaloricTargetOutput | null;
}

export function useRecipeEngineState(): RecipeEngineState {
  const weeklyPlan = usePlanStore((s) => s.weeklyPlan);
  const generatePlan = usePlanStore((s) => s.generatePlan);
  const caloricRestrictionActive = useTrackerStore((s) => s.caloricRestrictionActive);
  const setRestrictionActive = useTrackerStore((s) => s.setRestrictionActive);
  const caloricTarget = useTrackerStore((s) => s.caloricTarget);

  return {
    weeklyPlan,
    generatePlan,
    caloricRestrictionActive,
    setRestrictionActive,
    caloricTarget,
  };
}
