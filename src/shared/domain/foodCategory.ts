import { z } from 'zod';
import { defineEnum } from '@shared/utils';
import type { ValuesOf } from '@shared/utils';

/**
 * Canonical food categories per ADR-005 (10 groups from INFORME_ADR).
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
]);

/** Display names in Spanish for UI rendering */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  [FoodCategory.CEREALS]: 'Cereales',
  [FoodCategory.VEGETABLES]: 'Hortalizas',
  [FoodCategory.FRUITS]: 'Frutas',
  [FoodCategory.OLIVE_OIL]: 'AOVE',
  [FoodCategory.DAIRY]: 'Lácteos',
  [FoodCategory.LEGUMES]: 'Legumbres',
  [FoodCategory.FISH]: 'Pescado',
  [FoodCategory.EGGS]: 'Huevos',
  [FoodCategory.WHITE_MEAT]: 'Carne blanca',
  [FoodCategory.RED_MEAT]: 'Carne roja',
  [FoodCategory.WATER]: 'Agua',
};

/** Groups that count toward animal protein (for NudgeEngine: "si Animal_Protein > 2, sugerir calcio vegetal") */
export const ANIMAL_PROTEIN_CATEGORIES: FoodCategory[] = [
  FoodCategory.DAIRY,
  FoodCategory.FISH,
  FoodCategory.EGGS,
  FoodCategory.WHITE_MEAT,
  FoodCategory.RED_MEAT,
];
