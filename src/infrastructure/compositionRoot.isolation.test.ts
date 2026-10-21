import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createContainer, container } from './compositionRoot';
import { resetGlobalStores } from '@/test/storeReset';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { usePlanStore } from '@infrastructure/stores/planStore';

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
