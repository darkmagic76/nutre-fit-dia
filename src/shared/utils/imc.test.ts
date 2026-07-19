import { describe, it, expect } from 'vitest'
import { computeIMC, imcClassification, isRestrictionCandidate } from './imc'

describe('computeIMC', () => {
  it('computes IMC correctly (80kg, 170cm)', () => {
    expect(computeIMC(80, 170)).toBe(27.7)
  })

  it('returns normal IMC for healthy weight', () => {
    const imc = computeIMC(65, 170)
    expect(imc).toBeGreaterThanOrEqual(22)
    expect(imc).toBeLessThanOrEqual(23)
  })

  it('rounds to one decimal place', () => {
    const imc = computeIMC(70, 175)
    const decimalPart = imc.toString().split('.')[1]
    expect(decimalPart?.length).toBeLessThanOrEqual(1)
  })
})

describe('imcClassification', () => {
  it('classifies underweight (IMC < 18.5)', () => {
    expect(imcClassification(17)).toBe('underweight')
  })

  it('classifies normal (18.5 ≤ IMC < 25)', () => {
    expect(imcClassification(22)).toBe('normal')
  })

  it('classifies overweight (25 ≤ IMC < 30)', () => {
    expect(imcClassification(27)).toBe('overweight')
  })

  it('classifies obese (IMC ≥ 30)', () => {
    expect(imcClassification(35)).toBe('obese')
  })
})

describe('isRestrictionCandidate', () => {
  it('returns true for IMC > 25', () => {
    expect(isRestrictionCandidate(27.7)).toBe(true)
  })

  it('returns false for IMC = 25', () => {
    expect(isRestrictionCandidate(25)).toBe(false)
  })

  it('returns false for IMC < 25', () => {
    expect(isRestrictionCandidate(22)).toBe(false)
  })
})
