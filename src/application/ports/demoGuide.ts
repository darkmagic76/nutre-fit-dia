/** DemoGuidePort — application port for the reproducible demo tour data setup. */
export interface DemoGuidePort {
  /** Seed demo data. Aborts when target stores are non-empty unless confirmed. */
  seedDemo(opts?: { confirmed?: boolean }): Promise<{ seeded: boolean; aborted: boolean }>;
  /** Atomically clear demo data (persisted keys + key cycle). Never wipes on exit. */
  resetDemo(): Promise<void>;
}
