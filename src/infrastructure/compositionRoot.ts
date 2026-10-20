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
import { createDemoGuideService } from '@application/services/seedDemoData';
import { resetDemoStorage } from '@infrastructure/storage';

// ─── Infrastructure data ────────────────────────────────────────────────────
import { NUDGE_RULES } from '@infrastructure/nudge/rules';
import {
  GLOBAL_STORE_SET,
  createStoreSet,
  type StoreSet,
} from '@infrastructure/stores/createStoreSet';

// ─── Types ──────────────────────────────────────────────────────────────────
import type { ContextInput } from '@domain/nudgeContext';
import type { ProfileInput } from '@application/dtos/ProfileInput';
import type { Container } from '@application/ports/container';

/**
 * Composition root — single factory that wires stores → adapters → use cases.
 *
 * Every call gets its own `StoreSet`. By default that set is ephemeral
 * (fresh, non-persisted stores), so two containers never share data — the
 * isolation guarantee the demo spec requires.
 *
 * `resetStorage` defaults to a no-op for the same reason: an ephemeral
 * container must never wipe the real application's localStorage.
 */
export function createContainer(
  stores: StoreSet = createStoreSet(),
  resetStorage: () => Promise<void> = async () => {},
): Container {
  // 1. Adapters — thin Zustand wrappers implementing port interfaces
  const notificationRepo = createZustandNotificationRepository(stores.nudge);
  const activityRepo = createZustandActivityRepository(stores.activity);
  const logRepo = createZustandLogRepository(stores.log);
  const biomarkerRepo = createZustandBiomarkerRepository(stores.biomarker);
  const planRepo = createZustandPlanRepository(stores.plan);
  const trackerExporter = createZustandTrackerExporter(stores.tracker);

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

  // Demo guide service — port-injected over repo adapters; storage reset
  // injected from infrastructure so the application service stays pure.
  const demoGuide = createDemoGuideService({
    logRepo,
    biomarkerRepo,
    planRepo,
    activityRepo,
    resetStorage,
  });

  return {
    calculateTarget,
    evaluateNudges,
    exportData: exportAllData,
    seedDemo: demoGuide.seedDemo,
    resetDemo: demoGuide.resetDemo,
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
 * - The UI reads the exported `useXStore` hooks directly, so the production
 *   container must be wired to those same persisted stores (`GLOBAL_STORE_SET`).
 *
 * When to use `createContainer()` instead:
 * - Tests get a fully wired container backed by its own ephemeral store set,
 *   with no shared state and no persistence.
 * - The default `resetStorage` no-op keeps `resetDemo()` from touching the
 *   real application storage.
 *
 * @see {@link createContainer} for the isolated factory used in tests
 */
export const container = createContainer(GLOBAL_STORE_SET, resetDemoStorage);
