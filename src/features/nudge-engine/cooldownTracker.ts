/** In-memory cooldown tracker per rule id. Injectable now() for testability. */
export class CooldownTracker {
  private store = new Map<string, number>();
  private now: () => number;

  constructor(now?: () => number) {
    this.now = now ?? Date.now;
  }

  register(id: string): void {
    this.store.set(id, this.now());
  }

  isOnCooldown(id: string, cooldownMinutes: number): boolean {
    const registeredAt = this.store.get(id);
    if (registeredAt === undefined) return false;
    const elapsed = this.now() - registeredAt;
    return elapsed < cooldownMinutes * 60 * 1000;
  }

  reset(id?: string): void {
    if (id === undefined) {
      this.store.clear();
    } else {
      this.store.delete(id);
    }
  }
}
