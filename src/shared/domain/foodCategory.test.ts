import { describe, it, expect } from 'vitest';
import {
  FoodCategory,
  FoodCategorySchema,
  CATEGORY_DISPLAY_NAMES,
  ANIMAL_PROTEIN_CATEGORIES,
} from './foodCategory';

describe('FoodCategory.RED_MEAT', () => {
  it('has RED_MEAT enum member with value "red_meat"', () => {
    expect(FoodCategory.RED_MEAT).toBe('red_meat');
  });

  it('Zod schema parses "red_meat" successfully', () => {
    expect(() => FoodCategorySchema.parse('red_meat')).not.toThrow();
    expect(FoodCategorySchema.parse('red_meat')).toBe('red_meat');
  });

  it('includes RED_MEAT in CATEGORY_DISPLAY_NAMES as "Carne roja"', () => {
    expect(CATEGORY_DISPLAY_NAMES[FoodCategory.RED_MEAT]).toBe('Carne roja');
  });

  it('includes RED_MEAT in ANIMAL_PROTEIN_CATEGORIES', () => {
    expect(ANIMAL_PROTEIN_CATEGORIES).toContain(FoodCategory.RED_MEAT);
  });
});
