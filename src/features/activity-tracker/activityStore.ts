/**
 * Re-exports useActivityStore from shared/stores/activityStore.ts.
 *
 * Moved to shared/ per ADR-001 Scope Rule: activityStore is used by
 * activity-tracker (feature) AND nudge-engine (feature) → shared/.
 * This barrel preserves existing import paths for backward compatibility.
 */
export { useActivityStore, DEFAULT_WEEKLY_GOAL } from '@shared/stores/activityStore';
