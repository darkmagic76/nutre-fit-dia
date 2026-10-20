import type { StoreApi } from 'zustand';
import { createActivityStore, useActivityStore, type ActivityState } from './activityStore';
import { createBiomarkerStore, useBiomarkerStore, type BiomarkerState } from './biomarkerStore';
import { createLogStore, useLogStore, type LogState } from './logStore';
import { createNudgeStore, useNudgeStore, type NudgeState } from './nudgeStore';
import { createPlanStore, usePlanStore, type PlanState } from './planStore';
import { createTrackerStore, useTrackerStore, type TrackerState } from './trackerStore';

/**
 * One coherent set of stores — the unit of isolation for `createContainer()`.
 *
 * Every member is a plain `StoreApi`, so a store set can be either persisted
 * (the global app singletons) or ephemeral (one fresh set per container).
 * `plan` depends on the same `tracker` from its own set, never on the global.
 */
export interface StoreSet {
  tracker: StoreApi<TrackerState>;
  log: StoreApi<LogState>;
  biomarker: StoreApi<BiomarkerState>;
  plan: StoreApi<PlanState>;
  activity: StoreApi<ActivityState>;
  nudge: StoreApi<NudgeState>;
}

/**
 * Builds an isolated, non-persisted store set. Every call returns fresh
 * instances: two containers created from it never share data, and neither
 * hydrates the localStorage keys used by the global app.
 */
export function createStoreSet(): StoreSet {
  const tracker = createTrackerStore();
  return {
    tracker,
    log: createLogStore(),
    biomarker: createBiomarkerStore(),
    plan: createPlanStore(tracker),
    activity: createActivityStore(),
    nudge: createNudgeStore(),
  };
}

/**
 * The application's persisted singletons — exactly one instance per device.
 *
 * The production container is wired to this set, so the UI keeps using the
 * exported `useXStore` hooks with encryption and rehydration intact.
 */
export const GLOBAL_STORE_SET: StoreSet = {
  tracker: useTrackerStore,
  log: useLogStore,
  biomarker: useBiomarkerStore,
  plan: usePlanStore,
  activity: useActivityStore,
  nudge: useNudgeStore,
};
