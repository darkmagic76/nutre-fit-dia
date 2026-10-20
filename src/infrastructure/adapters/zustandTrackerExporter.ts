import type { StoreApi } from 'zustand';
import type { StateExporter } from '@application/ports/stateExporter';
import { useTrackerStore, type TrackerState } from '@infrastructure/stores/trackerStore';

/**
 * Zustand-backed StateExporter for the tracker store.
 *
 * Used by exportData to snapshot tracker state without exposing the store
 * directly to application layer. Defaults to the global persisted store;
 * `createContainer()` injects an ephemeral one.
 */
export function createZustandTrackerExporter(
  store: StoreApi<TrackerState> = useTrackerStore,
): StateExporter {
  return {
    getState: () => store.getState() as unknown as Record<string, unknown>,
  };
}
