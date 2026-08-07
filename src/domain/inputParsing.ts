import { ValidationError } from './errors';

const NUMERIC_RE = /^\d+(\.\d+)?$/;

/**
 * Parse a string value to a number, validating it's within the specified range.
 *
 * @param value - The string value to parse
 * @param max - Maximum allowed value
 * @param min - Minimum allowed value (default: 0)
 * @returns The parsed number
 * @throws ValidationError if the value is not numeric or out of range
 */
export function parseNumeric(value: string, max: number, min = 0): number {
  const cleaned = value.trim();

  if (!NUMERIC_RE.test(cleaned)) {
    const num = parseFloat(cleaned);
    if (Number.isNaN(num)) {
      throw new ValidationError('INVALID_NUMERIC_INPUT', { value, max, min });
    }
    throw new ValidationError('INVALID_NUMERIC_INPUT', { value, max, min });
  }

  const num = parseFloat(cleaned);
  if (num < min || num > max) {
    throw new ValidationError('INVALID_NUMERIC_INPUT', { value: num, max, min });
  }

  return num;
}
