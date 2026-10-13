import { describe, it, expect } from 'vitest';
import { classifyFood, detectOccultFromFood, detectOccultSubstances } from './classification';
import { TrafficLightColor } from './trafficLight';
import { FoodCategory } from './foodCategory';
import { foodsById } from '@shared/data/foods';
import { makeFood } from '@/test/fixtures';

describe('classification', () => {
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

    // ─── TUBERS: GREEN default ───
    it('classifies raw tuber (patata) as GREEN', () => {
      const patata = foodsById.get('tuber-patata')!;
      expect(classifyFood(patata)).toBe(TrafficLightColor.GREEN);
    });

    it('classifies processed tuber with occult sugars as RED', () => {
      const food = makeFood({
        category: FoodCategory.TUBERS,
        harmfulIngredients: ['sacarosa'],
      });
      expect(classifyFood(food)).toBe(TrafficLightColor.RED);
    });
  });

  describe('detectOccultSubstances', () => {
    it('returns no detections for clean ingredients', () => {
      const result = detectOccultSubstances(['tomate', 'aceite de oliva', 'sal']);
      expect(result.hasOccultSugars).toBe(false);
      expect(result.detectedSugars).toEqual([]);
      expect(result.hasTransFats).toBe(false);
    });

    it('detects sacarosa as occult sugar', () => {
      const result = detectOccultSubstances(['tomate', 'sacarosa', 'sal']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.detectedSugars).toContain('sacarosa');
    });

    it('detects jarabe as occult sugar', () => {
      const result = detectOccultSubstances(['agua', 'jarabe de glucosa']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.detectedSugars).toContain('jarabe');
    });

    it('detects sirope', () => {
      const result = detectOccultSubstances(['sirope de agave', 'limón']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.detectedSugars).toContain('sirope');
    });

    it('detects maltodextrina', () => {
      const result = detectOccultSubstances(['maltodextrina', 'sal']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.detectedSugars).toContain('maltodextrina');
    });

    it('detects concentrado de zumo', () => {
      const result = detectOccultSubstances(['concentrado de zumo de manzana']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.detectedSugars).toContain('concentrado de zumo');
    });

    it('detects multiple occult sugars in one product', () => {
      const result = detectOccultSubstances(['sacarosa', 'jarabe de maíz', 'maltodextrina']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.detectedSugars).toHaveLength(3);
    });

    it('detects trans fats (grasa hidrogenada)', () => {
      const result = detectOccultSubstances(['grasa hidrogenada', 'harina']);
      expect(result.hasTransFats).toBe(true);
      expect(result.detectedTransFats).toContain('grasa hidrogenada');
    });

    it('detects margarina as trans fat indicator', () => {
      const result = detectOccultSubstances(['margarina', 'sal']);
      expect(result.hasTransFats).toBe(true);
    });

    it('is case insensitive', () => {
      const result = detectOccultSubstances(['SACAROSA', 'Jarabe']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.detectedSugars).toHaveLength(2);
    });

    it('handles empty ingredient list', () => {
      const result = detectOccultSubstances([]);
      expect(result.hasOccultSugars).toBe(false);
      expect(result.hasTransFats).toBe(false);
    });

    it('detects both occult sugars and trans fats simultaneously', () => {
      const result = detectOccultSubstances(['sacarosa', 'grasa hidrogenada']);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.hasTransFats).toBe(true);
    });

    it('detects occult substances from a Food harmfulIngredients list', () => {
      const food = makeFood({ harmfulIngredients: ['jarabe', 'margarina'] });
      const result = detectOccultFromFood(food.harmfulIngredients);
      expect(result.hasOccultSugars).toBe(true);
      expect(result.hasTransFats).toBe(true);
    });
  });
});
