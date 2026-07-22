import { describe, it, expect } from 'vitest';
import { checkSafetyAlerts } from './safetyCheck';
import { makeFood } from '@/test/fixtures';
import { FoodCategory } from '@shared/domain';

describe('checkSafetyAlerts', () => {
  it('returns empty for regular food', () => {
    const food = makeFood({ name: 'Manzana', category: FoodCategory.FRUITS });
    expect(checkSafetyAlerts(food)).toEqual([]);
  });

  it('returns warning for high glycemic fruit (uvas)', () => {
    const food = makeFood({ name: 'Uvas', category: FoodCategory.FRUITS });
    const alerts = checkSafetyAlerts(food);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('warning');
    expect(alerts[0].code).toBe('HIGH_GLYCEMIC_FRUIT');
    expect(alerts[0].acknowledgeRequired).toBe(true);
  });

  it('returns warning for dátiles', () => {
    const food = makeFood({ name: 'Dátiles', category: FoodCategory.FRUITS });
    expect(checkSafetyAlerts(food)).toHaveLength(1);
  });

  it('returns warning for higos', () => {
    const food = makeFood({ name: 'Higos', category: FoodCategory.FRUITS });
    expect(checkSafetyAlerts(food)).toHaveLength(1);
  });

  it('matches case-insensitively', () => {
    const food = makeFood({ name: 'UVAS', category: FoodCategory.FRUITS });
    expect(checkSafetyAlerts(food)).toHaveLength(1);
  });

  it('ignores non-fruit high-glycemic foods', () => {
    const food = makeFood({ name: 'Pan integral', category: FoodCategory.CEREALS });
    expect(checkSafetyAlerts(food)).toEqual([]);
  });
});
