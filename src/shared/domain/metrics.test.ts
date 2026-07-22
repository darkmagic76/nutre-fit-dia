import { describe, it, expect } from 'vitest';
import { UserProfileSchema } from './metrics';

const VALID_PROFILE = {
  diagnosisAge: 50,
  currentAge: 55,
  weight: 80,
  height: 170,
  gender: 'male' as const,
  physicalActivityFactor: 1.2,
  imc: 27.7,
};

describe('UserProfileSchema', () => {
  it('accepts a valid profile', () => {
    const result = UserProfileSchema.safeParse(VALID_PROFILE);
    expect(result.success).toBe(true);
  });

  it('rejects missing diagnosisAge', () => {
    const { diagnosisAge: _, ...invalid } = VALID_PROFILE;
    const result = UserProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects negative diagnosisAge', () => {
    const result = UserProfileSchema.safeParse({ ...VALID_PROFILE, diagnosisAge: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects diagnosisAge over 120', () => {
    const result = UserProfileSchema.safeParse({ ...VALID_PROFILE, diagnosisAge: 121 });
    expect(result.success).toBe(false);
  });

  it('rejects diagnosisAge with decimals', () => {
    const result = UserProfileSchema.safeParse({ ...VALID_PROFILE, diagnosisAge: 50.5 });
    expect(result.success).toBe(false);
  });

  it('rejects gender outside enum', () => {
    const result = UserProfileSchema.safeParse({ ...VALID_PROFILE, gender: 'other' });
    expect(result.success).toBe(false);
  });

  it('accepts both valid genders', () => {
    const male = UserProfileSchema.safeParse(VALID_PROFILE);
    expect(male.success).toBe(true);
    const female = UserProfileSchema.safeParse({ ...VALID_PROFILE, gender: 'female' });
    expect(female.success).toBe(true);
  });
});
