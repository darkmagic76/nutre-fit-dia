import { useLogStore, useTrackerStore } from '@infrastructure/stores';
import type { Food } from '@domain/food';
import type { RationValidationResult } from '@domain/rationValidator';
import type { CaloricTargetOutput } from '@domain/caloricTargetService';

/**
 * Feature-local access hook for the med-diet-validator store dependencies.
 *
 * Encapsulates the infrastructure stores so the container depends on this
 * feature-owned hook instead of importing `@infrastructure/stores` directly
 * (ADR-014 slice 1 — Clean Architecture dependency rule + Scope Rule).
 */
export interface MedDietValidatorState {
  todayLog: Food[];
  todayValidation: RationValidationResult | null;
  removeFoodFromLog: (index: number, caloricRestrictionActive: boolean) => void;
  caloricTarget: CaloricTargetOutput | null;
  caloricRestrictionActive: boolean;
}

export function useMedDietValidatorState(): MedDietValidatorState {
  const todayLog = useLogStore((s) => s.todayLog);
  const todayValidation = useLogStore((s) => s.todayValidation);
  const removeFoodFromLog = useLogStore((s) => s.removeFoodFromLog);
  const caloricTarget = useTrackerStore((s) => s.caloricTarget);
  const caloricRestrictionActive = useTrackerStore((s) => s.caloricRestrictionActive);

  return {
    todayLog,
    todayValidation,
    removeFoodFromLog,
    caloricTarget,
    caloricRestrictionActive,
  };
}
