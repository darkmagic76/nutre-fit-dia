import { describe, it, expect } from 'vitest';
import { foods, foodsById } from '@shared/data/foods';
import { FoodCategory } from '@domain/foodCategory';

describe('food catalog — new entries (aesan-tubers-and-cooked-distinction)', () => {
  describe('tuber foods', () => {
    it('tuber-patata exists with correct values', () => {
      const patata = foodsById.get('tuber-patata');
      expect(patata).toBeDefined();
      expect(patata!.category).toBe(FoodCategory.TUBERS);
      expect(patata!.gramsPerRation).toBe(175);
      expect(patata!.kcalPer100g).toBe(77);
    });

    it('tuber-boniato exists with correct values', () => {
      const boniato = foodsById.get('tuber-boniato');
      expect(boniato).toBeDefined();
      expect(boniato!.category).toBe(FoodCategory.TUBERS);
      expect(boniato!.gramsPerRation).toBe(175);
      expect(boniato!.kcalPer100g).toBe(86);
    });

    it('tuber-name exists with correct values', () => {
      const name = foodsById.get('tuber-name');
      expect(name).toBeDefined();
      expect(name!.category).toBe(FoodCategory.TUBERS);
      expect(name!.gramsPerRation).toBe(175);
      expect(name!.kcalPer100g).toBe(118);
    });

    it('all tuber foods are non-processed', () => {
      const tubers = foods.filter((f) => f.category === FoodCategory.TUBERS);
      expect(tubers).toHaveLength(3);
      for (const tuber of tubers) {
        expect(tuber.isProcessed).toBe(false);
      }
    });
  });

  describe('cooked legume entries', () => {
    it('legume-lentejas-cocido exists with cooked preparation state', () => {
      const food = foodsById.get('legume-lentejas-cocido');
      expect(food).toBeDefined();
      expect(food!.category).toBe(FoodCategory.LEGUMES);
      expect(food!.gramsPerRation).toBe(150);
      expect(food!.preparationState).toBe('cooked');
    });

    it('legume-garbanzos-cocido exists with cooked preparation state', () => {
      const food = foodsById.get('legume-garbanzos-cocido');
      expect(food).toBeDefined();
      expect(food!.category).toBe(FoodCategory.LEGUMES);
      expect(food!.gramsPerRation).toBe(150);
      expect(food!.preparationState).toBe('cooked');
    });

    it('legume-alubias-cocido exists with cooked preparation state', () => {
      const food = foodsById.get('legume-alubias-cocido');
      expect(food).toBeDefined();
      expect(food!.category).toBe(FoodCategory.LEGUMES);
      expect(food!.gramsPerRation).toBe(150);
      expect(food!.preparationState).toBe('cooked');
    });
  });

  describe('cooked cereal entries', () => {
    it('cereal-arroz-integral-cocido exists with cooked preparation state', () => {
      const food = foodsById.get('cereal-arroz-integral-cocido');
      expect(food).toBeDefined();
      expect(food!.category).toBe(FoodCategory.CEREALS);
      expect(food!.gramsPerRation).toBe(180);
      expect(food!.preparationState).toBe('cooked');
    });

    it('cereal-pasta-integral-cocida exists with cooked preparation state', () => {
      const food = foodsById.get('cereal-pasta-integral-cocida');
      expect(food).toBeDefined();
      expect(food!.category).toBe(FoodCategory.CEREALS);
      expect(food!.gramsPerRation).toBe(180);
      expect(food!.preparationState).toBe('cooked');
    });
  });

  describe('non-regression: existing foods unchanged', () => {
    it('catalog has 52 total entries (44 existing + 8 new)', () => {
      expect(foods).toHaveLength(52);
    });

    it('existing legume-lentejas unchanged (dry, 60g)', () => {
      const lentejas = foodsById.get('legume-lentejas');
      expect(lentejas!.gramsPerRation).toBe(60);
      expect(lentejas!.preparationState).toBe('as-stored');
    });

    it('existing cereal-pan-integral unchanged (dry, 50g)', () => {
      const pan = foodsById.get('cereal-pan-integral');
      expect(pan!.gramsPerRation).toBe(50);
      expect(pan!.preparationState).toBe('as-stored');
    });
  });
});
