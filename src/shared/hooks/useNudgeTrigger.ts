import { useCallback, useMemo } from 'react';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { foods } from '@shared/data/foods';
import type { Food } from '@domain/food';
import type { ContextInput } from '@domain/nudgeContext';
import { computeBiomarkerTrend } from '@domain/biomarkerTypes';
import { useContainer } from '@shared/context/ContainerContext';

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
  const caloricRestrictionActive = useTrackerStore((s) => s.caloricRestrictionActive);
  const todayLog = useLogStore((s) => s.todayLog);
  const weeklyMinutes = useActivityStore((s) => s.weeklyMinutes);
  const glucoseHistory = useBiomarkerStore((s) => s.glucoseHistory);
  const weightHistory = useBiomarkerStore((s) => s.weightHistory);

  const trends = useMemo(
    () => computeBiomarkerTrend(glucoseHistory, weightHistory),
    [glucoseHistory, weightHistory],
  );

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
      evaluateNudges(input);
    },
    [evaluateNudges, caloricRestrictionActive, todayLog, weeklyMinutes, trends],
  );
}
