/** StateExporter — application port for raw state snapshots. */
export interface StateExporter {
  /** Returns a plain data snapshot (no functions). */
  getState(): Record<string, unknown>;
}
