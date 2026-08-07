import { describe, it, expect, beforeEach } from 'vitest';
import { createContainer, container } from './compositionRoot';

// Reset stores before each test
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { usePlanStore } from '@infrastructure/stores/planStore';

describe('compositionRoot', () => {
  beforeEach(() => {
    useTrackerStore.setState({
      weight: '',
      height: '',
      age: '',
      diagnosisAge: '',
      gender: 'male',
      paf: '',
      glucose: '',
      glucoseContext: 'fasting',
      caloricTarget: null,
      caloricRestrictionActive: false,
      profileError: null,
    });
    useLogStore.setState({ todayLog: [], todayValidation: null });
    useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
    useActivityStore.setState({ weeklyMinutes: 0, strengthSessions: 0, entries: [], streak: 0 });
    useBiomarkerStore.setState({ glucoseHistory: [], weightHistory: [], lastIMC: null });
    usePlanStore.setState({ weeklyPlan: null });
  });

  describe('createContainer', () => {
    it('returns an object with all use cases', () => {
      const c = createContainer();
      expect(c).toHaveProperty('calculateTarget');
      expect(c).toHaveProperty('evaluateNudges');
      expect(c).toHaveProperty('exportData');
      expect(typeof c.calculateTarget).toBe('function');
      expect(typeof c.evaluateNudges).toBe('function');
      expect(typeof c.exportData).toBe('function');
    });

    it('returns an object with all adapter repos', () => {
      const c = createContainer();
      expect(c).toHaveProperty('notificationRepo');
      expect(c).toHaveProperty('activityRepo');
      expect(c).toHaveProperty('logRepo');
      expect(c).toHaveProperty('biomarkerRepo');
      expect(c).toHaveProperty('planRepo');
    });

    it('exportData returns a JSON string', () => {
      const c = createContainer();
      const result = c.exportData();
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('calculateTarget is callable', () => {
      const c = createContainer();
      const result = c.calculateTarget(
        {
          weight: '70',
          height: '175',
          age: '40',
          diagnosisAge: '35',
          gender: 'male',
          paf: '1.55',
          glucose: '90',
          glucoseContext: 'fasting',
        },
        {} as Record<string, string>,
      );
      expect(result).toHaveProperty('caloricTarget');
      expect(result).toHaveProperty('caloricRestrictionActive');
      expect(result).toHaveProperty('profileError');
    });

    it('evaluateNudges is callable', () => {
      const c = createContainer();
      expect(() =>
        c.evaluateNudges({
          caloricRestrictionActive: false,
          todayLog: [],
          weeklyMinutes: 0,
          trends: {
            glucoseAvg7d: null,
            glucoseTrend: 'stable',
            weightTrend: 'stable',
            weightAvg30d: null,
            latestGlucose: null,
            latestWeight: null,
          },
        }),
      ).not.toThrow();
    });

    it('each call to createContainer returns a fresh instance', () => {
      const c1 = createContainer();
      const c2 = createContainer();
      expect(c1).not.toBe(c2);
    });
  });

  describe('container singleton', () => {
    it('is defined and has use cases', () => {
      expect(container).toBeDefined();
      expect(typeof container.calculateTarget).toBe('function');
      expect(typeof container.evaluateNudges).toBe('function');
      expect(typeof container.exportData).toBe('function');
    });

    it('is the same instance on repeated access', () => {
      expect(container).toBe(container);
    });
  });
});
