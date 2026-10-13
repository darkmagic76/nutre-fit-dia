import { foodsById } from '@shared/data/foods';
import type { ActivityRepository } from '@application/ports/activityRepository';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import type { DemoGuidePort } from '@application/ports/demoGuide';
import type { LogRepository } from '@application/ports/logRepository';
import type { PlanRepository } from '@application/ports/planRepository';
import { DEMO_ENTRY_IDS, DEMO_METRICS_INPUT } from './demoDataset';

/**
 * Port-injected dependencies for the demo guide service.
 * `resetStorage` is injected from infrastructure so this application
 * service never imports infrastructure modules (Clean Architecture).
 */
export interface DemoGuideDeps {
  logRepo: LogRepository;
  biomarkerRepo: BiomarkerRepository;
  planRepo: PlanRepository;
  activityRepo: ActivityRepository;
  resetStorage: () => Promise<void>;
}

function isEmptyStores(deps: DemoGuideDeps): boolean {
  return (
    deps.logRepo.getTodayLog().length === 0 &&
    deps.biomarkerRepo.getGlucoseHistory().length === 0 &&
    deps.biomarkerRepo.getWeightHistory().length === 0 &&
    deps.planRepo.getPlan() === null &&
    deps.activityRepo.getEntries().length === 0
  );
}

/**
 * Port-injected demo seed/reset service. Pure application logic over
 * repository ports — no store imports, no infrastructure imports.
 */
export function createDemoGuideService(deps: DemoGuideDeps): DemoGuidePort {
  return {
    async seedDemo(opts) {
      if (!isEmptyStores(deps) && !opts?.confirmed) {
        return { seeded: false, aborted: true };
      }
      const metrics = DEMO_METRICS_INPUT;
      deps.biomarkerRepo.recordGlucose({
        value: Number(metrics.glucose),
        timestamp: Date.now(),
        context: metrics.glucoseContext,
      });
      deps.biomarkerRepo.recordWeight(Number(metrics.weight), Number(metrics.height));
      for (const id of DEMO_ENTRY_IDS) {
        const food = foodsById.get(id);
        if (food) deps.logRepo.addFood(food, false);
      }
      deps.activityRepo.addEntry({
        date: new Date().toISOString().slice(0, 10),
        moderateMinutes: 30,
        strengthSessions: 0,
      });
      deps.planRepo.generatePlan();
      return { seeded: true, aborted: false };
    },

    async resetDemo() {
      deps.logRepo.clearLog();
      await deps.resetStorage();
    },
  };
}
