import { useTrackerStore } from '@infrastructure/stores';

/**
 * Feature-local access hook for the metabolic-tracker store.
 *
 * Encapsulates the infrastructure store so the container depends on this
 * feature-owned hook instead of importing `@infrastructure/stores` directly
 * (ADR-014 slice 1 — Clean Architecture dependency rule + Scope Rule).
 *
 * Passthrough to the Zustand store: returns the full store state/actions so
 * existing consumers keep the same shape.
 */
export function useMetabolicTrackerState() {
  return useTrackerStore();
}
