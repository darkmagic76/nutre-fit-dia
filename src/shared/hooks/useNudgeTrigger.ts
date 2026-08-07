import { useCallback } from 'react';
import { container } from '@infrastructure/compositionRoot';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { foods } from '@shared/data/foods';
import type { Food } from '@domain/food';
import type { ContextInput } from '@domain/nudgeContext';

/**
 * Cross-cutting hook: triggers nudge evaluation for the current store state.
 *
 * Reads tracker, log, activity, and biomarker stores to build a ContextInput,
 * then delegates to the composition root's evaluateNudges use case via
 * the NotificationRepository port. Zero direct store access in the use case.
 *
 * @returns A callback that accepts an optional scanned food for sustainability
 *          substitution. Call with no args to trigger a general nudge cycle.
 */
export function useNudgeTrigger() {
  const caloricRestrictionActive = useTrackerStore((s) => s.caloricRestrictionActive);
  const todayLog = useLogStore((s) => s.todayLog);
  const weeklyMinutes = useActivityStore((s) => s.weeklyMinutes);
  const trends = useBiomarkerStore((s) => s.getTrend());

  return useCallback(
    (food?: Food) => {
      const input: ContextInput = {
        caloricRestrictionActive,
        todayLog,
        weeklyMinutes,
        trends,
        food,
        catalog: foods,
      };
      container.evaluateNudges(input);
    },
    [caloricRestrictionActive, todayLog, weeklyMinutes, trends],
  );
}
