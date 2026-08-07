import { describe, it, expect, beforeEach } from 'vitest';

// ── Adapters ────────────────────────────────────────────────────────────────
import { createZustandNotificationRepository } from './zustandNotificationRepository';
import { createZustandActivityRepository } from './zustandActivityRepository';
import { createZustandLogRepository } from './zustandLogRepository';
import { createZustandBiomarkerRepository } from './zustandBiomarkerRepository';
import { createZustandPlanRepository } from './zustandPlanRepository';

// ── Stores ──────────────────────────────────────────────────────────────────
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { usePlanStore } from '@infrastructure/stores/planStore';

// ── Types ───────────────────────────────────────────────────────────────────
import type { Food } from '@domain/index';

const makeFood = (overrides: Partial<Food> = {}): Food => ({
  id: 'test-food',
  nameEn: 'Test Food',
  nameEs: 'Comida Test',
  category: 'vegetables' as Food['category'],
  kcalPer100g: 50,
  gramsPerRation: 100,
  isProcessed: false,
  ...overrides,
});

describe('Zustand adapter runtime tests', () => {
  // ─── NotificationRepository ───────────────────────────────────────────────
  describe('zustandNotificationRepository', () => {
    beforeEach(() => {
      useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
    });

    it('enqueue adds a notification to pending', () => {
      const repo = createZustandNotificationRepository();
      const notification = {
        id: 'n1',
        type: 'behavioral_nudge' as const,
        severity: 'info' as const,
        title: 'Test',
        body: 'Test body',
        ruleSource: 'TEST_RULE',
        timestamp: 1,
      };

      repo.enqueue(notification);
      expect(useNudgeStore.getState().pending).toHaveLength(1);
      expect(useNudgeStore.getState().pending[0].id).toBe('n1');
    });

    it('getPending returns current pending notifications', () => {
      const repo = createZustandNotificationRepository();
      useNudgeStore.setState({
        pending: [
          {
            id: 'n1',
            type: 'behavioral_nudge',
            severity: 'info',
            title: 'T',
            body: 'B',
            ruleSource: 'R',
            timestamp: 1,
          },
        ],
      });

      expect(repo.getPending()).toHaveLength(1);
      expect(repo.getPending()[0].id).toBe('n1');
    });

    it('acknowledge moves notification from pending to history', () => {
      const repo = createZustandNotificationRepository();
      useNudgeStore.setState({
        pending: [
          {
            id: 'n1',
            type: 'behavioral_nudge',
            severity: 'info',
            title: 'T',
            body: 'B',
            ruleSource: 'R',
            timestamp: 1,
          },
        ],
        history: [],
      });
      repo.acknowledge('n1');
      expect(useNudgeStore.getState().pending).toHaveLength(0);
    });

    it('dismiss removes notification from pending', () => {
      const repo = createZustandNotificationRepository();
      useNudgeStore.setState({
        pending: [
          {
            id: 'n1',
            type: 'behavioral_nudge',
            severity: 'info',
            title: 'T',
            body: 'B',
            ruleSource: 'R',
            timestamp: 1,
          },
        ],
      });
      repo.dismiss('n1');
      expect(useNudgeStore.getState().pending).toHaveLength(0);
    });

    it('registerCooldown and getCooldowns work together', () => {
      const repo = createZustandNotificationRepository();
      repo.registerCooldown('rule-1', 1000);
      expect(repo.getCooldowns()).toHaveProperty('rule-1', 1000);
    });

    it('resetCooldown clears a specific cooldown', () => {
      const repo = createZustandNotificationRepository();
      repo.registerCooldown('rule-1', 1000);
      repo.resetCooldown('rule-1');
      expect(repo.getCooldowns()).not.toHaveProperty('rule-1');
    });

    it('getHistory returns notification history', () => {
      const repo = createZustandNotificationRepository();
      useNudgeStore.setState({
        history: [
          {
            id: 'h1',
            type: 'behavioral_nudge',
            severity: 'info',
            title: 'T',
            body: 'B',
            ruleSource: 'R',
            timestamp: 1,
            acknowledgedAt: new Date(),
          },
        ],
      });
      expect(repo.getHistory()).toHaveLength(1);
    });
  });

  // ─── ActivityRepository ───────────────────────────────────────────────────
  describe('zustandActivityRepository', () => {
    beforeEach(() => {
      useActivityStore.setState({ weeklyMinutes: 0, strengthSessions: 0, entries: [], streak: 0 });
    });

    it('getWeeklyMinutes returns store value', () => {
      const repo = createZustandActivityRepository();
      useActivityStore.setState({ weeklyMinutes: 150 });
      expect(repo.getWeeklyMinutes()).toBe(150);
    });

    it('getStrengthSessions returns store value', () => {
      const repo = createZustandActivityRepository();
      useActivityStore.setState({ strengthSessions: 2 });
      expect(repo.getStrengthSessions()).toBe(2);
    });

    it('addEntry adds to entries', () => {
      const repo = createZustandActivityRepository();
      repo.addEntry({ minutes: 30, date: '2026-08-06', type: 'cardio' });
      expect(repo.getEntries()).toHaveLength(1);
    });

    it('getStreak returns streak value', () => {
      const repo = createZustandActivityRepository();
      useActivityStore.setState({ streak: 5 });
      expect(repo.getStreak()).toBe(5);
    });
  });

  // ─── LogRepository ────────────────────────────────────────────────────────
  describe('zustandLogRepository', () => {
    beforeEach(() => {
      useLogStore.setState({ todayLog: [], todayValidation: null });
    });

    it('addFood adds food to todayLog', () => {
      const repo = createZustandLogRepository();
      const food = makeFood();
      repo.addFood(food);
      expect(repo.getTodayLog()).toHaveLength(1);
    });

    it('getTodayLog returns empty array initially', () => {
      const repo = createZustandLogRepository();
      expect(repo.getTodayLog()).toEqual([]);
    });

    it('removeFood removes by index', () => {
      const repo = createZustandLogRepository();
      repo.addFood(makeFood({ id: 'a' }));
      repo.addFood(makeFood({ id: 'b' }));
      repo.removeFood(0);
      expect(repo.getTodayLog()).toHaveLength(1);
      expect(repo.getTodayLog()[0].id).toBe('b');
    });

    it('clearLog empties the log', () => {
      const repo = createZustandLogRepository();
      repo.addFood(makeFood());
      repo.clearLog();
      expect(repo.getTodayLog()).toHaveLength(0);
    });
  });

  // ─── BiomarkerRepository ──────────────────────────────────────────────────
  describe('zustandBiomarkerRepository', () => {
    beforeEach(() => {
      useBiomarkerStore.setState({
        glucoseHistory: [],
        weightHistory: [],
        lastIMC: null,
      });
    });

    it('recordGlucose adds a glucose reading', () => {
      const repo = createZustandBiomarkerRepository();
      repo.recordGlucose({ value: 100, timestamp: Date.now(), context: 'fasting' });
      expect(repo.getGlucoseHistory()).toHaveLength(1);
    });

    it('recordWeight adds a weight reading', () => {
      const repo = createZustandBiomarkerRepository();
      repo.recordWeight(70, 175);
      expect(repo.getWeightHistory()).toHaveLength(1);
    });

    it('getGlucoseHistory returns empty initially', () => {
      const repo = createZustandBiomarkerRepository();
      expect(repo.getGlucoseHistory()).toEqual([]);
    });

    it('getTrend returns trend object', () => {
      const repo = createZustandBiomarkerRepository();
      const trend = repo.getTrend();
      expect(trend).toBeDefined();
      expect(trend).toHaveProperty('glucoseAvg7d');
    });

    it('detectIMCThresholdCrossing returns null with no history', () => {
      const repo = createZustandBiomarkerRepository();
      expect(repo.detectIMCThresholdCrossing()).toBeNull();
    });
  });

  // ─── PlanRepository ───────────────────────────────────────────────────────
  describe('zustandPlanRepository', () => {
    beforeEach(() => {
      usePlanStore.setState({ weeklyPlan: null });
    });

    it('getPlan returns null initially', () => {
      const repo = createZustandPlanRepository();
      expect(repo.getPlan()).toBeNull();
    });

    it('generatePlan creates a plan', () => {
      const repo = createZustandPlanRepository();
      expect(() => repo.generatePlan()).not.toThrow();
    });
  });
});
