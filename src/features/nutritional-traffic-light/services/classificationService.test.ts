import { describe, it, expect } from 'vitest';
import { classifyFood, classifyFoodWithReasons } from './classificationService';
import { TrafficLightColor, FoodCategory } from '@shared/domain';
import { foodsById } from '@shared/data/foods';
import { makeFood } from '@/test/fixtures';
import { Seasonality, Proximity, PackagingLevel } from '@shared/sustainability';

describe('classificationService', () => {
  describe('classifyFood', () => {
    // ─── GREEN foods ───
    it('classifies AOVE as GREEN', () => {
      const aove = foodsById.get('oil-aove')!;
      expect(classifyFood(aove)).toBe(TrafficLightColor.GREEN);
    });

    it('classifies legumes as GREEN', () => {
      const lentejas = foodsById.get('legume-lentejas')!;
      expect(classifyFood(lentejas)).toBe(TrafficLightColor.GREEN);
    });

    it('classifies fish as GREEN', () => {
      const bacalao = foodsById.get('fish-bacalao')!;
      expect(classifyFood(bacalao)).toBe(TrafficLightColor.GREEN);
    });

    it('classifies vegetables as GREEN', () => {
      const brocoli = foodsById.get('veg-brocoli')!;
      expect(classifyFood(brocoli)).toBe(TrafficLightColor.GREEN);
    });

    it('classifies eggs as GREEN', () => {
      const huevo = foodsById.get('egg-huevo')!;
      expect(classifyFood(huevo)).toBe(TrafficLightColor.GREEN);
    });

    // ─── ORANGE foods ───
    it('classifies dairy as ORANGE (moderation)', () => {
      const leche = foodsById.get('dairy-leche-semidesnatada')!;
      expect(classifyFood(leche)).toBe(TrafficLightColor.ORANGE);
    });

    it('classifies white meat as ORANGE (moderation)', () => {
      const pollo = foodsById.get('meat-pollo')!;
      expect(classifyFood(pollo)).toBe(TrafficLightColor.ORANGE);
    });

    it('classifies cereals as ORANGE by default', () => {
      const pan = foodsById.get('cereal-pan-integral')!;
      expect(classifyFood(pan)).toBe(TrafficLightColor.ORANGE);
    });

    // ─── RED foods — occult sugars override everything (FR-3.2) ───
    it('classifies food with occult sugars as RED — overrides category', () => {
      const food = makeFood({
        category: FoodCategory.VEGETABLES,
        harmfulIngredients: ['sacarosa'],
      });
      expect(classifyFood(food)).toBe(TrafficLightColor.RED);
    });

    it('classifies processed gazpacho with sacarosa as RED', () => {
      const gazpacho = foodsById.get('proc-gazpacho-industrial')!;
      expect(classifyFood(gazpacho)).toBe(TrafficLightColor.RED);
    });

    it('classifies industrial cookies with jarabe as RED', () => {
      const galletas = foodsById.get('proc-galletas-integrales')!;
      expect(classifyFood(galletas)).toBe(TrafficLightColor.RED);
    });

    it('classifies chorizo with dextrosa as RED', () => {
      const chorizo = foodsById.get('proc-embutido-chorizo')!;
      expect(classifyFood(chorizo)).toBe(TrafficLightColor.RED);
    });

    // ─── RED — trans fats ───
    it('classifies food with trans fats as RED', () => {
      const food = makeFood({ hasTransFats: true });
      expect(classifyFood(food)).toBe(TrafficLightColor.RED);
    });

    it('classifies margarina as RED (trans fats)', () => {
      const margarina = foodsById.get('proc-margarina')!;
      expect(classifyFood(margarina)).toBe(TrafficLightColor.RED);
    });

    // ─── Clean foods remain their natural color ───
    it('classifies clean vegetables as GREEN even when processed flag is false', () => {
      const food = makeFood({ category: FoodCategory.VEGETABLES, isProcessed: false });
      expect(classifyFood(food)).toBe(TrafficLightColor.GREEN);
    });
  });

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
