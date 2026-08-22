import { describe, it, expect } from 'vitest';
import { CaloricTargetOutputSchema } from './caloricTargetService';
import { makeCaloricTargetOutput } from '@/test/fixtures';

describe('CaloricTargetOutputSchema', () => {
  it('accepts a well-formed caloric target output', () => {
    const result = CaloricTargetOutputSchema.safeParse(makeCaloricTargetOutput());
    expect(result.success).toBe(true);
  });

  it('rejects an object missing a required field', () => {
    const { tdee: _omit, ...withoutTdee } = makeCaloricTargetOutput();
    const result = CaloricTargetOutputSchema.safeParse(withoutTdee);
    expect(result.success).toBe(false);
  });

  it('rejects an object with a field of the wrong type', () => {
    const invalid = { ...makeCaloricTargetOutput(), bmr: '1400' };
    const result = CaloricTargetOutputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
