import { describe, it, expect } from 'vitest';
import { detectOccultSubstances } from './occultSugarDetector';

describe('occultSugarDetector', () => {
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
  });
});
