import { describe, it, expect } from 'vitest';
import { parseNumeric } from './sanitize';
import { ValidationError } from '@shared/errors';

describe('parseNumeric', () => {
  it('parses a valid decimal value', () => {
    expect(parseNumeric('80.5', 300, 0)).toBe(80.5);
  });

  it('parses a valid integer', () => {
    expect(parseNumeric('42', 100, 0)).toBe(42);
  });

  it('throws ValidationError for non-numeric input', () => {
    expect(() => parseNumeric('abc', 300, 30)).toThrow(ValidationError);
  });

  it('throws ValidationError for multiple decimal points', () => {
    expect(() => parseNumeric('80.5.3', 300, 0)).toThrow(ValidationError);
  });

  it('throws ValidationError for empty string', () => {
    expect(() => parseNumeric('', 300, 30)).toThrow(ValidationError);
  });

  it('throws ValidationError for value below min', () => {
    expect(() => parseNumeric('10', 300, 30)).toThrow(ValidationError);
  });

  it('throws ValidationError for value above max', () => {
    expect(() => parseNumeric('999', 300, 0)).toThrow(ValidationError);
  });

  it('includes context in ValidationError', () => {
    let caught: ValidationError | null = null;
    try {
      parseNumeric('abc', 100, 10);
    } catch (e) {
      caught = e as ValidationError;
    }
    expect(caught).toBeInstanceOf(ValidationError);
    expect(caught!.context).toEqual({ value: 'abc', max: 100, min: 10 });
  });
});
