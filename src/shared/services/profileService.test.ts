import { describe, it, expect } from 'vitest';
import { computeIMC, validateProfile, buildProfile } from './profileService';
import type { ProfileInput } from './profileService';

// R1: computeIMC — re-exported from @shared/utils/imc
describe('computeIMC', () => {
  // Scenario: Standard calculation
  it('returns BMI for weight 70kg and height 170cm (24.2)', () => {
    expect(computeIMC(70, 170)).toBe(24.2);
  });

  // Scenario: Zero or negative input returns NaN
  it('returns NaN for zero weight', () => {
    expect(computeIMC(0, 170)).toBeNaN();
  });

  it('returns NaN for negative height', () => {
    expect(computeIMC(70, -10)).toBeNaN();
  });
});

// R2: validateProfile
describe('validateProfile', () => {
  const validInput: ProfileInput = {
    weight: 80,
    height: 170,
    age: 55,
    diagnosisAge: 45,
    gender: 'female',
    glucose: 100,
    physicalActivityFactor: 1.2,
  };

  // Scenario: Valid profile returns no errors
  it('returns valid=true with no errors for a well-formed profile', () => {
    const result = validateProfile(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // Scenario: Diagnosis age exceeds current age
  it('flags diagnosisAge when it exceeds currentAge', () => {
    const input = { ...validInput, diagnosisAge: 60, age: 55 };
    const result = validateProfile(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('diagnosisAge');
  });

  // Scenario: Negative glucose
  it('flags glucose when it is negative', () => {
    const input = { ...validInput, glucose: -5 };
    const result = validateProfile(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'glucose')).toBe(true);
  });

  it('flags zero glucose as invalid (required for metabolic profile)', () => {
    const input = { ...validInput, glucose: 0 };
    const result = validateProfile(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'glucose')).toBe(true);
  });

  // Edge cases: zero or negative weight/height/age
  it('flags weight when zero or negative', () => {
    const result = validateProfile({ ...validInput, weight: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'weight')).toBe(true);
  });

  it('flags height when zero or negative', () => {
    const result = validateProfile({ ...validInput, height: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'height')).toBe(true);
  });

  it('flags age when zero or negative', () => {
    const result = validateProfile({ ...validInput, age: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'age')).toBe(true);
  });

  // Multiple errors at once
  it('accumulates multiple validation errors', () => {
    const input = { ...validInput, weight: -1, height: 0, glucose: -10 };
    const result = validateProfile(input);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

// R3: buildProfile
describe('buildProfile', () => {
  // Scenario: Partial input filled with defaults
  it('fills unset fields with defaults and computes IMC', () => {
    const result = buildProfile({ weight: 70, height: 170 });
    expect(result.weight).toBe(70);
    expect(result.height).toBe(170);
    expect(result.imc).toBe(24.2);
    expect(result.age).toBe(55); // default
    expect(result.gender).toBe('male'); // default
    expect(result.diagnosisAge).toBe(55); // default
  });

  // Scenario: Full input preserved
  it('preserves all provided values and computes IMC', () => {
    const result = buildProfile({
      weight: 80,
      height: 175,
      age: 45,
      diagnosisAge: 40,
      gender: 'female',
      physicalActivityFactor: 1.55,
    });
    expect(result.weight).toBe(80);
    expect(result.height).toBe(175);
    expect(result.age).toBe(45);
    expect(result.diagnosisAge).toBe(40);
    expect(result.gender).toBe('female');
    expect(result.physicalActivityFactor).toBe(1.55);
    expect(result.imc).toBe(26.1); // 80 / (1.75^2) = 26.12 → 26.1
  });

  // Computes IMC from provided weight/height even when rest is default
  it('computes IMC correctly from provided weight and height', () => {
    const result = buildProfile({ weight: 65, height: 160 });
    expect(result.imc).toBe(25.4); // 65 / (1.6^2) = 25.39 → 25.4
  });
});
