import { describe, it, expect, beforeEach } from 'vitest';
import { useNudgeStore } from './nudgeStore';
import type { SystemNotification } from '@shared/domain';

describe('useNudgeStore', () => {
  beforeEach(() => {
    useNudgeStore.setState({ pending: [], history: [] });
  });

  const makeNotif = (
    id: string,
    overrides: Partial<SystemNotification> = {},
  ): SystemNotification => ({
    id,
    type: 'behavioral_nudge' as SystemNotification['type'],
    severity: 'info' as SystemNotification['severity'],
    target: 'user',
    title: 'Test notification',
    body: 'Body text',
    ruleSource: 'TEST_RULE',
    triggeredAt: new Date(),
    ...overrides,
  });

  describe('enqueue', () => {
    it('adds a notification to pending array', () => {
      const n = makeNotif('n1');
      useNudgeStore.getState().enqueue(n);
      expect(useNudgeStore.getState().pending).toEqual([n]);
    });

    it('appends multiple notifications in order', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().enqueue(makeNotif('n2'));
      expect(useNudgeStore.getState().pending).toHaveLength(2);
      expect(useNudgeStore.getState().pending[0].id).toBe('n1');
      expect(useNudgeStore.getState().pending[1].id).toBe('n2');
    });
  });

  describe('acknowledge', () => {
    it('moves acknowledged notification from pending to history', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().acknowledge('n1');

      const state = useNudgeStore.getState();
      expect(state.pending).toHaveLength(0);
      expect(state.history).toHaveLength(1);
      expect(state.history[0].id).toBe('n1');
      expect(state.history[0].acknowledgedAt).toBeDefined();
      expect(state.history[0].dismissedAt).toBeUndefined();
    });

    it('only acknowledges the targeted id, leaves others pending', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().enqueue(makeNotif('n2'));
      useNudgeStore.getState().acknowledge('n1');

      const state = useNudgeStore.getState();
      expect(state.pending).toHaveLength(1);
      expect(state.pending[0].id).toBe('n2');
      expect(state.history).toHaveLength(1);
      expect(state.history[0].id).toBe('n1');
    });

    it('no-ops when acknowledging non-existent id', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().acknowledge('nonexistent');

      expect(useNudgeStore.getState().pending).toHaveLength(1);
      expect(useNudgeStore.getState().history).toHaveLength(0);
    });
  });

  describe('dismiss', () => {
    it('moves dismissed notification from pending to history', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().dismiss('n1');

      const state = useNudgeStore.getState();
      expect(state.pending).toHaveLength(0);
      expect(state.history).toHaveLength(1);
      expect(state.history[0].id).toBe('n1');
      expect(state.history[0].dismissedAt).toBeDefined();
      expect(state.history[0].acknowledgedAt).toBeUndefined();
    });

    it('only dismisses targeted id', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().enqueue(makeNotif('n2'));
      useNudgeStore.getState().dismiss('n1');

      expect(useNudgeStore.getState().pending).toHaveLength(1);
      expect(useNudgeStore.getState().pending[0].id).toBe('n2');
    });

    it('no-ops on non-existent id', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().dismiss('nonexistent');

      expect(useNudgeStore.getState().pending).toHaveLength(1);
      expect(useNudgeStore.getState().history).toHaveLength(0);
    });
  });

  describe('clearPending', () => {
    it('removes all pending notifications', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().enqueue(makeNotif('n2'));
      useNudgeStore.getState().clearPending();

      expect(useNudgeStore.getState().pending).toHaveLength(0);
    });

    it('does not affect history', () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      useNudgeStore.getState().acknowledge('n1');
      useNudgeStore.getState().enqueue(makeNotif('n2'));
      useNudgeStore.getState().clearPending();

      expect(useNudgeStore.getState().pending).toHaveLength(0);
      expect(useNudgeStore.getState().history).toHaveLength(1);
    });
  });
});
