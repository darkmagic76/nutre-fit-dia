import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { usePlanStore } from '@infrastructure/stores/planStore';

/**
 * Restores every global (persisted) store to its empty state.
 *
 * Shared by the composition-root tests: `seedDemo` aborts unless the target
 * stores are empty, so each test must start from a clean global state.
 */
export function resetGlobalStores(): void {
  useTrackerStore.setState({
    weight: '',
    height: '',
    age: '',
    diagnosisAge: '',
    gender: 'male',
    paf: '',
    glucose: '',
    glucoseContext: 'fasting',
    caloricTarget: null,
    caloricRestrictionActive: false,
    profileError: null,
  });
  useLogStore.setState({ todayLog: [], todayValidation: null });
  useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
  useActivityStore.setState({ weeklyMinutes: 0, strengthSessions: 0, entries: [], streak: 0 });
  useBiomarkerStore.setState({ glucoseHistory: [], weightHistory: [] });
  usePlanStore.setState({ weeklyPlan: null });
}
