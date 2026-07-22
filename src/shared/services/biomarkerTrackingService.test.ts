import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordWeight,
  recordGlucose,
  getTrend,
  detectIMCThresholdCrossing,
  resetBiomarkerHistory,
} from './biomarkerTrackingService';

describe('biomarkerTrackingService', () => {
  beforeEach(() => {
    resetBiomarkerHistory();
  });

  describe('recordWeight', () => {
    it('records a weight reading with computed IMC', () => {
      const reading = recordWeight(80, 170);
      expect(reading.value).toBe(80);
      expect(reading.imc).toBe(27.7);
      expect(reading.timestamp).toBeGreaterThan(0);
    });
  });

  describe('recordGlucose', () => {
    it('records a glucose reading', () => {
      recordGlucose({ value: 120, timestamp: Date.now(), context: 'fasting' });
      recordGlucose({ value: 140, timestamp: Date.now(), context: 'postprandial' });
      const trend = getTrend();
      expect(trend.glucoseLatest!.value).toBe(140);
      expect(trend.glucoseLatest!.context).toBe('postprandial');
    });
  });

  describe('getTrend', () => {
    it('returns nulls when no readings', () => {
      const trend = getTrend();
      expect(trend.glucoseAvg7d).toBeNull();
      expect(trend.glucoseLatest).toBeNull();
      expect(trend.weightAvg7d).toBeNull();
      expect(trend.weightLatest).toBeNull();
      expect(trend.weightTrend).toBeNull();
    });

    it('computes 7-day glucose average', () => {
      const now = Date.now();
      recordGlucose({ value: 100, timestamp: now - 1000, context: 'fasting' });
      recordGlucose({ value: 140, timestamp: now - 1000, context: 'postprandial' });
      expect(getTrend().glucoseAvg7d).toBe(120);
    });

    it('returns null glucose avg with < 2 readings', () => {
      recordGlucose({ value: 100, timestamp: Date.now(), context: 'fasting' });
      expect(getTrend().glucoseAvg7d).toBeNull();
    });

    it('computes 7-day weight average', () => {
      recordWeight(80, 170);
      recordWeight(82, 170);
      expect(getTrend().weightAvg7d).toBe(81);
    });
  });

  describe('detectIMCThresholdCrossing', () => {
    it('returns null with < 2 readings', () => {
      recordWeight(80, 170); // IMC 27.7
      expect(detectIMCThresholdCrossing()).toBeNull();
    });

    it('detects IMC crossing above 25', () => {
      recordWeight(70, 170); // IMC 24.2
      recordWeight(80, 170); // IMC 27.7
      expect(detectIMCThresholdCrossing()).toBe('crossed_above');
    });

    it('detects IMC crossing below 25', () => {
      recordWeight(80, 170); // IMC 27.7
      recordWeight(70, 170); // IMC 24.2
      expect(detectIMCThresholdCrossing()).toBe('crossed_below');
    });

    it('returns null when no crossing', () => {
      recordWeight(80, 170); // IMC 27.7
      recordWeight(85, 170); // IMC 29.4
      expect(detectIMCThresholdCrossing()).toBeNull();
    });
  });
});
