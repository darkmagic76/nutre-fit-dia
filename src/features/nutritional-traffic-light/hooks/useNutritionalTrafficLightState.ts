import { useLogStore, useTrackerStore } from '@infrastructure/stores';
import type { Food } from '@domain/food';

/**
 * Feature-local access hook for the nutritional-traffic-light store dependencies.
 *
 * Encapsulates the infrastructure stores so the container depends on this
 * feature-owned hook instead of importing `@infrastructure/stores` directly
 * (ADR-014 slice 1 — Clean Architecture dependency rule + Scope Rule).
 */
export interface NutritionalTrafficLightState {
  addFoodToLog: (food: Food, caloricRestrictionActive: boolean) => void;
  caloricRestrictionActive: boolean;
}

export function useNutritionalTrafficLightState(): NutritionalTrafficLightState {
  const addFoodToLog = useLogStore((s) => s.addFoodToLog);
  const caloricRestrictionActive = useTrackerStore((s) => s.caloricRestrictionActive);

  return { addFoodToLog, caloricRestrictionActive };
}
