import { describe, it, expect } from 'vitest';
import { RationValidationResultSchema } from './rationValidator';
import { makeRationValidationResult, makeViolation } from '@/test/fixtures';

describe('RationValidationResultSchema', () => {
  it('accepts a valid empty result', () => {
    const result = RationValidationResultSchema.safeParse(makeRationValidationResult());
    expect(result.success).toBe(true);
  });

  it('accepts a result with well-formed violations', () => {
    const withViolation = makeRationValidationResult({
      valid: false,
      violations: [makeViolation()],
    });
    const result = RationValidationResultSchema.safeParse(withViolation);
    expect(result.success).toBe(true);
  });

  it('rejects a result missing animalProteinCount', () => {
    const { animalProteinCount: _omit, ...invalid } = makeRationValidationResult();
    const result = RationValidationResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects a violation with an invalid direction', () => {
    const invalid = makeRationValidationResult({
      violations: [makeViolation({ direction: 'sideways' as 'over' })],
    });
    const result = RationValidationResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
