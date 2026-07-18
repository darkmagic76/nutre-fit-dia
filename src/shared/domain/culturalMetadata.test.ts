import { describe, it, expect } from 'vitest'
import { CulturalMetadataSchema, food, type CulturalMetadata } from '@shared/domain'
import { foodsById } from '@shared/data/foods'

describe('CulturalMetadataSchema', () => {
  it('validates complete metadata with all fields', () => {
    const input = {
      traditionalCuisine: true,
      socialEating: true,
      cookingTechnique: 'stew' as const,
      geographicOrigin: 'Mediterráneo',
      proteinBiologicalValue: 92,
      erMedDiet: true,
    }
    const result = CulturalMetadataSchema.parse(input)
    expect(result.traditionalCuisine).toBe(true)
    expect(result.socialEating).toBe(true)
    expect(result.cookingTechnique).toBe('stew')
    expect(result.geographicOrigin).toBe('Mediterráneo')
    expect(result.proteinBiologicalValue).toBe(92)
    expect(result.erMedDiet).toBe(true)
  })

  it('applies defaults on partial input (empty object)', () => {
    const result = CulturalMetadataSchema.parse({})
    expect(result.traditionalCuisine).toBe(false)
    expect(result.socialEating).toBe(false)
    expect(result.erMedDiet).toBe(false)
    expect(result.cookingTechnique).toBeUndefined()
    expect(result.geographicOrigin).toBeUndefined()
    expect(result.proteinBiologicalValue).toBeUndefined()
  })

  it('applies defaults on partial input (only traditionalCuisine)', () => {
    const result = CulturalMetadataSchema.parse({ traditionalCuisine: true })
    expect(result.traditionalCuisine).toBe(true)
    expect(result.socialEating).toBe(false)
    expect(result.erMedDiet).toBe(false)
  })

  it('rejects invalid cookingTechnique enum value', () => {
    const parse = () => CulturalMetadataSchema.parse({ cookingTechnique: 'fried' })
    expect(parse).toThrow()
  })

  it('accepts all valid cookingTechnique values', () => {
    for (const tech of ['steam', 'boiled', 'grilled', 'raw', 'stew'] as const) {
      const result = CulturalMetadataSchema.parse({ cookingTechnique: tech })
      expect(result.cookingTechnique).toBe(tech)
    }
  })

  it('rejects proteinBiologicalValue over 100', () => {
    const parse = () => CulturalMetadataSchema.parse({ proteinBiologicalValue: 101 })
    expect(parse).toThrow()
  })

  it('rejects proteinBiologicalValue below 0', () => {
    const parse = () => CulturalMetadataSchema.parse({ proteinBiologicalValue: -1 })
    expect(parse).toThrow()
  })

  it('accepts proteinBiologicalValue at boundaries (0 and 100)', () => {
    expect(CulturalMetadataSchema.parse({ proteinBiologicalValue: 0 }).proteinBiologicalValue).toBe(0)
    expect(CulturalMetadataSchema.parse({ proteinBiologicalValue: 100 }).proteinBiologicalValue).toBe(100)
  })
})

describe('CulturalMetadata in FoodSchema', () => {
  it('food() factory accepts culturalMetadata and preserves all fields', () => {
    const meta: CulturalMetadata = {
      traditionalCuisine: true,
      socialEating: true,
      cookingTechnique: 'stew',
      geographicOrigin: 'Mediterráneo',
      proteinBiologicalValue: 92,
      erMedDiet: true,
    }
    const f = food({
      id: 'test-lentejas', name: 'Lentejas', category: 'legumes',
      gramsPerRation: 60, kcalPer100g: 340, proteinPer100g: 24,
      carbsPer100g: 54, fiberPer100g: 11, fatPer100g: 1.5,
      carbonFootprint: 0.8, isSeasonal: true, culturalMetadata: meta,
    })
    expect(f.culturalMetadata).toBeDefined()
    expect(f.culturalMetadata!.traditionalCuisine).toBe(true)
    expect(f.culturalMetadata!.socialEating).toBe(true)
    expect(f.culturalMetadata!.cookingTechnique).toBe('stew')
    expect(f.culturalMetadata!.geographicOrigin).toBe('Mediterráneo')
    expect(f.culturalMetadata!.proteinBiologicalValue).toBe(92)
    expect(f.culturalMetadata!.erMedDiet).toBe(true)
  })

  it('food() factory works correctly without culturalMetadata (backward-compatible)', () => {
    const f = food({
      id: 'test-manzana', name: 'Manzana', category: 'fruits',
      gramsPerRation: 150, kcalPer100g: 52, proteinPer100g: 0.3,
      carbsPer100g: 14, fiberPer100g: 2.4, fatPer100g: 0.2,
      carbonFootprint: 0.3, isSeasonal: true,
    })
    expect(f.culturalMetadata).toBeUndefined()
    expect(f.name).toBe('Manzana')
  })
})

describe('Dataset integrity: 6 traditional dishes have culturalMetadata', () => {
  const TRADITIONAL_IDS = [
    'legume-lentejas',
    'legume-garbanzos',
    'legume-alubias',
    'fish-bacalao',
    'fish-sardinas',
    'oil-aove',
  ]

  for (const id of TRADITIONAL_IDS) {
    it(`${id} has culturalMetadata with expected flags`, () => {
      const dish = foodsById.get(id)
      expect(dish, `${id} should exist in catalog`).toBeDefined()
      const meta = dish!.culturalMetadata
      expect(meta, `${id} should have culturalMetadata`).toBeDefined()
      expect(meta!.traditionalCuisine, `${id}.traditionalCuisine`).toBe(true)
      expect(meta!.erMedDiet, `${id}.erMedDiet`).toBe(true)
    })
  }

  it('lentejas, garbanzos, alubias have socialEating and stew technique', () => {
    for (const id of ['legume-lentejas', 'legume-garbanzos', 'legume-alubias']) {
      const meta = foodsById.get(id)!.culturalMetadata!
      expect(meta.socialEating, `${id}.socialEating`).toBe(true)
      expect(meta.cookingTechnique, `${id}.cookingTechnique`).toBe('stew')
    }
  })

  it('bacalao has geographicOrigin and proteinBiologicalValue', () => {
    const meta = foodsById.get('fish-bacalao')!.culturalMetadata!
    expect(meta.geographicOrigin).toBe('Atlántico Norte')
    expect(meta.proteinBiologicalValue).toBe(92)
  })

  it('sardinas has geographicOrigin', () => {
    const meta = foodsById.get('fish-sardinas')!.culturalMetadata!
    expect(meta.geographicOrigin).toBe('Mediterráneo')
  })

  it('AOVE has geographicOrigin', () => {
    const meta = foodsById.get('oil-aove')!.culturalMetadata!
    expect(meta.geographicOrigin).toBe('Mediterráneo')
  })
})

describe('Dataset integrity: non-traditional foods have NO culturalMetadata', () => {
  const NON_TRADITIONAL_IDS = [
    'cereal-pan-integral',
    'veg-brocoli',
    'fruit-manzana',
    'dairy-leche-semidesnatada',
    'egg-huevo',
    'meat-pollo',
    'water-agua',
    'proc-embutido-chorizo',
  ]

  for (const id of NON_TRADITIONAL_IDS) {
    it(`${id} does NOT have culturalMetadata`, () => {
      const food = foodsById.get(id)
      expect(food, `${id} should exist in catalog`).toBeDefined()
      expect(food!.culturalMetadata, `${id} should NOT have culturalMetadata`).toBeUndefined()
    })
  }
})
