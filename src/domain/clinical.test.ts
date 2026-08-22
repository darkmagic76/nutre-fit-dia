import { describe, it, expect } from 'vitest';
import {
  CEREAL_RESTRICTED_MAX,
  CEREAL_MIN_RATIONS,
  VEGETABLE_MIN_RATIONS,
  FRUIT_MIN_RATIONS,
  WEEKLY_ACTIVITY_MINUTES_TARGET,
  NUTS_MIN_WEEKLY,
  NUTS_MAX_DAILY,
} from './clinical';
import { AESAN_GRAM_STANDARDS, RATION_LIMITS } from './rationValidator';
import { FoodCategory } from './foodCategory';
import { HIGH_GLYCEMIC_FRUIT_NAMES } from './glycemicFruits';
import {
  CARBON_THRESHOLDS,
  SCORING_WEIGHTS,
  PROTEIN_EMISSION_RATIOS,
} from './sustainability/constants';
import { computeCaloricTarget, getDiagnosisModifier } from './caloricTargetService';
import fs from 'fs';
import path from 'path';

// ─── Source file paths for attribution verification ───
const CLINICAL_TS = path.resolve(__dirname, 'clinical.ts');
const SUSTAINABILITY_CONSTANTS_TS = path.resolve(__dirname, 'sustainability/constants.ts');
const GLYCEMIC_FRUITS_TS = path.resolve(__dirname, 'glycemicFruits.ts');
const CALORIC_TARGET_TS = path.resolve(__dirname, 'caloricTargetService.ts');

function readSourceFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

// ─── Task 1: clinical.ts — re-labeled invented constants ───

describe('clinical constants — source attribution integrity', () => {
  const clinicalSource = readSourceFile(CLINICAL_TS);

  describe('invented constants re-labeled as internal design', () => {
    it('VEGETABLE_NUDGE_HOUR_THRESHOLD cites INFORME_ADR (20:00h)', () => {
      expect(clinicalSource).toMatch(/INFORME_ADR[\s\S]*?VEGETABLE_NUDGE_HOUR_THRESHOLD/);
      expect(clinicalSource).toMatch(/20:00/);
    });

    it('WATER_MIN_RATIONS cites INFORME_ADR / SPECS_TECH (4-8 vasos)', () => {
      expect(clinicalSource).toMatch(/INFORME_ADR[\s\S]*?WATER_MIN_RATIONS/);
      expect(clinicalSource).toMatch(/4-8 vasos/);
    });

    it('ANIMAL_PROTEIN_NUDGE_THRESHOLD cites INFORME_ADR (Animal_Protein > 2)', () => {
      expect(clinicalSource).toMatch(/INFORME_ADR[\s\S]*?ANIMAL_PROTEIN_NUDGE_THRESHOLD/);
      expect(clinicalSource).toMatch(/Animal_Protein > 2/);
    });

    it('LEGUMES_CHECK_DAY_THRESHOLD comment does NOT claim "PREDIMED-Plus"', () => {
      expect(clinicalSource).not.toMatch(/LEGUMES_CHECK_DAY_THRESHOLD.*PREDIMED-Plus/);
      expect(clinicalSource).toMatch(/Internal design decision[\s\S]*?LEGUMES_CHECK_DAY_THRESHOLD/);
    });

    it('LEGUMES_MIN_WEEKLY_CHECK comment does NOT claim "PREDIMED-Plus"', () => {
      expect(clinicalSource).not.toMatch(/LEGUMES_MIN_WEEKLY_CHECK.*PREDIMED-Plus/);
      expect(clinicalSource).toMatch(/Internal design decision[\s\S]*?LEGUMES_MIN_WEEKLY_CHECK/);
    });

    it('FISH_EXCESS_THRESHOLD comment does NOT claim "AESAN 2022"', () => {
      expect(clinicalSource).not.toMatch(/FISH_EXCESS_THRESHOLD.*AESAN 2022/);
      expect(clinicalSource).toMatch(/Internal design decision[\s\S]*?FISH_EXCESS_THRESHOLD/);
    });

    it('LOW_ENVIRONMENTAL_SCORE_THRESHOLD comment does NOT claim "Carbon footprint"', () => {
      expect(clinicalSource).not.toMatch(/LOW_ENVIRONMENTAL_SCORE_THRESHOLD.*Carbon footprint/);
      expect(clinicalSource).toMatch(
        /Internal design decision[\s\S]*?LOW_ENVIRONMENTAL_SCORE_THRESHOLD/,
      );
    });
  });

  describe('verified constants preserve AESAN attribution', () => {
    it('CEREAL_RESTRICTED_MAX cites AESAN 2022', () => {
      expect(clinicalSource).toMatch(/AESAN 2022[\s\S]*?CEREAL_RESTRICTED_MAX/);
    });

    it('CEREAL_MIN_RATIONS cites AESAN 2022', () => {
      expect(clinicalSource).toMatch(/AESAN 2022[\s\S]*?CEREAL_MIN_RATIONS/);
    });

    it('VEGETABLE_MIN_RATIONS cites source', () => {
      expect(clinicalSource).toMatch(/PREDIMED-Plus[\s\S]*?VEGETABLE_MIN_RATIONS/);
    });

    it('FRUIT_MIN_RATIONS cites source', () => {
      expect(clinicalSource).toMatch(/SPECS_RF[\s\S]*?FRUIT_MIN_RATIONS/);
    });

    it('WEEKLY_ACTIVITY_MINUTES_TARGET cites WHO', () => {
      expect(clinicalSource).toMatch(/WHO[\s\S]*?WEEKLY_ACTIVITY_MINUTES_TARGET/);
    });

    it('NUTS_MIN_WEEKLY cites AESAN 2022', () => {
      expect(clinicalSource).toMatch(/AESAN 2022[\s\S]*?NUTS_MIN_WEEKLY/);
    });

    it('NUTS_MAX_DAILY cites AESAN 2022', () => {
      expect(clinicalSource).toMatch(/AESAN 2022[\s\S]*?NUTS_MAX_DAILY/);
    });
  });

  describe('constant values unchanged for verified constants', () => {
    it('CEREAL_RESTRICTED_MAX = 4 (AESAN p.167)', () => {
      expect(CEREAL_RESTRICTED_MAX).toBe(4);
    });

    it('CEREAL_MIN_RATIONS = 3 (AESAN p.167)', () => {
      expect(CEREAL_MIN_RATIONS).toBe(3);
    });

    it('VEGETABLE_MIN_RATIONS = 3 (AESAN p.166)', () => {
      expect(VEGETABLE_MIN_RATIONS).toBe(3);
    });

    it('FRUIT_MIN_RATIONS = 2 (AESAN p.166)', () => {
      expect(FRUIT_MIN_RATIONS).toBe(2);
    });

    it('WEEKLY_ACTIVITY_MINUTES_TARGET = 150 (WHO via AESAN p.1503)', () => {
      expect(WEEKLY_ACTIVITY_MINUTES_TARGET).toBe(150);
    });

    it('NUTS_MIN_WEEKLY = 3 (AESAN p.169)', () => {
      expect(NUTS_MIN_WEEKLY).toBe(3);
    });

    it('NUTS_MAX_DAILY = 1 (AESAN p.169)', () => {
      expect(NUTS_MAX_DAILY).toBe(1);
    });
  });
});

