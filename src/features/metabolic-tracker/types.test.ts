import { describe, it, expect } from 'vitest';
import { GlucoseInput } from './types';

describe('GlucoseInput', () => {
  it('returns the value for valid positive input', () => {
    const result = GlucoseInput(95);
    expect(result).toBe(95);
  });

  it('clamps non-positive values to 0', () => {
    const result = GlucoseInput(0);
    expect(result).toBe(0);
  });

  it('clamps negative values to 0', () => {
    const result = GlucoseInput(-10);
    expect(result).toBe(0);
  });

  it('clamps NaN to 0', () => {
    const result = GlucoseInput(NaN);
    expect(result).toBe(0);
  });

  it('preserves high glucose values (e.g., 300 mg/dL)', () => {
    const result = GlucoseInput(300);
    expect(result).toBe(300);
  });

  it('accepts typical fasting glucose (85 mg/dL)', () => {
    const result = GlucoseInput(85);
    expect(result).toBe(85);
  });
});
