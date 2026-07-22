import { describe, it, expect, vi, beforeEach } from 'vitest';
import { food } from '@shared/domain';
import type { Food } from '@shared/domain';
import { computeEnvironmentalScore } from './scoringService';

/**
 * Mutable catalog used by the mocked @shared/data/foods module.
 * Each test sets up its own catalog via beforeEach.
 */
const testFoods: Food[] = [];

vi.mock('@shared/data/foods', () => ({
  get foods() {
    return testFoods;
  },
  foodsById: new Map(),
}));

// Dynamic import so the test file can be parsed before ./substitutionService exists
let suggestAlternative: (food: Food) => Food[];

/**
 * Helper: create a Food with defaults for fields not relevant to tests.
 * Callers override only what matters for the specific test case.
 */
function f(overrides: Partial<Food> & { id: string; name: string; category: string }): Food {
  return food({
    id: overrides.id,
    name: overrides.name,
    category: overrides.category,
    gramsPerRation: 100,
    kcalPer100g: 100,
    proteinPer100g: 10,
    carbsPer100g: 10,
    fatPer100g: 5,
    fiberPer100g: 0,
    ...overrides,
  });
}

describe('suggestAlternative', () => {
  beforeAll(async () => {
    const mod = await import('./substitutionService');
    suggestAlternative = mod.suggestAlternative;
  });

  beforeEach(() => {
    testFoods.length = 0;
  });

  // ─── Test 1: Non-trigger food returns empty ───

  it('returns empty array for non-RED_MEAT food with low carbonFootprint', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
    );

    const input = f({
      id: 'v1',
      name: 'Tomate',
      category: 'vegetables',
      carbonFootprint: 0.5,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    expect(result).toEqual([]);
  });

  // ─── Test 2: No alternatives in catalog returns empty ───

  it('returns empty array when catalog has no LEGUMES or blue FISH', () => {
    testFoods.push(
      f({ id: 'egg', name: 'Huevo', category: 'eggs', carbonFootprint: 3, isSeasonal: true }),
      f({
        id: 'cereal',
        name: 'Arroz',
        category: 'cereals',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
    );

    const input = f({
      id: 'ternera',
      name: 'Ternera',
      category: 'red_meat',
      carbonFootprint: 27,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    expect(result).toEqual([]);
  });

  // ─── Test 3: Red meat triggers legumes + blue fish ───

  it('returns legumes and blue fish for ternera (red_meat)', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
      f({
        id: 'fish-salmon',
        name: 'Salmón',
        category: 'fish',
        carbonFootprint: 3.5,
        isSeasonal: true,
      }),
      f({
        id: 'fish-sardinas',
        name: 'Sardinas',
        category: 'fish',
        carbonFootprint: 1.5,
        isSeasonal: true,
      }),
      f({
        id: 'meat-ternera',
        name: 'Ternera',
        category: 'red_meat',
        carbonFootprint: 27,
        isSeasonal: true,
      }),
    );

    const input = f({
      id: 'meat-ternera',
      name: 'Ternera',
      category: 'red_meat',
      carbonFootprint: 27,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    expect(result.length).toBeGreaterThan(0);
    // Every result must be either LEGUMES or blue FISH
    for (const r of result) {
      const isLegume = r.category === 'legumes';
      const isBlueFish =
        r.category === 'fish' && (r.id === 'fish-sardinas' || r.id === 'fish-salmon');
      expect(isLegume || isBlueFish).toBe(true);
    }
  });

  // ─── Test 4: Input food excluded from results ───

  it('excludes the input food from alternatives', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
      f({
        id: 'meat-ternera',
        name: 'Ternera',
        category: 'red_meat',
        carbonFootprint: 27,
        isSeasonal: true,
      }),
    );

    const input = f({
      id: 'meat-ternera',
      name: 'Ternera',
      category: 'red_meat',
      carbonFootprint: 27,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    const resultIds = result.map((r) => r.id);
    expect(resultIds).not.toContain('meat-ternera');
  });

  // ─── Test 5: Ranked by score descending ───

  it('returns alternatives ranked by environmental score descending', () => {
    testFoods.push(
      f({
        id: 'meat-ternera',
        name: 'Ternera',
        category: 'red_meat',
        carbonFootprint: 27,
        isSeasonal: true,
      }),
      f({
        id: 'lentejas',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
      f({
        id: 'fish-salmon',
        name: 'Salmón',
        category: 'fish',
        carbonFootprint: 3.5,
        isSeasonal: true,
      }),
      f({
        id: 'garbanzos',
        name: 'Garbanzos',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: false,
      }),
    );

    const input = testFoods[0]; // ternera
    const result = suggestAlternative(input);

    expect(result.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < result.length; i++) {
      const prevScore = computeEnvironmentalScore(result[i - 1]).score;
      const currScore = computeEnvironmentalScore(result[i]).score;
      expect(prevScore).toBeGreaterThanOrEqual(currScore);
    }
  });

  // ─── Test 6: Max 3 alternatives ───

  it('returns at most 3 alternatives even when more candidates exist', () => {
    testFoods.push(
      f({
        id: 'meat-ternera',
        name: 'Ternera',
        category: 'red_meat',
        carbonFootprint: 27,
        isSeasonal: true,
      }),
      f({
        id: 'lentejas',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
      f({
        id: 'garbanzos',
        name: 'Garbanzos',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
      f({
        id: 'alubias',
        name: 'Alubias',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
      f({
        id: 'fish-salmon',
        name: 'Salmón',
        category: 'fish',
        carbonFootprint: 3.5,
        isSeasonal: true,
      }),
      f({
        id: 'fish-sardinas',
        name: 'Sardinas',
        category: 'fish',
        carbonFootprint: 1.5,
        isSeasonal: true,
      }),
    );

    const input = testFoods[0]; // ternera
    const result = suggestAlternative(input);

    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.length).toBeGreaterThan(0);
  });

  // ─── Test 7: Blue fish filter ───

  it('includes sardinas and salmon but excludes bacalao and merluza', () => {
    testFoods.push(
      f({
        id: 'meat-ternera',
        name: 'Ternera',
        category: 'red_meat',
        carbonFootprint: 27,
        isSeasonal: true,
      }),
      f({
        id: 'fish-salmon',
        name: 'Salmón',
        category: 'fish',
        carbonFootprint: 3.5,
        isSeasonal: true,
      }),
      f({
        id: 'fish-sardinas',
        name: 'Sardinas',
        category: 'fish',
        carbonFootprint: 1.5,
        isSeasonal: true,
      }),
      f({
        id: 'fish-bacalao',
        name: 'Bacalao',
        category: 'fish',
        carbonFootprint: 2.2,
        isSeasonal: true,
      }),
      f({
        id: 'fish-merluza',
        name: 'Merluza',
        category: 'fish',
        carbonFootprint: 2.0,
        isSeasonal: true,
      }),
      f({
        id: 'lentejas',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
    );

    const input = testFoods[0]; // ternera
    const result = suggestAlternative(input);

    const resultIds = result.map((r) => r.id);
    expect(resultIds).toContain('fish-salmon');
    expect(resultIds).toContain('fish-sardinas');
    expect(resultIds).not.toContain('fish-bacalao');
    expect(resultIds).not.toContain('fish-merluza');
  });

  // ─── Test 8: Empty catalog ───

  it('returns empty array when the food catalog is empty', () => {
    // testFoods is already empty via beforeEach
    const input = f({
      id: 'ternera',
      name: 'Ternera',
      category: 'red_meat',
      carbonFootprint: 27,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    expect(result).toEqual([]);
  });

  // ─── Test 9: Food without carbonFootprint returns empty (non-trigger) ───

  it('returns empty array for non-RED_MEAT food without carbonFootprint', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
    );

    const input = f({ id: 'c1', name: 'Arroz', category: 'cereals' });
    const result = suggestAlternative(input);

    expect(result).toEqual([]);
  });

  // ─── NEW: Chorizo (RED_MEAT, CF 8.0) triggers correctly ───

  it('triggers substitution for chorizo (RED_MEAT, CF 8.0) via category gate only', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
      f({
        id: 'fish-sardinas',
        name: 'Sardinas',
        category: 'fish',
        carbonFootprint: 1.5,
        isSeasonal: true,
      }),
    );

    const input = f({
      id: 'proc-embutido-chorizo',
      name: 'Chorizo',
      category: 'red_meat',
      carbonFootprint: 8.0,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    expect(result.length).toBeGreaterThan(0);
  });

  // ─── NEW: Conejo (WHITE_MEAT, CF 4.0) does NOT trigger ───

  it('does NOT trigger for conejo (WHITE_MEAT, CF 4.0) — heuristic removed', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
    );

    const input = f({
      id: 'meat-conejo',
      name: 'Conejo',
      category: 'white_meat',
      carbonFootprint: 4.0,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    expect(result).toEqual([]);
  });

  // ─── NEW: White meat with high CF no longer triggers ───

  it('does NOT trigger for WHITE_MEAT food with high carbonFootprint', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
    );

    const input = f({
      id: 'meat-pollo',
      name: 'Pollo',
      category: 'white_meat',
      carbonFootprint: 8.0,
      isSeasonal: true,
    });
    const result = suggestAlternative(input);

    expect(result).toEqual([]);
  });

  // ─── NEW: Red meat without CF also triggers ───

  it('triggers substitution for RED_MEAT food even without carbonFootprint', () => {
    testFoods.push(
      f({
        id: 'l1',
        name: 'Lentejas',
        category: 'legumes',
        carbonFootprint: 0.8,
        isSeasonal: true,
      }),
    );

    const input = f({ id: 'cerdo', name: 'Cerdo', category: 'red_meat' });
    const result = suggestAlternative(input);

    expect(result.length).toBeGreaterThan(0);
  });
});
