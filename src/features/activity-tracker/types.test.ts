import { describe, it, expect } from 'vitest';
import { ModerateMinutes } from './types';

describe('ModerateMinutes', () => {
  it('returns the value for valid positive input', () => {
    const result = ModerateMinutes(30);
    expect(result).toBe(30);
  });

  it('clamps negative values to 0 (min ≥ 0 validation)', () => {
    const result = ModerateMinutes(-5);
    expect(result).toBe(0);
  });

  it('clamps NaN to 0', () => {
    const result = ModerateMinutes(NaN);
    expect(result).toBe(0);
  });

  it('accepts 0 at boundary', () => {
    const result = ModerateMinutes(0);
    expect(result).toBe(0);
  });

  it('preserves large values', () => {
    const result = ModerateMinutes(500);
    expect(result).toBe(500);
  });
});
