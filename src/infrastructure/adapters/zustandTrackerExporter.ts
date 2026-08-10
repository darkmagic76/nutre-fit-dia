import type { StateExporter } from '@application/ports/stateExporter';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';

/**
 * Zustand-backed StateExporter for the tracker store.
 *
 * Used by exportData to snapshot tracker state without exposing
 * the store directly to application layer.
 */
export function createZustandTrackerExporter(): StateExporter {
  return {
    getState: () => useTrackerStore.getState() as unknown as Record<string, unknown>,
  };
}
