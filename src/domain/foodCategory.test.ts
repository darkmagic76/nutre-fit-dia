import { describe, it, expect } from 'vitest';
import { FoodCategory, FoodCategorySchema, ANIMAL_PROTEIN_CATEGORIES } from './foodCategory';

describe('FoodCategory.RED_MEAT', () => {
  it('has RED_MEAT enum member with value "red_meat"', () => {
    expect(FoodCategory.RED_MEAT).toBe('red_meat');
  });

  it('Zod schema parses "red_meat" successfully', () => {
    expect(() => FoodCategorySchema.parse('red_meat')).not.toThrow();
    expect(FoodCategorySchema.parse('red_meat')).toBe('red_meat');
  });

  it('includes RED_MEAT in ANIMAL_PROTEIN_CATEGORIES', () => {
    expect(ANIMAL_PROTEIN_CATEGORIES).toContain(FoodCategory.RED_MEAT);
  });
});

describe('FoodCategory.TUBERS', () => {
  it('has TUBERS enum member with value "tubers"', () => {
    expect(FoodCategory.TUBERS).toBe('tubers');
  });

  it('Zod schema parses "tubers" successfully', () => {
    expect(() => FoodCategorySchema.parse('tubers')).not.toThrow();
    expect(FoodCategorySchema.parse('tubers')).toBe('tubers');
  });

  it('Zod schema rejects "tuber" (singular typo)', () => {
    expect(() => FoodCategorySchema.parse('tuber')).toThrow();
  });
});
