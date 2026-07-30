import { useNudgeStore } from '@shared/stores';

/**
 * Cooldown tracker that reads/writes cooldown state via nudgeStore's persisted `cooldowns` field.
 *
 * Injectable `now()` preserved for testability — production uses Date.now.
 * All cooldown state survives page refresh because it lives in nudgeStore (zustand/persist).
 */
export class CooldownTracker {
  private now: () => number;

  constructor(now?: () => number) {
    this.now = now ?? Date.now;
  }

  /** Register a cooldown for the given rule id, storing the current timestamp. */
  register(id: string): void {
    useNudgeStore.getState().registerCooldown(id, this.now());
  }

  /** Check if rule id is within its cooldown window. */
  isOnCooldown(id: string, cooldownMinutes: number): boolean {
    const registeredAt = useNudgeStore.getState().cooldowns[id];
    if (registeredAt === undefined) return false;
    const elapsed = this.now() - registeredAt;
    return elapsed < cooldownMinutes * 60 * 1000;
  }

  /** Clear cooldowns — all entries when called without id, or a single entry. */
  reset(id?: string): void {
    useNudgeStore.getState().resetCooldown(id);
  }
}
