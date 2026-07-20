import { describe, it, expect } from 'vitest'
import { computeCaloricTarget } from './caloricTargetService'
import type { CaloricTargetInput } from './caloricTargetService'

describe('caloricTargetService', () => {
  const baseInput: CaloricTargetInput = {
    weight: 80,
    height: 170,
    age: 55,
    gender: 'male',
    physicalActivityFactor: 1.2,
    imc: 27.7, // overweight
    diagnosisAge: 50,
  }

  describe('BMR (Mifflin-St Jeor)', () => {
    it('computes male BMR correctly', () => {
      const result = computeCaloricTarget(baseInput)
      // 10*80 + 6.25*170 - 5*55 + 5 = 800 + 1062.5 - 275 + 5 = 1592.5 → 1593
      expect(result.bmr).toBe(1593)
    })

    it('computes female BMR correctly', () => {
      const result = computeCaloricTarget({
        ...baseInput,
        gender: 'female',
        weight: 65,
        height: 165,
        age: 45,
        imc: 23.9,
      })
      // 10*65 + 6.25*165 - 5*45 - 161 = 650 + 1031.25 - 225 - 161 = 1295.25 → 1295
      expect(result.bmr).toBe(1295)
    })
  })

  describe('TDEE', () => {
    it('multiplies BMR by physical activity factor', () => {
      const result = computeCaloricTarget(baseInput)
      expect(result.tdee).toBe(Math.round(1593 * 1.2)) // 1912
    })
  })

  describe('Deficit — conditional on IMC > 25 (SPECS_RF RF-02)', () => {
    it('applies deficit when IMC > 25', () => {
      const result = computeCaloricTarget(baseInput) // IMC 27.7
      expect(result.restrictionActive).toBe(true)
      expect(result.deficit).toBeGreaterThan(0)
    })

    it('applies 600 kcal deficit when TDEE allows (30% cap not hit)', () => {
      const result = computeCaloricTarget(baseInput)
      // TDEE ≈ 1912, 30% = 574, 600 > 574 → deficit = 574
      expect(result.deficit).toBe(574)
      expect(result.target).toBe(1338)
    })

    it('caps deficit at 30% of TDEE for high TDEE individuals', () => {
      const result = computeCaloricTarget({
        ...baseInput,
        weight: 100,
        height: 180,
        age: 30,
        physicalActivityFactor: 1.55,
        imc: 30.9,
      })
      // BMR = 10*100 + 6.25*180 - 5*30 + 5 = 1000 + 1125 - 150 + 5 = 1980
      // TDEE ≈ 1980 * 1.55 = 3069
      // 30% = 921 → min(600, 921) = 600
      expect(result.deficit).toBe(600)
    })

    it('does NOT apply deficit when IMC ≤ 25', () => {
      const result = computeCaloricTarget({
        ...baseInput,
        weight: 70,
        height: 170,
        imc: 24.2, // normal weight
      })
      expect(result.restrictionActive).toBe(false)
      expect(result.deficit).toBe(0)
      expect(result.target).toBe(result.tdee)
    })

    it('IMC exactly 25 triggers no deficit (boundary: ≤ 25)', () => {
      const result = computeCaloricTarget({
        ...baseInput,
        weight: 72.25,
        height: 170,
        imc: 25.0,
      })
      expect(result.restrictionActive).toBe(false)
      expect(result.deficit).toBe(0)
    })

    it('IMC 25.1 triggers deficit (boundary: > 25)', () => {
      const result = computeCaloricTarget({
        ...baseInput,
        weight: 72.6,
        height: 170,
        imc: 25.1,
      })
      expect(result.restrictionActive).toBe(true)
      expect(result.deficit).toBeGreaterThan(0)
    })
  })

  describe('Safety floor — 1200 kcal minimum', () => {
    it('never goes below 1200 kcal', () => {
      const result = computeCaloricTarget({
        ...baseInput,
        weight: 45,
        height: 150,
        age: 80,
        gender: 'female',
        physicalActivityFactor: 1.2,
        imc: 20,
      })
      // BMR would be very low, but target >= 1200
      expect(result.target).toBeGreaterThanOrEqual(1200)
    })
  })

  describe('restrictionActive flag', () => {
    it('is true when IMC > 25', () => {
      const result = computeCaloricTarget({ ...baseInput, imc: 27 })
      expect(result.restrictionActive).toBe(true)
    })

    it('is false when IMC ≤ 25', () => {
      const result = computeCaloricTarget({ ...baseInput, imc: 23 })
      expect(result.restrictionActive).toBe(false)
    })
  })
})
