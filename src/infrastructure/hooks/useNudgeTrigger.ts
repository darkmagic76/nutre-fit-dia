import { useCallback } from 'react';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { foods } from '@shared/data/foods';
import type { Food } from '@domain/food';
import type { ContextInput } from '@domain/nudgeContext';
import { computeBiomarkerTrend } from '@domain/biomarkerTypes';
import { useContainer } from '@shared/context/useContainer';

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
  const { evaluateNudges } = useContainer();

  return useCallback(
    (food?: Food) => {
      // Read LIVE store state at call time, not a render-time closure. A food
      // removed in the same tick (e.g. handleRemoveFood → removeFoodFromLog →
      // trigger) must be reflected here so stale nudges auto-resolve on the same
      // interaction instead of one action later.
      const { caloricRestrictionActive } = useTrackerStore.getState();
      const { todayLog } = useLogStore.getState();
      const { weeklyMinutes } = useActivityStore.getState();
      const { glucoseHistory, weightHistory } = useBiomarkerStore.getState();
      const trends = computeBiomarkerTrend(glucoseHistory, weightHistory);

      const input: ContextInput = {
        caloricRestrictionActive,
        todayLog,
        weeklyMinutes,
        trends,
        food,
        catalog: foods,
      };
      evaluateNudges(input);
    },
    [evaluateNudges],
  );
}
