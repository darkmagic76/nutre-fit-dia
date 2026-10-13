import { describe, it, expect } from 'vitest';
import { classifyFoodWithReasons } from './classificationService';
import { TrafficLightColor } from '@domain/trafficLight';
import { FoodCategory } from '@domain/foodCategory';
import { makeFood } from '@/test/fixtures';
import { Seasonality, Proximity, PackagingLevel } from '@domain/sustainability';

describe('classificationService', () => {
  describe('classifyFoodWithReasons', () => {
    it('includes detected sugar names in reasons', () => {
      const food = makeFood({ harmfulIngredients: ['sacarosa', 'jarabe'] });
      const result = classifyFoodWithReasons(food);
      expect(result.color).toBe(TrafficLightColor.RED);
      expect(result.reasons[0]).toContain('sacarosa');
      expect(result.reasons[0]).toContain('jarabe');
    });

    it('includes trans fat reason', () => {
      const food = makeFood({ hasTransFats: true });
      const result = classifyFoodWithReasons(food);
      expect(result.color).toBe(TrafficLightColor.RED);
      expect(result.reasons[0]).toContain('grasas trans');
    });

    it('returns empty reasons for GREEN foods', () => {
      const food = makeFood({ category: FoodCategory.LEGUMES });
      const result = classifyFoodWithReasons(food);
      expect(result.color).toBe(TrafficLightColor.GREEN);
      expect(result.reasons).toEqual([]);
    });

    it('warns about processed food with non-sugar harmful ingredients', () => {
      const food = makeFood({
        isProcessed: true,
        harmfulIngredients: ['conservantes'],
        hasTransFats: false,
        category: FoodCategory.VEGETABLES,
      });
      const result = classifyFoodWithReasons(food);
      expect(result.color).toBe(TrafficLightColor.GREEN);
      expect(result.reasons).toContain('Producto procesado con ingredientes no recomendados');
    });

    // ─── H4: Dual qualification — environmental score ───

    it('includes environmentalScore for food with carbonFootprint data', () => {
      const food = makeFood({
        category: FoodCategory.LEGUMES,
        carbonFootprint: 0.8,
        isSeasonal: true,
      });
      const result = classifyFoodWithReasons(food);
      expect(result.environmentalScore).toBeDefined();
      expect(result.environmentalScore!.carbonFootprint).toBe(0.8);
      expect(result.environmentalScore!.seasonality).toBe(Seasonality.IN_SEASON);
      expect(result.environmentalScore!.proximity).toBe(Proximity.LOCAL_KM0);
      expect(result.environmentalScore!.score).toBeGreaterThan(0);
    });

    it('includes environmentalScore with neutral carbon when carbonFootprint is missing', () => {
      const food = makeFood({ category: FoodCategory.VEGETABLES, isSeasonal: true });
      const result = classifyFoodWithReasons(food);
      expect(result.environmentalScore).toBeDefined();
      expect(result.environmentalScore!.carbonFootprint).toBe(0);
      expect(result.environmentalScore!.seasonality).toBe(Seasonality.IN_SEASON);
    });

    it('preserves health classification correctness alongside environmentalScore', () => {
      const food = makeFood({
        category: FoodCategory.VEGETABLES,
        carbonFootprint: 0.3,
        isSeasonal: true,
      });
      const result = classifyFoodWithReasons(food);
      // Health classification unchanged
      expect(result.color).toBe(TrafficLightColor.GREEN);
      // Environmental score present
      expect(result.environmentalScore).toBeDefined();
      const es = result.environmentalScore!;
      expect(es.packaging).toBe(PackagingLevel.BULK);
      expect(es.score).toBeGreaterThanOrEqual(80);
    });

    it('skips environmentalScore for RED foods (occult sugars return early)', () => {
      const food = makeFood({
        category: FoodCategory.VEGETABLES,
        harmfulIngredients: ['sacarosa'],
        carbonFootprint: 0.3,
        isSeasonal: true,
      });
      const result = classifyFoodWithReasons(food);
      expect(result.color).toBe(TrafficLightColor.RED);
      expect(result.environmentalScore).toBeUndefined();
    });

    it('skips environmentalScore for RED foods (trans fats return early)', () => {
      const food = makeFood({
        category: FoodCategory.VEGETABLES,
        hasTransFats: true,
        carbonFootprint: 0.3,
        isSeasonal: true,
      });
      const result = classifyFoodWithReasons(food);
      expect(result.color).toBe(TrafficLightColor.RED);
      expect(result.environmentalScore).toBeUndefined();
    });
  });
});
