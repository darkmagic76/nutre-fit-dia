import { describe, it, expect, beforeEach } from 'vitest';
import { usePlanStore } from './planStore';
import { useTrackerStore } from '@shared/stores';

describe('planStore', () => {
  beforeEach(() => {
    usePlanStore.setState({ weeklyPlan: null });
    useTrackerStore.setState({ restrictionActive: false });
  });

  it('starts with no weekly plan', () => {
    expect(usePlanStore.getState().weeklyPlan).toBeNull();
  });

  it('generates a weekly plan', () => {
    usePlanStore.getState().generatePlan();

    const state = usePlanStore.getState();
    expect(state.weeklyPlan).not.toBeNull();
    expect(state.weeklyPlan!.days).toHaveLength(7);
    expect(state.weeklyPlan!.valid).toBe(true);
  });

  it('generates a plan respecting restrictionActive from trackerStore', () => {
    useTrackerStore.setState({ restrictionActive: true });
    usePlanStore.getState().generatePlan();

    const state = usePlanStore.getState();
    expect(state.weeklyPlan).not.toBeNull();
  });

  it('overwrites previous plan on regenerate', () => {
    usePlanStore.getState().generatePlan();
    const first = usePlanStore.getState().weeklyPlan;

    usePlanStore.getState().generatePlan();
    const second = usePlanStore.getState().weeklyPlan;

    expect(second).not.toBeNull();
    expect(first).not.toBe(second);
  });
});
