import { describe, it, expect } from 'vitest';
import type { NotificationRepository } from '@application/ports/notificationRepository';
import type { ActivityRepository } from '@application/ports/activityRepository';
import type { LogRepository } from '@application/ports/logRepository';
import type { BiomarkerRepository } from '@application/ports/biomarkerRepository';
import type { PlanRepository } from '@application/ports/planRepository';

/**
 * Contract tests for Zustand adapter factories.
 *
 * Each test verifies TypeScript structural compatibility by assigning the
 * factory return value to a port-typed variable. If the test compiles and
 * the object is non-null, the adapter satisfies the port contract.
 *
 * Runtime assertions validate basic wiring — all methods are callable.
 */

describe('Zustand adapter contracts', () => {
  describe('zustandNotificationRepository', () => {
    it('satisfies NotificationRepository port', async () => {
      const { createZustandNotificationRepository } =
        await import('./zustandNotificationRepository');
      const repo: NotificationRepository = createZustandNotificationRepository();

      expect(repo).toBeDefined();
      expect(typeof repo.enqueue).toBe('function');
      expect(typeof repo.acknowledge).toBe('function');
      expect(typeof repo.dismiss).toBe('function');
      expect(typeof repo.getPending).toBe('function');
      expect(typeof repo.getHistory).toBe('function');
      expect(typeof repo.getCooldowns).toBe('function');
      expect(typeof repo.registerCooldown).toBe('function');
      expect(typeof repo.resetCooldown).toBe('function');
    });
  });

  describe('zustandActivityRepository', () => {
    it('satisfies ActivityRepository port', async () => {
      const { createZustandActivityRepository } = await import('./zustandActivityRepository');
      const repo: ActivityRepository = createZustandActivityRepository();

      expect(repo).toBeDefined();
      expect(typeof repo.getWeeklyMinutes).toBe('function');
      expect(typeof repo.getStrengthSessions).toBe('function');
      expect(typeof repo.getEntries).toBe('function');
      expect(typeof repo.addEntry).toBe('function');
      expect(typeof repo.getStreak).toBe('function');
    });
  });

  describe('zustandLogRepository', () => {
    it('satisfies LogRepository port', async () => {
      const { createZustandLogRepository } = await import('./zustandLogRepository');
      const repo: LogRepository = createZustandLogRepository();

      expect(repo).toBeDefined();
      expect(typeof repo.getTodayLog).toBe('function');
      expect(typeof repo.addFood).toBe('function');
      expect(typeof repo.removeFood).toBe('function');
      expect(typeof repo.clearLog).toBe('function');
    });
  });

  describe('zustandBiomarkerRepository', () => {
    it('satisfies BiomarkerRepository port', async () => {
      const { createZustandBiomarkerRepository } = await import('./zustandBiomarkerRepository');
      const repo: BiomarkerRepository = createZustandBiomarkerRepository();

      expect(repo).toBeDefined();
      expect(typeof repo.getGlucoseHistory).toBe('function');
      expect(typeof repo.getWeightHistory).toBe('function');
      expect(typeof repo.getTrend).toBe('function');
      expect(typeof repo.recordGlucose).toBe('function');
      expect(typeof repo.recordWeight).toBe('function');
      expect(typeof repo.detectIMCThresholdCrossing).toBe('function');
    });
  });

  describe('zustandPlanRepository', () => {
    it('satisfies PlanRepository port', async () => {
      const { createZustandPlanRepository } = await import('./zustandPlanRepository');
      const repo: PlanRepository = createZustandPlanRepository();

      expect(repo).toBeDefined();
      expect(typeof repo.getPlan).toBe('function');
      expect(typeof repo.generatePlan).toBe('function');
    });
  });
});
