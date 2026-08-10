import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNudgeTrigger } from './useNudgeTrigger';
import { ContainerContext } from '@shared/context/containerContext';
import type { Container } from '@application/ports/container';
import type { ContextInput } from '@domain/nudgeContext';

// Mock stores
vi.mock('@infrastructure/stores/trackerStore', () => ({
  useTrackerStore: vi.fn((selector: (s: any) => any) =>
    selector({ caloricRestrictionActive: false }),
  ),
}));

vi.mock('@infrastructure/stores/logStore', () => ({
  useLogStore: vi.fn((selector: (s: any) => any) => selector({ todayLog: [] })),
}));

vi.mock('@infrastructure/stores/activityStore', () => ({
  useActivityStore: vi.fn((selector: (s: any) => any) => selector({ weeklyMinutes: 0 })),
}));

vi.mock('@infrastructure/stores/biomarkerStore', () => ({
  useBiomarkerStore: vi.fn((selector: (s: any) => any) =>
    selector({ glucoseHistory: [], weightHistory: [] }),
  ),
}));

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
