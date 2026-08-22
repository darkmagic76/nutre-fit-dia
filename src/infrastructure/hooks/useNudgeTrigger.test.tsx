import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNudgeTrigger } from './useNudgeTrigger';
import { ContainerContext } from '@shared/context/containerContext';
import type { Container } from '@application/ports/container';
import type { ContextInput } from '@domain/nudgeContext';

// Mock stores
vi.mock('@infrastructure/stores/trackerStore', () => {
  const state = { caloricRestrictionActive: false };
  const useTrackerStore = vi.fn((selector: (s: any) => any) => selector(state));
  (useTrackerStore as any).getState = () => state;
  return { useTrackerStore };
});

// The log store mock distinguishes render-time state (selector) from the live
// store state (getState). The trigger must read the LIVE state when it runs, so
// that a food removed in the same tick is reflected before evaluation.
const logStoreState = { renderLog: [] as any[], liveLog: [] as any[] };

vi.mock('@infrastructure/stores/logStore', () => {
  const useLogStore = vi.fn((selector: (s: any) => any) =>
    selector({ todayLog: logStoreState.renderLog }),
  );
  (useLogStore as any).getState = () => ({ todayLog: logStoreState.liveLog });
  return { useLogStore };
});

vi.mock('@infrastructure/stores/activityStore', () => {
  const state = { weeklyMinutes: 0 };
  const useActivityStore = vi.fn((selector: (s: any) => any) => selector(state));
  (useActivityStore as any).getState = () => state;
  return { useActivityStore };
});

vi.mock('@infrastructure/stores/biomarkerStore', () => {
  const state = { glucoseHistory: [], weightHistory: [] };
  const useBiomarkerStore = vi.fn((selector: (s: any) => any) => selector(state));
  (useBiomarkerStore as any).getState = () => state;
  return { useBiomarkerStore };
});

vi.mock('@domain/biomarkerTypes', () => ({
  computeBiomarkerTrend: vi.fn(() => ({
    glucoseAvg7d: null,
    glucoseTrend: 'stable',
    weightAvg7d: null,
    weightTrend: 'stable',
    weightAvg30d: null,
    latestGlucose: null,
    latestWeight: null,
  })),
}));

describe('useNudgeTrigger', () => {
  const mockEvaluateNudges = vi.fn();

  const mockContainer: Partial<Container> = {
    evaluateNudges: mockEvaluateNudges,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ContainerContext.Provider value={mockContainer as Container}>
      {children}
    </ContainerContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    logStoreState.renderLog = [];
    logStoreState.liveLog = [];
  });

  it('evaluates against the LIVE log state, not the render-time closure', () => {
    // Simulate a stale render: the component rendered with 5 items (renderLog),
    // but a food was just removed so the live store now has 4 (liveLog). The
    // trigger must evaluate the LIVE state so nudges auto-resolve immediately.
    const five = [1, 2, 3, 4, 5].map((n) => ({ id: `c${n}`, name: 'Cereal' }) as any);
    const four = [1, 2, 3, 4].map((n) => ({ id: `c${n}`, name: 'Cereal' }) as any);
    logStoreState.renderLog = five;
    logStoreState.liveLog = four;

    const { result } = renderHook(() => useNudgeTrigger(), { wrapper });
    result.current();

    const callArg = mockEvaluateNudges.mock.calls[0][0] as ContextInput;
    expect(callArg.todayLog).toHaveLength(4);
  });

  it('returns a callback that calls evaluateNudges with ContextInput', () => {
    const { result } = renderHook(() => useNudgeTrigger(), { wrapper });

    // The hook returns a callback
    expect(typeof result.current).toBe('function');

    // Call the trigger
    result.current();

    // Verify evaluateNudges was called with correct ContextInput shape
    expect(mockEvaluateNudges).toHaveBeenCalledTimes(1);
    const callArg = mockEvaluateNudges.mock.calls[0][0] as ContextInput;
    expect(callArg).toHaveProperty('caloricRestrictionActive');
    expect(callArg).toHaveProperty('todayLog');
    expect(callArg).toHaveProperty('weeklyMinutes');
    expect(callArg).toHaveProperty('trends');
    expect(callArg).toHaveProperty('catalog');
  });

  it('passes optional food parameter to evaluateNudges', () => {
    const { result } = renderHook(() => useNudgeTrigger(), { wrapper });

    const mockFood = { id: 'food-1', name: 'Test Food' } as any;
    result.current(mockFood);

    expect(mockEvaluateNudges).toHaveBeenCalledTimes(1);
    const callArg = mockEvaluateNudges.mock.calls[0][0] as ContextInput;
    expect(callArg.food).toBe(mockFood);
  });

  it('callback includes food catalog from domain data', () => {
    const { result } = renderHook(() => useNudgeTrigger(), { wrapper });

    result.current();

    const callArg = mockEvaluateNudges.mock.calls[0][0] as ContextInput;
    expect(callArg.catalog).toBeDefined();
    expect(Array.isArray(callArg.catalog)).toBe(true);
    expect(callArg.catalog!.length).toBeGreaterThan(0);
  });
});
