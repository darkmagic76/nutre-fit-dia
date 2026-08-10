// ─── Adapter factories ──────────────────────────────────────────────────────
import { createZustandNotificationRepository } from '@infrastructure/adapters/zustandNotificationRepository';
import { createZustandActivityRepository } from '@infrastructure/adapters/zustandActivityRepository';
import { createZustandLogRepository } from '@infrastructure/adapters/zustandLogRepository';
import { createZustandBiomarkerRepository } from '@infrastructure/adapters/zustandBiomarkerRepository';
import { createZustandPlanRepository } from '@infrastructure/adapters/zustandPlanRepository';
import { createZustandTrackerExporter } from '@infrastructure/adapters/zustandTrackerExporter';

// ─── Use cases ──────────────────────────────────────────────────────────────
import { calculateTarget as calculateTargetUseCase } from '@application/use-cases/calculateTarget';
import { evaluateNudges as evaluateNudgesUseCase } from '@application/use-cases/evaluateNudges';
import { exportData as exportDataUseCase } from '@application/use-cases/exportData';

// ─── Infrastructure data ────────────────────────────────────────────────────
import { NUDGE_RULES } from '@infrastructure/nudge/rules';

// ─── Types ──────────────────────────────────────────────────────────────────
import type { ContextInput } from '@domain/nudgeContext';
import type { ProfileInput } from '@application/dtos/ProfileInput';
import type { Container } from '@application/ports/container';

/**
 * Composition root — single factory that wires adapters → use cases.
 *
 * Called once at application startup. The returned container provides
 * fully-wired use case functions that React components / hooks consume.
 */
export function createContainer(): Container {
  // 1. Adapters — thin Zustand wrappers implementing port interfaces
  const notificationRepo = createZustandNotificationRepository();
  const activityRepo = createZustandActivityRepository();
  const logRepo = createZustandLogRepository();
  const biomarkerRepo = createZustandBiomarkerRepository();
  const planRepo = createZustandPlanRepository();
  const trackerExporter = createZustandTrackerExporter();

  // 2. Use cases — receive ports, never import stores directly
  const calculateTarget = (input: ProfileInput) => calculateTargetUseCase(input, biomarkerRepo);

  const evaluateNudges = (input: ContextInput) =>
    evaluateNudgesUseCase(input, NUDGE_RULES, notificationRepo);

  // exportData receives StateExporter adapters — no direct Zustand store access
  const exportAllData = () =>
    exportDataUseCase(
      trackerExporter,
      logRepo,
      notificationRepo,
      activityRepo,
      planRepo,
      biomarkerRepo,
    );

  return {
    calculateTarget,
    evaluateNudges,
    exportData: exportAllData,
    // Expose adapters directly for consumers that need port-level access
    notificationRepo,
    activityRepo,
    logRepo,
    biomarkerRepo,
    planRepo,
  };
}

/**
 * Singleton container — instantiated once at module load, consumed by the
 * React tree via `<ContainerProvider value={container}>`.
 *
 * Why a singleton?
 * - The application has exactly one runtime state (single user, single device).
 * - React Context providers need a stable reference across renders.
 * - All Zustand stores are already module-level singletons; the container
 *   merely wires them into use cases.
 *
 * When to use `createContainer()` instead:
 * - Tests call `createContainer()` to get a fresh wired instance without
 *   polluting the global singleton state.
 * - Each call returns a new container with its own adapter instances,
 *   useful for parallel test isolation.
 *
 * @see {@link createContainer} for the factory used in tests
 */
export const container = createContainer();
