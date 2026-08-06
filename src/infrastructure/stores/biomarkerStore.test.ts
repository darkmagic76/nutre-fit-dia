import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLocalStorage } from '@/test/test-helpers';

describe('biomarkerStore', () => {
  let useBiomarkerStore: typeof import('./biomarkerStore').useBiomarkerStore;

  beforeEach(async () => {
    const storage = createLocalStorage();
    vi.stubGlobal('localStorage', storage);
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    const mod = await import('./biomarkerStore');
    useBiomarkerStore = mod.useBiomarkerStore;
    useBiomarkerStore.persist.clearStorage();
    useBiomarkerStore.setState({ glucoseHistory: [], weightHistory: [] });
  });

  describe('initial state', () => {
    it('has empty glucoseHistory and weightHistory', () => {
      const { glucoseHistory, weightHistory } = useBiomarkerStore.getState();
      expect(glucoseHistory).toEqual([]);
      expect(weightHistory).toEqual([]);
    });
  });

  describe('recordGlucose', () => {
    it('pushes a glucose reading to glucoseHistory', () => {
      const reading = { value: 120, timestamp: Date.now(), context: 'fasting' as const };
      useBiomarkerStore.getState().recordGlucose(reading);
      const { glucoseHistory } = useBiomarkerStore.getState();
      expect(glucoseHistory).toHaveLength(1);
      expect(glucoseHistory[0]).toEqual(reading);
    });

    it('appends multiple readings in order', () => {
      const r1 = { value: 100, timestamp: 1000, context: 'fasting' as const };
      const r2 = { value: 140, timestamp: 2000, context: 'postprandial' as const };
      useBiomarkerStore.getState().recordGlucose(r1);
      useBiomarkerStore.getState().recordGlucose(r2);
      const { glucoseHistory } = useBiomarkerStore.getState();
      expect(glucoseHistory).toHaveLength(2);
      expect(glucoseHistory[0].value).toBe(100);
      expect(glucoseHistory[1].value).toBe(140);
    });
  });

  describe('recordWeight', () => {
    it('records a weight reading with computed IMC', () => {
      const reading = useBiomarkerStore.getState().recordWeight(80, 170);
      expect(reading.value).toBe(80);
      expect(reading.imc).toBe(27.7);
      expect(reading.timestamp).toBeGreaterThan(0);

      const { weightHistory } = useBiomarkerStore.getState();
      expect(weightHistory).toHaveLength(1);
      expect(weightHistory[0]).toEqual(reading);
    });
  });

  describe('getTrend', () => {
    it('returns nulls when no readings', () => {
      const trend = useBiomarkerStore.getState().getTrend();
      expect(trend.glucoseAvg7d).toBeNull();
      expect(trend.glucoseLatest).toBeNull();
      expect(trend.weightAvg7d).toBeNull();
      expect(trend.weightLatest).toBeNull();
      expect(trend.weightTrend).toBeNull();
    });

    it('computes 7-day glucose average with >= 2 readings', () => {
      const now = Date.now();
      useBiomarkerStore
        .getState()
        .recordGlucose({ value: 100, timestamp: now - 1000, context: 'fasting' });
      useBiomarkerStore
        .getState()
        .recordGlucose({ value: 140, timestamp: now - 1000, context: 'postprandial' });
      expect(useBiomarkerStore.getState().getTrend().glucoseAvg7d).toBe(120);
    });

    it('returns null glucose avg with < 2 readings', () => {
      useBiomarkerStore
        .getState()
        .recordGlucose({ value: 100, timestamp: Date.now(), context: 'fasting' });
      expect(useBiomarkerStore.getState().getTrend().glucoseAvg7d).toBeNull();
    });

    it('computes 7-day weight average', () => {
      useBiomarkerStore.getState().recordWeight(80, 170);
      useBiomarkerStore.getState().recordWeight(82, 170);
      expect(useBiomarkerStore.getState().getTrend().weightAvg7d).toBe(81);
    });

    it('returns null for old readings outside 7-day window', () => {
      const oldTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days ago
      useBiomarkerStore
        .getState()
        .recordGlucose({ value: 100, timestamp: oldTimestamp, context: 'fasting' });
      useBiomarkerStore
        .getState()
        .recordGlucose({ value: 140, timestamp: oldTimestamp, context: 'postprandial' });
      expect(useBiomarkerStore.getState().getTrend().glucoseAvg7d).toBeNull();
    });
  });

  describe('detectIMCThresholdCrossing', () => {
    it('returns null with < 2 readings', () => {
      useBiomarkerStore.getState().recordWeight(80, 170); // IMC 27.7
      expect(useBiomarkerStore.getState().detectIMCThresholdCrossing()).toBeNull();
    });

    it('detects IMC crossing above 25', () => {
      useBiomarkerStore.getState().recordWeight(70, 170); // IMC 24.2
      useBiomarkerStore.getState().recordWeight(80, 170); // IMC 27.7
      expect(useBiomarkerStore.getState().detectIMCThresholdCrossing()).toBe('crossed_above');
    });

    it('detects IMC crossing below 25', () => {
      useBiomarkerStore.getState().recordWeight(80, 170); // IMC 27.7
      useBiomarkerStore.getState().recordWeight(70, 170); // IMC 24.2
      expect(useBiomarkerStore.getState().detectIMCThresholdCrossing()).toBe('crossed_below');
    });

    it('returns null when no crossing', () => {
      useBiomarkerStore.getState().recordWeight(80, 170); // IMC 27.7
      useBiomarkerStore.getState().recordWeight(85, 170); // IMC 29.4
      expect(useBiomarkerStore.getState().detectIMCThresholdCrossing()).toBeNull();
    });
  });

  describe('resetBiomarkerHistory', () => {
    it('clears both glucoseHistory and weightHistory', () => {
      useBiomarkerStore
        .getState()
        .recordGlucose({ value: 120, timestamp: Date.now(), context: 'fasting' });
      useBiomarkerStore
        .getState()
        .recordGlucose({ value: 140, timestamp: Date.now(), context: 'postprandial' });
      useBiomarkerStore.getState().recordWeight(80, 170);
      useBiomarkerStore.getState().recordWeight(82, 170);

      useBiomarkerStore.getState().resetBiomarkerHistory();

      const { glucoseHistory, weightHistory } = useBiomarkerStore.getState();
      expect(glucoseHistory).toEqual([]);
      expect(weightHistory).toEqual([]);
    });
  });
});

describe('onRehydrateStorage', () => {
  it('resets to defaults when stored data fails schema validation', async () => {
    const storage = createLocalStorage();
    vi.stubGlobal('localStorage', storage);
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    storage.setItem(
      'nutrefitdia-biomarker',
      JSON.stringify({ state: { glucoseHistory: 'bad' }, version: 0 }),
    );
    const mod = await import('./biomarkerStore');
    const state = mod.useBiomarkerStore.getState();
    expect(state.glucoseHistory).toEqual([]);
    expect(state.weightHistory).toEqual([]);
  });
});
