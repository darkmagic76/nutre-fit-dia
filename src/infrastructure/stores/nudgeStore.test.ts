import { describe, it, expect, beforeEach } from 'vitest';
import { useNudgeStore } from './nudgeStore';
import type { SystemNotification } from '@domain/notification';
import { z } from 'zod';

// --- Zod schema for persisted state (structural integrity only) ---
const NudgeStateSchema = z.object({
  pending: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      severity: z.string(),
      target: z.string(),
      title: z.string(),
      body: z.string(),
      ruleSource: z.string(),
      triggeredAt: z.string(),
      acknowledgedAt: z.string().optional(),
      dismissedAt: z.string().optional(),
    }),
  ),
  history: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      severity: z.string(),
      target: z.string(),
      title: z.string(),
      body: z.string(),
      ruleSource: z.string(),
      triggeredAt: z.string(),
      acknowledgedAt: z.string().optional(),
      dismissedAt: z.string().optional(),
    }),
  ),
  cooldowns: z.record(z.string(), z.number()),
});

describe('useNudgeStore', () => {
  const STORAGE_KEY = 'nutrefitdia-nudge';

  beforeEach(() => {
    localStorage.clear();
    useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
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

  // --- COOLDOWN TESTS ---
  describe('cooldowns', () => {
    it('starts with empty cooldowns', () => {
      expect(useNudgeStore.getState().cooldowns).toEqual({});
    });

    it('registerCooldown sets timestamp for given id', () => {
      useNudgeStore.getState().registerCooldown('rule-1');
      const cooldowns = useNudgeStore.getState().cooldowns;
      expect(typeof cooldowns['rule-1']).toBe('number');
      expect(cooldowns['rule-1']).toBeGreaterThan(0);
    });

    it('registerCooldown overwrites previous timestamp', () => {
      useNudgeStore.getState().registerCooldown('rule-1');
      const first = useNudgeStore.getState().cooldowns['rule-1'];
      useNudgeStore.getState().registerCooldown('rule-1');
      const second = useNudgeStore.getState().cooldowns['rule-1'];
      expect(second).toBeGreaterThanOrEqual(first);
    });

    it('resetCooldown with id removes specific entry', () => {
      useNudgeStore.getState().registerCooldown('rule-1');
      useNudgeStore.getState().registerCooldown('rule-2');
      useNudgeStore.getState().resetCooldown('rule-1');

      const cooldowns = useNudgeStore.getState().cooldowns;
      expect(cooldowns['rule-1']).toBeUndefined();
      expect(cooldowns['rule-2']).toBeDefined();
    });

    it('resetCooldown without id clears all cooldowns', () => {
      useNudgeStore.getState().registerCooldown('rule-1');
      useNudgeStore.getState().registerCooldown('rule-2');
      useNudgeStore.getState().resetCooldown();

      expect(useNudgeStore.getState().cooldowns).toEqual({});
    });

    it('resetCooldown no-ops on unknown id', () => {
      useNudgeStore.getState().registerCooldown('rule-1');
      useNudgeStore.getState().resetCooldown('nonexistent');

      expect(useNudgeStore.getState().cooldowns['rule-1']).toBeDefined();
    });
  });

  // --- PERSIST TESTS ---
  describe('persist', () => {
    async function waitForPersist() {
      await new Promise((r) => setTimeout(r, 0));
    }

    function readStoredState() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error('No stored data');
      return JSON.parse(raw).state as Record<string, unknown>;
    }

    it('writes state to localStorage on change', async () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      await waitForPersist();
      const state = readStoredState();
      expect(state.pending).toBeDefined();
    });

    it('excludes functions from serialized state', async () => {
      useNudgeStore.getState().enqueue(makeNotif('n1'));
      await waitForPersist();
      const state = readStoredState();

      const fnKeys = Object.keys(state).filter((k) => typeof state[k] === 'function');
      expect(fnKeys).toEqual([]);
    });

    it('persists cooldowns to localStorage', async () => {
      useNudgeStore.getState().registerCooldown('rule-1');
      await waitForPersist();
      const state = readStoredState();

      expect(state.cooldowns).toBeDefined();
      expect(typeof (state.cooldowns as Record<string, unknown>)['rule-1']).toBe('number');
    });

    it('uses defaults on fresh start with empty localStorage', () => {
      const state = useNudgeStore.getState();
      expect(state.pending).toEqual([]);
      expect(state.history).toEqual([]);
      expect(state.cooldowns).toEqual({});
    });
  });
});

describe('NudgeStateSchema', () => {
  it('accepts valid state', () => {
    const result = NudgeStateSchema.safeParse({
      pending: [],
      history: [],
      cooldowns: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts populated cooldowns', () => {
    const result = NudgeStateSchema.safeParse({
      pending: [],
      history: [],
      cooldowns: { 'rule-1': 1000 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects cooldowns with string values', () => {
    const result = NudgeStateSchema.safeParse({
      pending: [],
      history: [],
      cooldowns: { 'rule-1': 'not-a-number' },
    });
    expect(result.success).toBe(false);
  });
});

describe('onRehydrateStorage', () => {
  it('resets to defaults when stored data fails schema validation', async () => {
    const STORAGE_KEY = 'nutrefitdia-nudge';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { pending: 'bad' }, version: 1 }));
    vi.resetModules();
    const mod = await import('./nudgeStore');
    const state = mod.useNudgeStore.getState();
    expect(state.pending).toEqual([]);
    expect(state.history).toEqual([]);
    expect(state.cooldowns).toEqual({});
  });
});
