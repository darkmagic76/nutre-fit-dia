import { z } from 'zod';
import { defineEnum } from './enum';
import type { ValuesOf } from './enum';

/**
 * Canonical food categories per ADR-005 (13 groups from INFORME_ADR + RED_MEAT amendment 2026-07-21 + NUTS + TUBERS 2026-08-10).
 * SPECS_RF (5 groups) and SPECS_TECH (~7) are UI simplifications, not domain replacements.
 */
export const FoodCategory = defineEnum({
  CEREALS: 'cereals',
  VEGETABLES: 'vegetables',
  FRUITS: 'fruits',
  OLIVE_OIL: 'olive_oil',
  DAIRY: 'dairy',
  LEGUMES: 'legumes',
  FISH: 'fish',
  EGGS: 'eggs',
  WHITE_MEAT: 'white_meat',
  RED_MEAT: 'red_meat',
  WATER: 'water',
  NUTS: 'nuts',
  TUBERS: 'tubers',
});

export type FoodCategory = ValuesOf<typeof FoodCategory>;

export const FoodCategorySchema = z.enum([
  'cereals',
  'vegetables',
  'fruits',
  'olive_oil',
  'dairy',
  'legumes',
  'fish',
  'eggs',
  'white_meat',
  'red_meat',
  'water',
  'nuts',
  'tubers',
]);

/** Groups that count toward animal protein (for NudgeEngine: "si Animal_Protein > 2, sugerir calcio vegetal") */
export const ANIMAL_PROTEIN_CATEGORIES: FoodCategory[] = [
  FoodCategory.DAIRY,
  FoodCategory.FISH,
  FoodCategory.EGGS,
  FoodCategory.WHITE_MEAT,
  FoodCategory.RED_MEAT,
];