// ─── Task 2: rationValidator.ts — corrected gram standards ───

describe('AESAN_GRAM_STANDARDS — corrected to exact AESAN values', () => {
  describe('WHITE_MEAT: AESAN p.1493 says 100-125g (was 100-150g)', () => {
    it('min is 100g', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.WHITE_MEAT].min).toBe(100);
    });

    it('max is 125g (corrected from 150g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.WHITE_MEAT].max).toBe(125);
    });
  });

  describe('RED_MEAT: AESAN p.1493 says 100-125g (was 100-150g)', () => {
    it('min is 100g', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.RED_MEAT].min).toBe(100);
    });

    it('max is 125g (corrected from 150g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.RED_MEAT].max).toBe(125);
    });
  });

  describe('FISH: AESAN p.1479 says 125-150g (was 150-200g)', () => {
    it('min is 125g (corrected from 150g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.FISH].min).toBe(125);
    });

    it('max is 150g (corrected from 200g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.FISH].max).toBe(150);
    });
  });

  describe('EGGS: AESAN p.1483 says 53-63g (was 50-100g)', () => {
    it('min is 53g (corrected from 50g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.EGGS].min).toBe(53);
    });

    it('max is 63g (corrected from 100g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.EGGS].max).toBe(63);
    });
  });

  describe('OLIVE_OIL: AESAN p.1501 says 10ml (was 10-15g)', () => {
    it('min is 10g (10ml ≈ 10g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.OLIVE_OIL].min).toBe(10);
    });

    it('max is 10g (corrected from 15g)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.OLIVE_OIL].max).toBe(10);
    });
  });

  describe('verified gram standards unchanged', () => {
    it('CEREALS: 40-60g (AESAN p.1465)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.CEREALS]).toEqual({ min: 40, max: 60 });
    });

    it('VEGETABLES: 150-200g (AESAN p.1459)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.VEGETABLES]).toEqual({ min: 150, max: 200 });
    });

    it('FRUITS: 120-200g (AESAN p.1467)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.FRUITS]).toEqual({ min: 120, max: 200 });
    });

    it('DAIRY: 200-250g (AESAN p.1487)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.DAIRY]).toEqual({ min: 200, max: 250 });
    });

    it('LEGUMES: 50-60g dry (AESAN p.1472)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.LEGUMES]).toEqual({ min: 50, max: 60 });
    });

    it('NUTS: 20-30g (AESAN p.1474)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.NUTS]).toEqual({ min: 20, max: 30 });
    });

    it('TUBERS: 150-200g (AESAN p.1462)', () => {
      expect(AESAN_GRAM_STANDARDS[FoodCategory.TUBERS]).toEqual({ min: 150, max: 200 });
    });
  });

  describe('covers all 13 food categories', () => {
    it('has exactly 13 entries', () => {
      expect(Object.keys(AESAN_GRAM_STANDARDS)).toHaveLength(13);
    });
  });
});

