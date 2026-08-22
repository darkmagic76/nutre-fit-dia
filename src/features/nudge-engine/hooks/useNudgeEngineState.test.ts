import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNudgeEngineState } from './useNudgeEngineState';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import type { SystemNotification } from '@domain/notification';

const makeNudge = (overrides: Partial<SystemNotification> = {}): SystemNotification => ({
  id: 'n1',
  type: 'behavioral_nudge',
  severity: 'info',
  target: 'user',
  title: 'Recordatorio de hidratación',
  body: 'Recuerda beber agua.',
  ruleSource: 'WATER_HYDRATION',
  triggeredAt: new Date(),
  ...overrides,
});

describe('useNudgeEngineState', () => {
  beforeEach(() => {
    useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
  });

  it('exposes pending nudges from the store', () => {
    useNudgeStore.setState({ pending: [makeNudge()] });

    const { result } = renderHook(() => useNudgeEngineState());

    expect(result.current.pending).toHaveLength(1);
    expect(result.current.pending[0].title).toBe('Recordatorio de hidratación');
  });

  it('exposes history nudges from the store', () => {
    useNudgeStore.setState({ history: [makeNudge({ id: 'h1', dismissedAt: new Date() })] });

    const { result } = renderHook(() => useNudgeEngineState());

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).toBe('h1');
  });

  it('exposes the dismiss action bound to the store', () => {
    useNudgeStore.setState({ pending: [makeNudge()] });

    const { result } = renderHook(() => useNudgeEngineState());
    result.current.dismiss('n1');

    const state = useNudgeStore.getState();
    expect(state.pending).toHaveLength(0);
    expect(state.history).toHaveLength(1);
  });
});
