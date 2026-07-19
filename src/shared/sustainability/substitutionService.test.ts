import { describe, it, expect, vi, beforeEach } from 'vitest'
import { food } from '@shared/domain'
import type { Food } from '@shared/domain'
import { computeEnvironmentalScore } from './scoringService'

/**
 * Mutable catalog used by the mocked @shared/data/foods module.
 * Each test sets up its own catalog via beforeEach.
 */
const testFoods: Food[] = []

vi.mock('@shared/data/foods', () => ({
  get foods() { return testFoods },
  foodsById: new Map(),
}))

// Dynamic import so the test file can be parsed before ./substitutionService exists
let suggestAlternative: (food: Food) => Food[]

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
  })
}

describe('suggestAlternative', () => {
  beforeAll(async () => {
    const mod = await import('./substitutionService')
    suggestAlternative = mod.suggestAlternative
  })

  beforeEach(() => {
    testFoods.length = 0
  })

  // ─── Test 1: Non-trigger food returns empty ───

  it('returns empty array for non-WHITE_MEAT food with low carbonFootprint', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = f({ id: 'v1', name: 'Tomate', category: 'vegetables', carbonFootprint: 0.5, isSeasonal: true })
    const result = suggestAlternative(input)

    expect(result).toEqual([])
  })

  // ─── Test 2: No alternatives in catalog returns empty ───

  it('returns empty array when catalog has no LEGUMES or blue FISH', () => {
    testFoods.push(
      f({ id: 'egg', name: 'Huevo', category: 'eggs', carbonFootprint: 3, isSeasonal: true }),
      f({ id: 'cereal', name: 'Arroz', category: 'cereals', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = f({ id: 'pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true })
    const result = suggestAlternative(input)

    expect(result).toEqual([])
  })

  // ─── Test 3: White meat triggers legumes + blue fish ───

  it('returns legumes and blue fish for chicken (white_meat)', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
      f({ id: 'fish-salmon', name: 'Salmón', category: 'fish', carbonFootprint: 3.5, isSeasonal: true }),
      f({ id: 'fish-sardinas', name: 'Sardinas', category: 'fish', carbonFootprint: 1.5, isSeasonal: true }),
      f({ id: 'meat-pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true }),
    )

    const input = f({ id: 'meat-pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true })
    const result = suggestAlternative(input)

    expect(result.length).toBeGreaterThan(0)
    // Every result must be either LEGUMES or blue FISH
    for (const r of result) {
      const isLegume = r.category === 'legumes'
      const isBlueFish = r.category === 'fish' && (r.id === 'fish-sardinas' || r.id === 'fish-salmon')
      expect(isLegume || isBlueFish).toBe(true)
    }
  })

  // ─── Test 4: Input food excluded from results ───

  it('excludes the input food from alternatives', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
      f({ id: 'meat-pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true }),
    )

    const input = f({ id: 'meat-pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true })
    const result = suggestAlternative(input)

    const resultIds = result.map(r => r.id)
    expect(resultIds).not.toContain('meat-pollo')
  })

  // ─── Test 5: Ranked by score descending ───

  it('returns alternatives ranked by environmental score descending', () => {
    // Three alternatives with clearly different scores:
    //   lentejas: CF=0.8, seasonal  → 100 (very_low) ×0.5 + 100 (in_season)×0.3 + 100 (km0)×0.2 = 100
    //   garbanzos: CF=0.8, NOT seasonal → 100×0.5 + 30×0.3 + 60×0.2 = 71
    //   salmon:   CF=3.5, seasonal  → 60 (moderate)×0.5 + 100×0.3 + 100×0.2 = 80
    testFoods.push(
      f({ id: 'meat-pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true }),
      f({ id: 'lentejas', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
      f({ id: 'fish-salmon', name: 'Salmón', category: 'fish', carbonFootprint: 3.5, isSeasonal: true }),
      f({ id: 'garbanzos', name: 'Garbanzos', category: 'legumes', carbonFootprint: 0.8, isSeasonal: false }),
    )

    const input = testFoods[0] // pollo
    const result = suggestAlternative(input)

    expect(result.length).toBeGreaterThanOrEqual(2)
    for (let i = 1; i < result.length; i++) {
      const prevScore = computeEnvironmentalScore(result[i - 1]).score
      const currScore = computeEnvironmentalScore(result[i]).score
      expect(prevScore).toBeGreaterThanOrEqual(currScore)
    }
  })

  // ─── Test 6: Max 3 alternatives ───

  it('returns at most 3 alternatives even when more candidates exist', () => {
    // 5 candidates: 3 legumes + 2 blue fish
    testFoods.push(
      f({ id: 'meat-pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true }),
      f({ id: 'lentejas', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
      f({ id: 'garbanzos', name: 'Garbanzos', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
      f({ id: 'alubias', name: 'Alubias', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
      f({ id: 'fish-salmon', name: 'Salmón', category: 'fish', carbonFootprint: 3.5, isSeasonal: true }),
      f({ id: 'fish-sardinas', name: 'Sardinas', category: 'fish', carbonFootprint: 1.5, isSeasonal: true }),
    )

    const input = testFoods[0] // pollo
    const result = suggestAlternative(input)

    expect(result.length).toBeLessThanOrEqual(3)
    expect(result.length).toBeGreaterThan(0)
  })

  // ─── Test 7: Blue fish filter ───

  it('includes sardinas and salmon but excludes bacalao and merluza', () => {
    testFoods.push(
      f({ id: 'meat-pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true }),
      f({ id: 'fish-salmon', name: 'Salmón', category: 'fish', carbonFootprint: 3.5, isSeasonal: true }),
      f({ id: 'fish-sardinas', name: 'Sardinas', category: 'fish', carbonFootprint: 1.5, isSeasonal: true }),
      f({ id: 'fish-bacalao', name: 'Bacalao', category: 'fish', carbonFootprint: 2.2, isSeasonal: true }),
      f({ id: 'fish-merluza', name: 'Merluza', category: 'fish', carbonFootprint: 2.0, isSeasonal: true }),
      f({ id: 'lentejas', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = testFoods[0] // pollo
    const result = suggestAlternative(input)

    const resultIds = result.map(r => r.id)
    expect(resultIds).toContain('fish-salmon')
    expect(resultIds).toContain('fish-sardinas')
    expect(resultIds).not.toContain('fish-bacalao')
    expect(resultIds).not.toContain('fish-merluza')
  })

  // ─── Test 8: Empty catalog ───

  it('returns empty array when the food catalog is empty', () => {
    // testFoods is already empty via beforeEach
    const input = f({ id: 'pollo', name: 'Pollo', category: 'white_meat', carbonFootprint: 5, isSeasonal: true })
    const result = suggestAlternative(input)

    expect(result).toEqual([])
  })

  // ─── Test 9: Food without carbonFootprint returns empty ───

  it('returns empty array for non-WHITE_MEAT food without carbonFootprint', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = f({ id: 'c1', name: 'Arroz', category: 'cereals' })
    const result = suggestAlternative(input)

    expect(result).toEqual([])
  })

  // ─── TRIANGULATION: High-carbon non-meat triggers (spec Scenario 2) ───

  it('triggers substitution for high-carbon non-meat food (dairy, CF=5.0)', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = f({ id: 'd1', name: 'Queso', category: 'dairy', carbonFootprint: 5.0, isSeasonal: true })
    const result = suggestAlternative(input)

    expect(result.length).toBeGreaterThan(0)
  })

  // ─── TRIANGULATION: White meat without CF still triggers ───

  it('triggers substitution for WHITE_MEAT food even without carbonFootprint', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = f({ id: 'pollo', name: 'Pollo', category: 'white_meat' })
    const result = suggestAlternative(input)

    expect(result.length).toBeGreaterThan(0)
  })

  // ─── TRIANGULATION: CF exactly 4.0 should trigger (borderline) ───

  it('triggers substitution when carbonFootprint is exactly 4.0', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = f({ id: 'border', name: 'Borderline', category: 'eggs', carbonFootprint: 4.0, isSeasonal: true })
    const result = suggestAlternative(input)

    expect(result.length).toBeGreaterThan(0)
  })

  // ─── TRIANGULATION: CF just below 4.0 should NOT trigger (borderline) ───

  it('does NOT trigger when carbonFootprint is just below 4.0', () => {
    testFoods.push(
      f({ id: 'l1', name: 'Lentejas', category: 'legumes', carbonFootprint: 0.8, isSeasonal: true }),
    )

    const input = f({ id: 'below', name: 'Just below', category: 'eggs', carbonFootprint: 3.999, isSeasonal: true })
    const result = suggestAlternative(input)

    expect(result).toEqual([])
  })
})
