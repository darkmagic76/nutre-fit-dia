import { describe, it, expect } from 'vitest';
import { computeIMC, isRestrictionCandidate } from './imc';

describe('computeIMC', () => {
  it('computes IMC correctly (80kg, 170cm)', () => {
    expect(computeIMC(80, 170)).toBe(27.7);
  });

  it('returns normal IMC for healthy weight', () => {
    const imc = computeIMC(65, 170);
    expect(imc).toBeGreaterThanOrEqual(22);
    expect(imc).toBeLessThanOrEqual(23);
  });

  it('rounds to one decimal place', () => {
    const imc = computeIMC(70, 175);
    const decimalPart = imc.toString().split('.')[1];
    expect(decimalPart?.length).toBeLessThanOrEqual(1);
  });
});

describe('isRestrictionCandidate', () => {
  it('returns true for IMC > 25', () => {
    expect(isRestrictionCandidate(27.7)).toBe(true);
  });

  it('returns false for IMC = 25', () => {
    expect(isRestrictionCandidate(25)).toBe(false);
  });

  it('returns false for IMC < 25', () => {
    expect(isRestrictionCandidate(22)).toBe(false);
  });
});
