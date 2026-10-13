import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Food } from '@domain/index';
import type { BiomarkerTrend, GlucoseReading, WeightReading } from '@domain/index';
import type { ActivityEntry } from '@domain/activity';
import type { WeeklyPlan } from '@domain/plan';
import { computeIMC } from '@domain/imc';
import { computeBiomarkerTrend } from '@domain/biomarkerTypes';
import type { LogRepository } from '@application/ports/logRepository';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import type { PlanRepository } from '@application/ports/planRepository';
import type { ActivityRepository } from '@application/ports/activityRepository';
import { foodsById } from '@shared/data/foods';
import { DEMO_ENTRY_IDS } from './demoDataset';
import { createDemoGuideService, type DemoGuideDeps } from './seedDemoData';

function createFakeLogRepo(): LogRepository & { foods: Food[] } {
  const foods: Food[] = [];
  return {
    foods,
    getTodayLog: () => foods,
    addFood: (food) => {
      foods.push(food);
    },
    removeFood: (index) => {
      foods.splice(index, 1);
    },
    clearLog: () => {
      foods.length = 0;
    },
  };
}

function createFakeBiomarkerRepo(): BiomarkerRepository & {
  glucose: GlucoseReading[];
  weight: WeightReading[];
} {
  const glucose: GlucoseReading[] = [];
  const weight: WeightReading[] = [];
  return {
    glucose,
    weight,
    getGlucoseHistory: () => glucose,
    getWeightHistory: () => weight,
    getTrend: (): BiomarkerTrend => computeBiomarkerTrend(glucose, weight),
    recordGlucose: (reading) => {
      glucose.push(reading);
    },
    recordWeight: (kg, cm) => {
      const reading: WeightReading = { value: kg, timestamp: Date.now(), imc: computeIMC(kg, cm) };
      weight.push(reading);
      return reading;
    },
    detectIMCThresholdCrossing: () => null,
  };
}

function createFakePlanRepo(): PlanRepository & { generated: number } {
  const repo: PlanRepository & { generated: number } = {
    generated: 0,
    getPlan: () => (repo.generated > 0 ? ({ valid: true } as WeeklyPlan) : null),
    generatePlan: () => {
      repo.generated += 1;
    },
  };
  return repo;
}

function createFakeActivityRepo(): ActivityRepository & { entries: ActivityEntry[] } {
  const entries: ActivityEntry[] = [];
  return {
    entries,
    getWeeklyMinutes: () => entries.reduce((s, e) => s + e.moderateMinutes, 0),
    getStrengthSessions: () => entries.reduce((s, e) => s + e.strengthSessions, 0),
    getEntries: () => entries,
    addEntry: (entry) => {
      entries.push(entry);
    },
    getStreak: () => 0,
  };
}

function createDeps(): DemoGuideDeps & { resetStorage: ReturnType<typeof vi.fn> } {
  return {
    logRepo: createFakeLogRepo(),
    biomarkerRepo: createFakeBiomarkerRepo(),
    planRepo: createFakePlanRepo(),
    activityRepo: createFakeActivityRepo(),
    resetStorage: vi.fn(async () => {}),
  };
}

describe('seedDemo guard', () => {
  let deps: ReturnType<typeof createDeps>;

  beforeEach(() => {
    deps = createDeps();
  });

  it('seeds demo data when all target stores are empty', async () => {
    const service = createDemoGuideService(deps);

    const result = await service.seedDemo();

    expect(result).toEqual({ seeded: true, aborted: false });
    expect(deps.logRepo.getTodayLog()).toHaveLength(DEMO_ENTRY_IDS.length);
    expect(deps.biomarkerRepo.getGlucoseHistory()).toHaveLength(1);
    expect(deps.biomarkerRepo.getGlucoseHistory()[0].value).toBe(100);
    expect(deps.biomarkerRepo.getWeightHistory()).toHaveLength(1);
    expect(deps.planRepo.getPlan()).not.toBeNull();
    expect(deps.activityRepo.getEntries()).toHaveLength(1);
  });

  it('aborts without touching data when stores are non-empty and no confirm flag', async () => {
    const userFood = foodsById.get('oil-aove');
    expect(userFood).toBeDefined();
    deps.logRepo.addFood(userFood as Food, false);
    const service = createDemoGuideService(deps);

    const result = await service.seedDemo();

    expect(result).toEqual({ seeded: false, aborted: true });
    expect(deps.logRepo.getTodayLog()).toHaveLength(1);
    expect(deps.biomarkerRepo.getGlucoseHistory()).toHaveLength(0);
  });

  it('seeds when confirmed=true even if stores are non-empty', async () => {
    const userFood = foodsById.get('oil-aove');
    deps.logRepo.addFood(userFood as Food, false);
    const service = createDemoGuideService(deps);

    const result = await service.seedDemo({ confirmed: true });

    expect(result).toEqual({ seeded: true, aborted: false });
    expect(deps.logRepo.getTodayLog().length).toBeGreaterThan(1);
  });

  it('resetDemo clears the log and cycles storage', async () => {
    const service = createDemoGuideService(deps);
    await service.seedDemo();

    await service.resetDemo();

    expect(deps.logRepo.getTodayLog()).toHaveLength(0);
    expect(deps.resetStorage).toHaveBeenCalledTimes(1);
  });

  it('keeps two service instances isolated (separate repos)', async () => {
    const other = createDeps();
    const service = createDemoGuideService(deps);
    createDemoGuideService(other);

    await service.seedDemo();

    expect(deps.logRepo.getTodayLog().length).toBeGreaterThan(0);
    expect(other.logRepo.getTodayLog()).toHaveLength(0);
  });
});
