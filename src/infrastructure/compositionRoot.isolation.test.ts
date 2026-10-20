import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createContainer, container } from './compositionRoot';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { usePlanStore } from '@infrastructure/stores/planStore';

// seedDemo aborts unless the target stores are empty, so every test starts
// from a clean global state regardless of the previous test in this file.
function resetGlobalStores() {
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

describe('compositionRoot isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    resetGlobalStores();
  });

  afterEach(async () => {
    await container.resetDemo();
  });

  it('isolates two createContainer() instances', async () => {
    const c1 = createContainer();
    const c2 = createContainer();

    await expect(c1.seedDemo()).resolves.toEqual({ seeded: true, aborted: false });

    expect(c1.logRepo.getTodayLog()).toHaveLength(2);
    expect(c2.logRepo.getTodayLog()).toHaveLength(0);
    expect(c2.biomarkerRepo.getGlucoseHistory()).toHaveLength(0);
    expect(c2.planRepo.getPlan()).toBeNull();
    expect(c2.activityRepo.getEntries()).toHaveLength(0);
  });

  it('does not inherit the global singleton state', async () => {
    await expect(container.seedDemo({ confirmed: true })).resolves.toEqual({
      seeded: true,
      aborted: false,
    });

    const fresh = createContainer();

    expect(fresh.logRepo.getTodayLog()).toHaveLength(0);
    expect(fresh.biomarkerRepo.getGlucoseHistory()).toHaveLength(0);
    expect(fresh.planRepo.getPlan()).toBeNull();
  });

  it('wires the singleton to the global persisted stores', async () => {
    await container.seedDemo({ confirmed: true });

    expect(useLogStore.getState().todayLog).toHaveLength(2);
    expect(useBiomarkerStore.getState().glucoseHistory).toHaveLength(1);
    expect(usePlanStore.getState().weeklyPlan).not.toBeNull();
  });

  it('resetDemo() on an ephemeral container never wipes the real app storage', async () => {
    await expect(container.seedDemo({ confirmed: true })).resolves.toEqual({
      seeded: true,
      aborted: false,
    });
    const fresh = createContainer();

    await fresh.resetDemo();

    expect(fresh.logRepo.getTodayLog()).toHaveLength(0);
    expect(container.logRepo.getTodayLog()).toHaveLength(2);
  });
});
