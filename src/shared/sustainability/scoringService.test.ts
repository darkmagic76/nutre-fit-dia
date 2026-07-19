import { describe, it, expect } from 'vitest'
import { computeEnvironmentalScore } from './scoringService'
import { Seasonality, Proximity, PackagingLevel } from './types'
import { food } from '@shared/domain'

describe('computeEnvironmentalScore', () => {
  // ─── Carbon footprint categorization ───

  it('scores very_low carbon (legumes: 0.8 kg CO2eq/kg) as 100', () => {
    const f = food({
      id: 'l1', name: 'Lentejas', category: 'legumes', gramsPerRation: 60,
      kcalPer100g: 340, proteinPer100g: 24, carbsPer100g: 54, fatPer100g: 1.5,
      fiberPer100g: 11, carbonFootprint: 0.8, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.carbonFootprint).toBe(0.8)
  })

  it('scores low carbon (fish: 1.5 kg CO2eq/kg) correctly', () => {
    const f = food({
      id: 's1', name: 'Sardinas', category: 'fish', gramsPerRation: 150,
      kcalPer100g: 170, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 10,
      fiberPer100g: 0, carbonFootprint: 1.5, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('scores moderate carbon (eggs: 3.0 kg CO2eq/kg) correctly', () => {
    const f = food({
      id: 'e1', name: 'Huevo', category: 'eggs', gramsPerRation: 100,
      kcalPer100g: 150, proteinPer100g: 13, carbsPer100g: 0.5, fatPer100g: 10,
      saturatedFatPer100g: 3.3, fiberPer100g: 0, carbonFootprint: 3, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.score).toBeGreaterThanOrEqual(50)
    expect(result.score).toBeLessThan(80)
  })

  it('scores high carbon (white meat: 5.0 kg CO2eq/kg) correctly', () => {
    const f = food({
      id: 'c1', name: 'Pollo', category: 'white_meat', gramsPerRation: 150,
      kcalPer100g: 110, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 1.5,
      saturatedFatPer100g: 0.5, fiberPer100g: 0, carbonFootprint: 5, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.score).toBeLessThan(70)
  })

  it('scores very_high carbon (chorizo: 8.0 kg CO2eq/kg) correctly', () => {
    const f = food({
      id: 'ch1', name: 'Chorizo', category: 'white_meat', gramsPerRation: 50,
      kcalPer100g: 350, proteinPer100g: 20, carbsPer100g: 1, fatPer100g: 30,
      saturatedFatPer100g: 11, fiberPer100g: 0, carbonFootprint: 8, isSeasonal: false,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.score).toBeLessThan(40)
  })

  // ─── Missing / undefined carbon footprint ───

  it('assigns neutral score (50) when carbonFootprint is missing', () => {
    const f = food({
      id: 'u1', name: 'Unknown', category: 'vegetables', gramsPerRation: 100,
      kcalPer100g: 50, proteinPer100g: 2, carbsPer100g: 10, fatPer100g: 0.5,
      fiberPer100g: 2, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.carbonFootprint).toBe(0)
    // Neutral carbon (50) × 0.50 = 25, seasonal (100) × 0.30 = 30, km0 (100) × 0.20 = 20
    expect(result.score).toBe(75)
  })

  // ─── Seasonality ───

  it('maps isSeasonal=true to IN_SEASON', () => {
    const f = food({
      id: 's2', name: 'Tomate', category: 'vegetables', gramsPerRation: 150,
      kcalPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2,
      fiberPer100g: 1.2, carbonFootprint: 1.1, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.seasonality).toBe(Seasonality.IN_SEASON)
  })

  it('maps isSeasonal=false to OUT_OF_SEASON', () => {
    const f = food({
      id: 's3', name: 'Tomate invierno', category: 'vegetables', gramsPerRation: 150,
      kcalPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2,
      fiberPer100g: 1.2, carbonFootprint: 1.1, isSeasonal: false,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.seasonality).toBe(Seasonality.OUT_OF_SEASON)
  })

  // ─── Proximity inference (V1 simplified) ───

  it('infers proximity=km0 from seasonal food', () => {
    const f = food({
      id: 'p1', name: 'Local', category: 'vegetables', gramsPerRation: 100,
      kcalPer100g: 30, proteinPer100g: 1, carbsPer100g: 5, fatPer100g: 0.2,
      fiberPer100g: 1, carbonFootprint: 0.3, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.proximity).toBe(Proximity.LOCAL_KM0)
  })

  it('infers proximity=national from non-seasonal food', () => {
    const f = food({
      id: 'p2', name: 'Importado', category: 'fruits', gramsPerRation: 150,
      kcalPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 12, fatPer100g: 0.2,
      fiberPer100g: 2, carbonFootprint: 0.5, isSeasonal: false,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.proximity).toBe(Proximity.NATIONAL)
  })

  // ─── Packaging (V1 default) ───

  it('defaults packaging to BULK for V1', () => {
    const f = food({
      id: 'pkg1', name: 'Test', category: 'vegetables', gramsPerRation: 100,
      kcalPer100g: 30, proteinPer100g: 1, carbsPer100g: 5, fatPer100g: 0.2,
      fiberPer100g: 1, carbonFootprint: 1, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.packaging).toBe(PackagingLevel.BULK)
  })

  // ─── Composite score verification ───

  it('best-case food (very low carbon + seasonal) scores ≥ 80', () => {
    const f = food({
      id: 'best', name: 'Espinaca local', category: 'vegetables', gramsPerRation: 150,
      kcalPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4,
      fiberPer100g: 2.2, carbonFootprint: 0.2, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    // Carbon very_low=100 × 0.50 = 50, seasonal=100 × 0.30 = 30, km0=100 × 0.20 = 20
    expect(result.score).toBe(100)
  })

  it('worst-case food (very high carbon + not seasonal) scores ≤ 30', () => {
    const f = food({
      id: 'worst', name: 'Chorizo importado', category: 'white_meat', gramsPerRation: 50,
      kcalPer100g: 350, proteinPer100g: 20, carbsPer100g: 1, fatPer100g: 30,
      saturatedFatPer100g: 11, fiberPer100g: 0, carbonFootprint: 8, isSeasonal: false,
    })
    const result = computeEnvironmentalScore(f)
    // Carbon very_high=20 × 0.50 = 10, out_of_season=30 × 0.30 = 9, national=60 × 0.20 = 12
    expect(result.score).toBe(31)
  })

  // ─── Water footprint (V1 always 0) ───

  it('sets waterFootprint to 0 for V1', () => {
    const f = food({
      id: 'w1', name: 'Water test', category: 'water', gramsPerRation: 250,
      kcalPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0,
      fiberPer100g: 0, carbonFootprint: 0.001, isSeasonal: true,
    })
    const result = computeEnvironmentalScore(f)
    expect(result.waterFootprint).toBe(0)
  })
})
