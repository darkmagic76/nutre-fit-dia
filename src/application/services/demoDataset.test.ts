import { describe, it, expect } from 'vitest';
import { foodsById } from '@shared/data/foods';
import { DEMO_ENTRY_IDS, DEMO_METRICS_INPUT, DEMO_TRIGGER_FOOD_ID } from './demoDataset';

/**
 * The demo dataset is production data, independent from `src/test/fixtures.ts`.
 * These assertions pin it: changing a unit-test fixture MUST NOT move what the
 * guided demo shows (spec: no fixture leakage).
 */
describe('demoDataset', () => {
  it('keeps the glucose walk value the tour renders', () => {
    expect(DEMO_METRICS_INPUT.glucose).toBe('100');
    expect(DEMO_METRICS_INPUT.glucoseContext).toBe('fasting');
  });

  it('pins the seeded daily-log entries', () => {
    expect(DEMO_ENTRY_IDS).toEqual(['oil-aove', 'proc-refresco-cola']);
  });

  it('pins the substitution trigger food', () => {
    expect(DEMO_TRIGGER_FOOD_ID).toBe('meat-ternera');
  });

  it('resolves every pinned id in the shared catalog', () => {
    const ids = [...DEMO_ENTRY_IDS, DEMO_TRIGGER_FOOD_ID];

    expect(ids.filter((id) => !foodsById.has(id))).toEqual([]);
  });
});