describe('RATION_LIMITS — FISH max corrected', () => {
  it('FISH max is 7 (weekly cap, internal design — AESAN specifies ≥3 with no maximum)', () => {
    expect(RATION_LIMITS[FoodCategory.FISH].max).toBe(7);
  });

  it('FISH min is 3 (AESAN p.171: ≥3/week)', () => {
    expect(RATION_LIMITS[FoodCategory.FISH].min).toBe(3);
  });
});

// ─── Task 3: sustainability/constants.ts — re-attributed ───

describe('sustainability constants — correct source attribution', () => {
  const source = readSourceFile(SUSTAINABILITY_CONSTANTS_TS);

  it('CARBON_THRESHOLDS does NOT claim "AESAN 2022"', () => {
    expect(source).not.toMatch(/AESAN 2022[\s\S]{0,200}CARBON_THRESHOLDS/);
    expect(source).toMatch(/(Poore|Nemecek|EAT-Lancet)[\s\S]{0,200}CARBON_THRESHOLDS/i);
  });

  it('SCORING_WEIGHTS does NOT claim "AESAN 2022 priority"', () => {
    expect(source).not.toMatch(/AESAN 2022 priority[\s\S]{0,200}SCORING_WEIGHTS/i);
  });

  it('PROTEIN_EMISSION_RATIOS cites Poore & Nemecek or EAT-Lancet', () => {
    expect(source).toMatch(/(Poore|Nemecek|EAT-Lancet)[\s\S]{0,200}PROTEIN_EMISSION_RATIOS/i);
  });

  describe('values preserved (design choices, not clinical)', () => {
    it('CARBON_THRESHOLDS: VERY_LOW < 0.5, LOW < 1.5, MODERATE < 3.0, HIGH < 5.0', () => {
      expect(CARBON_THRESHOLDS.VERY_LOW).toBe(0.5);
      expect(CARBON_THRESHOLDS.LOW).toBe(1.5);
      expect(CARBON_THRESHOLDS.MODERATE).toBe(3.0);
      expect(CARBON_THRESHOLDS.HIGH).toBe(5.0);
    });

    it('SCORING_WEIGHTS: carbon 0.50, seasonality 0.30, proximity 0.20', () => {
      expect(SCORING_WEIGHTS.carbon).toBe(0.5);
      expect(SCORING_WEIGHTS.seasonality).toBe(0.3);
      expect(SCORING_WEIGHTS.proximity).toBe(0.2);
    });

    it('PROTEIN_EMISSION_RATIOS: legumes=1, beef=50, pork=11', () => {
      expect(PROTEIN_EMISSION_RATIOS.legumes).toBe(1);
      expect(PROTEIN_EMISSION_RATIOS.beef).toBe(50);
      expect(PROTEIN_EMISSION_RATIOS.pork).toBe(11);
    });
  });
});

// ─── Task 4: glycemicFruits.ts — AESAN contradiction disclaimer ───

describe('HIGH_GLYCEMIC_FRUIT_NAMES — AESAN disclaimer', () => {
  const source = readSourceFile(GLYCEMIC_FRUITS_TS);

  it('file header contains disclaimer about AESAN p.326 contradiction', () => {
    expect(source).toMatch(/AESAN[\s\S]*?326/i);
    expect(source).toMatch(/bajo[\s\S]*?índice[\s\S]*?glucémico/i);
  });

  it('file header cites external GI tables (Atkinson)', () => {
    expect(source).toMatch(/Atkinson/i);
    expect(source).toMatch(/external[\s\S]*?GI[\s\S]*?tables/i);
  });

  describe('set contents unchanged', () => {
    it('contains 5 fruits', () => {
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.size).toBe(5);
    });

    it('contains uvas, dátiles, higos, uvas pasas, plátano maduro', () => {
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('uvas')).toBe(true);
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('dátiles')).toBe(true);
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('higos')).toBe(true);
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('uvas pasas')).toBe(true);
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('plátano maduro')).toBe(true);
    });

    it('does NOT contain low-GI fruits', () => {
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('manzana')).toBe(false);
      expect(HIGH_GLYCEMIC_FRUIT_NAMES.has('pera')).toBe(false);
    });
  });
});

