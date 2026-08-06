// ─── Minimal port interfaces (inline until Phase 4) ───────────────────────

interface StoreSnapshot {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getState(): any;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function stripActions<T extends object>(state: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function') {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

// ─── Use Case ──────────────────────────────────────────────────────────────

/**
 * Aggregate all application state into a JSON export blob.
 *
 * Pure data aggregation — accepts repository ports, returns a JSON string.
 * No Zustand, no React, no @features/* imports.
 *
 * @param trackerRepo
 * @param logRepo
 * @param nudgeRepo
 * @param activityRepo
 * @param planRepo
 * @param biomarkerRepo
 * @returns JSON string ready for download
 */
export function exportData(
  trackerRepo: StoreSnapshot,
  logRepo: StoreSnapshot,
  nudgeRepo: StoreSnapshot,
  activityRepo: StoreSnapshot,
  planRepo: StoreSnapshot,
  biomarkerRepo: StoreSnapshot,
): string {
  const tracker = stripActions(trackerRepo.getState());
  const log = stripActions(logRepo.getState());
  const nudge = stripActions(nudgeRepo.getState());
  const activity = stripActions(activityRepo.getState());
  const plan = stripActions(planRepo.getState());
  const biomarkerHistory = stripActions(biomarkerRepo.getState());

  const payload = {
    tracker,
    log,
    nudge,
    activity,
    plan,
    biomarkerHistory,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(payload, null, 2);
}
