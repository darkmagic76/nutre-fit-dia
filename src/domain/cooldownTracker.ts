/**
 * Minimal contract for cooldown state persistence.
 * The CooldownTracker is framework-agnostic — it receives operations, not stores.
 */
export interface CooldownOps {
  registerCooldown: (id: string, timestamp: number) => void;
  getCooldowns: () => Record<string, number>;
  resetCooldown: (id?: string) => void;
}

/**
 * Cooldown tracker that delegates persistence to injected operations.
 *
 * Injectable `now()` preserved for testability — production uses Date.now.
 * State survives page refresh when backed by a persisted store (e.g. Zustand).
 */
export class CooldownTracker {
  private ops: CooldownOps;
  private now: () => number;

  constructor(ops: CooldownOps, now?: () => number) {
    this.ops = ops;
    this.now = now ?? Date.now;
  }

  /** Register a cooldown for the given rule id, storing the current timestamp. */
  register(id: string): void {
    this.ops.registerCooldown(id, this.now());
  }

  /** Check if rule id is within its cooldown window. */
  isOnCooldown(id: string, cooldownMinutes: number): boolean {
    const registeredAt = this.ops.getCooldowns()[id];
    if (registeredAt === undefined) return false;
    const elapsed = this.now() - registeredAt;
    return elapsed < cooldownMinutes * 60 * 1000;
  }

  /** Clear cooldowns — all entries when called without id, or a single entry. */
  reset(id?: string): void {
    this.ops.resetCooldown(id);
  }
}
