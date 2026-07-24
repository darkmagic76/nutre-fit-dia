import { describe, it, expect } from 'vitest';
import { formatViolation, formatSafetyAlert } from './formatViolation';
import { en } from '@shared/i18n/en';
import { es } from '@shared/i18n/es';
import { FoodCategory } from '@shared/domain';
import type { RationViolation, SafetyAlert } from '@shared/services/rationValidator';

function makeViolation(overrides: Partial<RationViolation> = {}): RationViolation {
  return {
    category: FoodCategory.CEREALS as RationViolation['category'],
    current: 5,
    limit: 4,
    direction: 'over',
    unit: 'day',
    ...overrides,
  };
}

function makeAlert(overrides: Partial<SafetyAlert> = {}): SafetyAlert {
  return {
    severity: 'warning',
    code: 'PORTION_TOO_SMALL',
    message: '',
    category: FoodCategory.CEREALS as FoodCategory as SafetyAlert['category'],
    acknowledgeRequired: false,
    foodName: 'Pan',
    actualGrams: 30,
    standardMin: 40,
    standardMax: 60,
    ...overrides,
  };
}

// ─── formatViolation ──────────────────────────────────────────────────────

describe('formatViolation', () => {
  describe('English locale', () => {
    it('formats over/day violation with category and numerical details', () => {
      const v = makeViolation({
        category: FoodCategory.CEREALS as RationViolation['category'],
        current: 5,
        limit: 4,
        direction: 'over',
        unit: 'day',
      });

      const result = formatViolation(en, v);

      expect(result).toBe('Cereals: 5 servings (max 4/day)');
    });

    it('formats under/day violation', () => {
      const v = makeViolation({
        category: FoodCategory.VEGETABLES as RationViolation['category'],
        current: 2,
        limit: 3,
        direction: 'under',
        unit: 'day',
      });

      const result = formatViolation(en, v);

      expect(result).toBe('Vegetables: 2 servings (min 3/day)');
    });

    it('formats over/week violation', () => {
      const v = makeViolation({
        category: FoodCategory.FISH as RationViolation['category'],
        current: 8,
        limit: 7,
        direction: 'over',
        unit: 'week',
      });

      const result = formatViolation(en, v);

      expect(result).toBe('Fish: 8 servings (max 7/week)');
    });

    it('formats under/week violation', () => {
      const v = makeViolation({
        category: FoodCategory.LEGUMES as RationViolation['category'],
        current: 2,
        limit: 4,
        direction: 'under',
        unit: 'week',
      });

      const result = formatViolation(en, v);

      expect(result).toBe('Legumes: 2 servings (min 4/week)');
    });

    it('uses messageKey for cross-category violations (whiteMeatFish)', () => {
      const v = makeViolation({
        category: FoodCategory.WHITE_MEAT as RationViolation['category'],
        current: 1,
        limit: 0,
        direction: 'over',
        unit: 'week',
        messageKey: 'validation.crossRule.whiteMeatFish',
      });

      const result = formatViolation(en, v);

      expect(result).toBe('White Meat: restrict if fish rations exceeded');
    });
  });

  describe('Spanish locale', () => {
    it('formats over/day violation', () => {
      const v = makeViolation({
        category: FoodCategory.CEREALS as RationViolation['category'],
        current: 5,
        limit: 4,
        direction: 'over',
        unit: 'day',
      });

      const result = formatViolation(es, v);

      expect(result).toBe('Cereales: 5 raciones (máx 4/día)');
    });

    it('formats under/day violation', () => {
      const v = makeViolation({
        category: FoodCategory.VEGETABLES as RationViolation['category'],
        current: 2,
        limit: 3,
        direction: 'under',
        unit: 'day',
      });

      const result = formatViolation(es, v);

      expect(result).toBe('Hortalizas: 2 raciones (mín 3/día)');
    });

    it('formats over/week violation', () => {
      const v = makeViolation({
        category: FoodCategory.EGGS as RationViolation['category'],
        current: 5,
        limit: 4,
        direction: 'over',
        unit: 'week',
      });

      const result = formatViolation(es, v);

      expect(result).toBe('Huevos: 5 raciones (máx 4/semana)');
    });

    it('formats under/week violation', () => {
      const v = makeViolation({
        category: FoodCategory.FISH as RationViolation['category'],
        current: 1,
        limit: 3,
        direction: 'under',
        unit: 'week',
      });

      const result = formatViolation(es, v);

      expect(result).toBe('Pescado: 1 raciones (mín 3/semana)');
    });

    it('uses messageKey for cross-category (whiteMeatFish) in Spanish', () => {
      const v = makeViolation({
        category: FoodCategory.WHITE_MEAT as RationViolation['category'],
        current: 1,
        limit: 0,
        direction: 'over',
        unit: 'week',
        messageKey: 'validation.crossRule.whiteMeatFish',
      });

      const result = formatViolation(es, v);

      expect(result).toBe('Carnes blancas: restringir si se han superado raciones de pescado');
    });
  });
});

