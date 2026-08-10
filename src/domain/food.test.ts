import { describe, it, expect } from 'vitest';
import { food, FoodSchema } from './index';
import { foodsById } from '@shared/data/foods';

describe('FoodSchema zero-waste defaults', () => {
  it('defaults isUglyProduce and isZeroWaste to false when omitted', () => {
    const result = FoodSchema.parse({
      id: 'test-food',
      name: 'Test Food',
      category: 'vegetables',
      gramsPerRation: 100,
      kcalPer100g: 50,
      proteinPer100g: 2,
      carbsPer100g: 10,
      fatPer100g: 0.5,
    });
    expect(result.isUglyProduce).toBe(false);
    expect(result.isZeroWaste).toBe(false);
  });

  it('preserves explicit isUglyProduce=true and isZeroWaste=true via food() factory', () => {
    const result = food({
      id: 'test-ugly-zw',
      name: 'Test Ugly Zero Waste',
      category: 'vegetables',
      gramsPerRation: 100,
      kcalPer100g: 50,
      proteinPer100g: 2,
      carbsPer100g: 10,
      fatPer100g: 0.5,
      isUglyProduce: true,
      isZeroWaste: true,
    });
    expect(result.isUglyProduce).toBe(true);
    expect(result.isZeroWaste).toBe(true);
  });
});

describe('Dataset integrity: zero-waste tagged foods', () => {
  const ZERO_WASTE_IDS = [
    'veg-espinaca',
    'veg-brocoli',
    'veg-tomate',
    'fruit-manzana',
    'fruit-pera',
    'legume-lentejas',
    'legume-garbanzos',
  ];

  for (const id of ZERO_WASTE_IDS) {
    it(`${id} has isZeroWaste=true`, () => {
      const item = foodsById.get(id);
      expect(item, `${id} should exist`).toBeDefined();
      expect(item!.isZeroWaste, `${id}.isZeroWaste`).toBe(true);
    });
  }

  it('non-zero-waste foods have isZeroWaste=false', () => {
    const chorizo = foodsById.get('proc-embutido-chorizo')!;
    expect(chorizo.isZeroWaste).toBe(false);
    const salmon = foodsById.get('fish-salmon')!;
    expect(salmon.isZeroWaste).toBe(false);
  });
});

describe('FoodSchema isHighPriority', () => {
  it('defaults isHighPriority to false when omitted', () => {
    const result = FoodSchema.parse({
      id: 'test-food',
      name: 'Test Food',
      category: 'vegetables',
      gramsPerRation: 100,
      kcalPer100g: 50,
      proteinPer100g: 2,
      carbsPer100g: 10,
      fatPer100g: 0.5,
    });
    expect(result.isHighPriority).toBe(false);
  });
});

describe('FoodCategory NUTS (AESAN 2022: frutos secos)', () => {
  it('accepts "nuts" as a valid category in FoodSchema', () => {
    const result = FoodSchema.parse({
      id: 'test-almonds',
      name: 'Almendras crudas',
      category: 'nuts',
      gramsPerRation: 25,
      kcalPer100g: 575,
      proteinPer100g: 21,
      carbsPer100g: 22,
      fatPer100g: 49,
    });
    expect(result.category).toBe('nuts');
  });

  it('creates a NUTS food via food() factory', () => {
    const result = food({
      id: 'test-walnuts',
      name: 'Nueces',
      category: 'nuts',
      gramsPerRation: 25,
      kcalPer100g: 650,
      proteinPer100g: 15,
      carbsPer100g: 14,
      fatPer100g: 65,
    });
    expect(result.category).toBe('nuts');
    expect(result.isProcessed).toBe(false);
  });
});
