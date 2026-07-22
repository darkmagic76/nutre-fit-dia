import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActivityTracker } from './useActivityTracker';
import { useActivityStore } from '../activityStore';

describe('useActivityTracker', () => {
  beforeEach(() => {
    useActivityStore.getState().resetWeek();
  });

  it('has initial values', () => {
    const { result } = renderHook(() => useActivityTracker());
    expect(result.current.weeklyMinutes).toBe(0);
    expect(result.current.compliance).toBe(0);
    expect(result.current.streak).toBe(0);
  });

  it('shows 100% compliance when both targets met', () => {
    const { result } = renderHook(() => useActivityTracker());
    act(() => {
      result.current.addEntry({ moderateMinutes: 150, strengthSessions: 2 });
    });
    expect(result.current.compliance).toBe(100);
    expect(result.current.meetsModerate).toBe(true);
    expect(result.current.meetsStrength).toBe(true);
  });

  it('shows 50% compliance when only one target met', () => {
    const { result } = renderHook(() => useActivityTracker());
    act(() => {
      result.current.addEntry({ moderateMinutes: 150, strengthSessions: 0 });
    });
    expect(result.current.compliance).toBe(50);
  });

  it('shows 0% compliance when no targets met', () => {
    const { result } = renderHook(() => useActivityTracker());
    act(() => {
      result.current.addEntry({ moderateMinutes: 30, strengthSessions: 0 });
    });
    expect(result.current.compliance).toBe(0);
  });
});
