import { describe, it, expect, beforeEach } from 'vitest';
import { CooldownTracker } from '@domain/cooldownTracker';
import type { CooldownOps } from '@domain/cooldownTracker';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';

/** Build CooldownOps backed by the real persisted nudgeStore (integration test). */
function storeOps(): CooldownOps {
  return {
    registerCooldown: (id, timestamp) => useNudgeStore.getState().registerCooldown(id, timestamp),
    getCooldowns: () => useNudgeStore.getState().cooldowns,
    resetCooldown: (id) => useNudgeStore.getState().resetCooldown(id),
  };
}

describe('CooldownTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
  });

  describe('register / isOnCooldown', () => {
    it('stores cooldowns in nudgeStore persisted state', () => {
      let now = 0;
      const tracker = new CooldownTracker(storeOps(), () => now);
      tracker.register('R1');

      // VERIFY: cooldowns are stored in nudgeStore's persisted state, not an internal Map
      const nudgeCooldowns = useNudgeStore.getState().cooldowns;
      expect(nudgeCooldowns['R1']).toBe(0);
    });

    it('blocks within cooldown window and allows after expiry', () => {
      let now = 0;
      const tracker = new CooldownTracker(storeOps(), () => now);

      tracker.register('R1');

      // At t=0, still within 60-minute cooldown
      expect(tracker.isOnCooldown('R1', 60)).toBe(true);

      // At t = 61 * 60 * 1000ms (61 minutes), beyond cooldown
      now = 61 * 60 * 1000;
      expect(tracker.isOnCooldown('R1', 60)).toBe(false);
    });

    it('returns false for an unknown rule id', () => {
      const tracker = new CooldownTracker(storeOps());
      expect(tracker.isOnCooldown('unknown', 60)).toBe(false);
    });
  });

  describe('reset', () => {
    it('clears all entries when called without id', () => {
      let now = 0;
      const tracker = new CooldownTracker(storeOps(), () => now);
      tracker.register('R1');
      tracker.register('R2');

      expect(tracker.isOnCooldown('R1', 60)).toBe(true);
      expect(tracker.isOnCooldown('R2', 60)).toBe(true);

      tracker.reset();

      expect(tracker.isOnCooldown('R1', 60)).toBe(false);
      expect(tracker.isOnCooldown('R2', 60)).toBe(false);
    });

    it('clears a single entry when called with id', () => {
      let now = 0;
      const tracker = new CooldownTracker(storeOps(), () => now);
      tracker.register('R1');
      tracker.register('R2');

      tracker.reset('R1');

      expect(tracker.isOnCooldown('R1', 60)).toBe(false);
      expect(tracker.isOnCooldown('R2', 60)).toBe(true);
    });
  });

  it('defaults to Date.now when no factory is provided', () => {
    const tracker = new CooldownTracker(storeOps());
    tracker.register('R-default');
    expect(tracker.isOnCooldown('R-default', 1440)).toBe(true);
  });
});