// ─── formatSafetyAlert ────────────────────────────────────────────────────

describe('formatSafetyAlert', () => {
  describe('English locale', () => {
    it('formats PORTION_TOO_SMALL alert', () => {
      const alert = makeAlert({
        code: 'PORTION_TOO_SMALL',
        foodName: 'Apple',
        actualGrams: 30,
        standardMin: 150,
      });

      const result = formatSafetyAlert(en, alert);

      expect(result).toBe('Apple: 30g (min 150g/ration AESAN 2022)');
    });

    it('formats PORTION_TOO_LARGE alert', () => {
      const alert = makeAlert({
        code: 'PORTION_TOO_LARGE',
        foodName: 'Fish fillet',
        actualGrams: 300,
        standardMax: 200,
      });

      const result = formatSafetyAlert(en, alert);

      expect(result).toBe('Fish fillet: 300g (max 200g/ration AESAN 2022)');
    });

    it('formats HIGH_GLYCEMIC_FRUIT alert', () => {
      const alert = makeAlert({
        code: 'HIGH_GLYCEMIC_FRUIT',
        foodName: 'Grapes',
        category: FoodCategory.FRUITS as SafetyAlert['category'],
      });

      const result = formatSafetyAlert(en, alert);

      expect(result).toBe('Grapes: high glycemic fruit — consume in moderation');
    });

    it('falls back to alert.message for unknown codes', () => {
      const alert = makeAlert({
        code: 'UNKNOWN_CODE',
        message: 'Raw message fallback',
      });

      const result = formatSafetyAlert(en, alert);

      expect(result).toBe('Raw message fallback');
    });
  });

  describe('Spanish locale', () => {
    it('formats PORTION_TOO_SMALL alert', () => {
      const alert = makeAlert({
        code: 'PORTION_TOO_SMALL',
        foodName: 'Manzana',
        actualGrams: 30,
        standardMin: 150,
      });

      const result = formatSafetyAlert(es, alert);

      expect(result).toBe('Manzana: 30g (mín 150g/ración AESAN 2022)');
    });

    it('formats PORTION_TOO_LARGE alert', () => {
      const alert = makeAlert({
        code: 'PORTION_TOO_LARGE',
        foodName: 'Filete de pescado',
        actualGrams: 300,
        standardMax: 200,
      });

      const result = formatSafetyAlert(es, alert);

      expect(result).toBe('Filete de pescado: 300g (máx 200g/ración AESAN 2022)');
    });

    it('formats HIGH_GLYCEMIC_FRUIT alert in Spanish', () => {
      const alert = makeAlert({
        code: 'HIGH_GLYCEMIC_FRUIT',
        foodName: 'Uvas',
        category: FoodCategory.FRUITS as SafetyAlert['category'],
      });

      const result = formatSafetyAlert(es, alert);

      expect(result).toBe('Uvas: fruta de alta carga glucémica — consumir con moderación');
    });
  });
});
