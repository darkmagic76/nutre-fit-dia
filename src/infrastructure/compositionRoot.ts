// ─── Adapter factories ──────────────────────────────────────────────────────
import { createZustandNotificationRepository } from '@infrastructure/adapters/zustandNotificationRepository';
import { createZustandActivityRepository } from '@infrastructure/adapters/zustandActivityRepository';
import { createZustandLogRepository } from '@infrastructure/adapters/zustandLogRepository';
import { createZustandBiomarkerRepository } from '@infrastructure/adapters/zustandBiomarkerRepository';
import { createZustandPlanRepository } from '@infrastructure/adapters/zustandPlanRepository';

// ─── Use cases ──────────────────────────────────────────────────────────────
import { calculateTarget as calculateTargetUseCase } from '@application/use-cases/calculateTarget';
import { evaluateNudges as evaluateNudgesUseCase } from '@application/use-cases/evaluateNudges';
import { exportData as exportDataUseCase } from '@application/use-cases/exportData';

// ─── Infrastructure data ────────────────────────────────────────────────────
import { NUDGE_RULES } from '@infrastructure/nudge/rules';

// ─── Stores (used directly by exportData which needs getState()) ────────────
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { usePlanStore } from '@infrastructure/stores/planStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';

// ─── Types ──────────────────────────────────────────────────────────────────
import type { ContextInput } from '@domain/nudgeContext';
import type { ProfileInput } from '@application/dtos/ProfileInput';

/**
 * Composition root — single factory that wires adapters → use cases.
 *
 * Called once at application startup. The returned container provides
 * fully-wired use case functions that React components / hooks consume.
 */
export function createContainer() {
  // 1. Adapters — thin Zustand wrappers implementing port interfaces
  const notificationRepo = createZustandNotificationRepository();
  const activityRepo = createZustandActivityRepository();
  const logRepo = createZustandLogRepository();
  const biomarkerRepo = createZustandBiomarkerRepository();
  const planRepo = createZustandPlanRepository();

  // 2. Use cases — receive ports, never import stores directly
  const calculateTarget = (input: ProfileInput) => calculateTargetUseCase(input, biomarkerRepo);

  const evaluateNudges = (input: ContextInput) =>
    evaluateNudgesUseCase(input, NUDGE_RULES, notificationRepo);

  // exportData needs store.getState() — pass the actual Zustand store modules
  const exportAllData = () =>
    exportDataUseCase(
      useTrackerStore,
      useLogStore,
      useNudgeStore,
      useActivityStore,
      usePlanStore,
      useBiomarkerStore,
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

/** Singleton container — instantiated once, consumed by the React tree. */
export const container = createContainer();
