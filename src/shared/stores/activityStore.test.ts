import { describe, it, expect, beforeEach } from 'vitest';
import { useActivityStore } from './activityStore';
import { z } from 'zod';
import type { ActivityEntry } from '@shared/domain/activity';

// --- Zod schema for persisted state (structural integrity only) ---
const ActivityStateSchema = z.object({
  weeklyMinutes: z.number(),
  strengthSessions: z.number(),
  entries: z.array(
    z.object({
      date: z.string(),
      moderateMinutes: z.number(),
      strengthSessions: z.number(),
    }),
  ),
  streak: z.number(),
});

const defaults = {
  weeklyMinutes: 0,
  strengthSessions: 0,
  entries: [] as ActivityEntry[],
  streak: 0,
};

describe('activityStore', () => {
  const STORAGE_KEY = 'nutrefitdia-activity';

  beforeEach(() => {
    localStorage.clear();
    useActivityStore.setState({ ...defaults });
  });

  it('starts with zero values', () => {
    const state = useActivityStore.getState();
    expect(state.weeklyMinutes).toBe(0);
    expect(state.strengthSessions).toBe(0);
    expect(state.entries).toEqual([]);
    expect(state.streak).toBe(0);
  });

  it('adds entry and increments counters', () => {
    const { addEntry } = useActivityStore.getState();
    addEntry({ date: '2026-07-30', moderateMinutes: 30, strengthSessions: 1 });

    const state = useActivityStore.getState();
    expect(state.weeklyMinutes).toBe(30);
    expect(state.strengthSessions).toBe(1);
    expect(state.entries).toHaveLength(1);
  });

  it('accumulates multiple entries', () => {
    const { addEntry } = useActivityStore.getState();
    addEntry({ date: '2026-07-30', moderateMinutes: 30, strengthSessions: 1 });
    addEntry({ date: '2026-07-31', moderateMinutes: 45, strengthSessions: 2 });

    const state = useActivityStore.getState();
    expect(state.weeklyMinutes).toBe(75);
    expect(state.strengthSessions).toBe(3);
  });

  it('resets week to zero', () => {
    const { addEntry, resetWeek } = useActivityStore.getState();
    addEntry({ date: '2026-07-30', moderateMinutes: 30, strengthSessions: 1 });
    resetWeek();

    const state = useActivityStore.getState();
    expect(state.weeklyMinutes).toBe(0);
    expect(state.strengthSessions).toBe(0);
    expect(state.entries).toEqual([]);
  });

  it('increments and resets streak', () => {
    const state = useActivityStore.getState();
    state.incrementStreak();
    expect(useActivityStore.getState().streak).toBe(1);
    state.incrementStreak();
    expect(useActivityStore.getState().streak).toBe(2);
    state.resetStreak();
    expect(useActivityStore.getState().streak).toBe(0);
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
      useActivityStore.setState({ weeklyMinutes: 150, strengthSessions: 2 });
      await waitForPersist();
      const state = readStoredState();
      expect(state.weeklyMinutes).toBeDefined();
      expect(state.strengthSessions).toBeDefined();
    });

    it('encrypts sensitive health fields', async () => {
      useActivityStore.setState({ weeklyMinutes: 180, strengthSessions: 3 });
      await waitForPersist();
      const state = readStoredState();

      expect(state.weeklyMinutes).toBeDefined();
      expect(typeof state.weeklyMinutes).toBe('object');
      expect((state.weeklyMinutes as Record<string, unknown>).__encrypted).toBe(true);
      expect((state.strengthSessions as Record<string, unknown>).__encrypted).toBe(true);
    });

    it('keeps non-sensitive fields plaintext', async () => {
      useActivityStore.setState({ weeklyMinutes: 100, streak: 5 });
      await waitForPersist();
      const state = readStoredState();

      expect(state.streak).toBe(5);
      expect(typeof state.streak).toBe('number');
    });

    it('excludes functions from serialized state', async () => {
      useActivityStore.setState({ weeklyMinutes: 100 });
      await waitForPersist();
      const state = readStoredState();

      const fnKeys = Object.keys(state).filter((k) => typeof state[k] === 'function');
      expect(fnKeys).toEqual([]);
    });

    it('uses defaults on fresh start with empty localStorage', () => {
      const state = useActivityStore.getState();
      expect(state.weeklyMinutes).toBe(0);
      expect(state.strengthSessions).toBe(0);
      expect(state.entries).toEqual([]);
      expect(state.streak).toBe(0);
    });
  });
});

describe('ActivityStateSchema', () => {
  it('accepts valid state', () => {
    const result = ActivityStateSchema.safeParse({
      weeklyMinutes: 150,
      strengthSessions: 2,
      entries: [],
      streak: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects string weeklyMinutes', () => {
    const result = ActivityStateSchema.safeParse({
      weeklyMinutes: 'not-a-number',
      strengthSessions: 2,
      entries: [],
      streak: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = ActivityStateSchema.safeParse({
      weeklyMinutes: 150,
    });
    expect(result.success).toBe(false);
  });
});