// ─── Task 5: caloricTargetService.ts — re-labeled modifiers ───

describe('caloricTargetService — source attribution integrity', () => {
  const source = readSourceFile(CALORIC_TARGET_TS);

  describe('diagnosis-age modifiers re-labeled as internal design', () => {
    it('DIAGNOSIS_AGE_EARLY_THRESHOLD comment says "Internal design decision"', () => {
      expect(source).toMatch(/Internal design decision[\s\S]*?DIAGNOSIS_AGE_EARLY_THRESHOLD/i);
    });

    it('DIAGNOSIS_AGE_LATE_THRESHOLD comment says "Internal design decision"', () => {
      expect(source).toMatch(/Internal design decision[\s\S]*?DIAGNOSIS_AGE_LATE_THRESHOLD/i);
    });

    it('DEFICIT_MODIFIER_EARLY comment says "Internal design decision"', () => {
      expect(source).toMatch(/Internal design decision[\s\S]*?DEFICIT_MODIFIER_EARLY/i);
    });

    it('DEFICIT_MODIFIER_STANDARD comment says "Internal design decision"', () => {
      expect(source).toMatch(/Internal design decision[\s\S]*?DEFICIT_MODIFIER_STANDARD/i);
    });

    it('DEFICIT_MODIFIER_LATE comment says "Internal design decision"', () => {
      expect(source).toMatch(/Internal design decision[\s\S]*?DEFICIT_MODIFIER_LATE/i);
    });

    it('SAFETY_FLOOR comment notes "External clinical consensus"', () => {
      // Comment is on the line before the constant
      expect(source).toMatch(/External clinical consensus.*\n.*SAFETY_FLOOR/i);
    });
  });

  describe('verified constants preserved (via source file)', () => {
    it('PREDIMED_PLUS_DEFICIT_KCAL = 600 in source (SPECS_RF RF-02)', () => {
      expect(source).toMatch(/PREDIMED_PLUS_DEFICIT_KCAL\s*=\s*600/);
    });

    it('DEFICIT_CAP_RATIO = 0.3 in source (SPECS_TECH §2)', () => {
      expect(source).toMatch(/DEFICIT_CAP_RATIO\s*=\s*0\.3/);
    });

    it('SAFETY_FLOOR = 1200 in source (external clinical consensus)', () => {
      expect(source).toMatch(/SAFETY_FLOOR\s*=\s*1200/);
    });
  });

  describe('modifier behavior unchanged (triangulation)', () => {
    // Lower bound: diagnosis age < 40 → full deficit
    it('diagnosisAge 30 → modifier 1.0 (full 600 kcal deficit)', () => {
      expect(getDiagnosisModifier(30)).toBe(1.0);
    });

    // Exact bound: diagnosis age = 40 → standard modifier
    it('diagnosisAge 40 → modifier 0.85 (standard)', () => {
      expect(getDiagnosisModifier(40)).toBe(0.85);
    });

    // General case: diagnosis age > 60 → reduced modifier
    it('diagnosisAge 65 → modifier 0.7 (reduced)', () => {
      expect(getDiagnosisModifier(65)).toBe(0.7);
    });

    // Edge case: NaN/zero → standard modifier
    it('diagnosisAge 0 → modifier 0.85 (standard fallback)', () => {
      expect(getDiagnosisModifier(0)).toBe(0.85);
    });

    it('diagnosisAge NaN → modifier 0.85 (standard fallback)', () => {
      expect(getDiagnosisModifier(NaN)).toBe(0.85);
    });
  });

  describe('computeCaloricTarget behavior unchanged', () => {
    it('IMC ≤ 25 → no restriction (deficit = 0)', () => {
      const result = computeCaloricTarget({
        weight: 70,
        height: 170,
        age: 35,
        gender: 'male',
        physicalActivityFactor: 1.55,
        imc: 24,
      });
      expect(result.caloricRestrictionActive).toBe(false);
      expect(result.deficit).toBe(0);
    });

    it('IMC > 25 → restriction active (deficit > 0)', () => {
      const result = computeCaloricTarget({
        weight: 90,
        height: 170,
        age: 35,
        gender: 'male',
        physicalActivityFactor: 1.55,
        imc: 31,
      });
      expect(result.caloricRestrictionActive).toBe(true);
      expect(result.deficit).toBeGreaterThan(0);
    });

    it('target never below safety floor (1200 kcal)', () => {
      const result = computeCaloricTarget({
        weight: 50,
        height: 150,
        age: 35,
        gender: 'female',
        physicalActivityFactor: 1.2,
        imc: 28,
      });
      expect(result.target).toBeGreaterThanOrEqual(1200);
    });
  });
});
