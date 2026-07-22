import { describe, it, expect } from 'vitest';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from './glycemicFruits';

describe('HIGH_GLYCEMIC_FRUIT_NAMES', () => {
  it('contains all 5 high-glycemic fruits per INFORME_ADR §2 and SPECS_TECH §4', () => {
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('uvas')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('dátiles')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('higos')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('uvas pasas')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('plátano maduro')).toBe(true);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.size).toBe(5);
  });

  it('does not contain low-glycemic fruits', () => {
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('manzana')).toBe(false);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('pera')).toBe(false);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('naranja')).toBe(false);
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('fresas')).toBe(false);
  });

  it('values are all lowercase for case-insensitive matching', () => {
    for (const name of HIGH_GLYCEMIC_FRUIT_NAMES) {
      expect(name).toBe(name.toLowerCase());
    }
  });

  it('matches actual food catalog entries via normalized lookup', () => {
    // The food catalog uses capitalized names (e.g., 'Uvas')
    // Consumers MUST call food.name.toLowerCase() before membership check
    const catalogName = 'Uvas';
    expect(HIGH_GLYCEMIC_FRUIT_NAMES.has(catalogName.toLowerCase())).toBe(true);
  });
});
