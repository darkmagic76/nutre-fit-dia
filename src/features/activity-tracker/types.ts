/**
 * Lightweight branded type for moderate-activity minutes.
 *
 * ## "validation" note
 *
 * The {@link ModerateMinutes} constructor enforces `min ≥ 0` at the boundary
 * where user-input minutes transition from a raw numeric string to a typed value.
 * Invalid inputs (negative, NaN) are clamped to 0 — this matches the existing
 * `Number(minutes) || 0` coercion behavior while adding compile-time type safety
 * via the branded type.
 */
export type ModerateMinutes = number & { readonly __brand: 'ModerateMinutes' };

/**
 * Constructs a {@link ModerateMinutes} value with runtime validation.
 *
 * Rules:
 * - `value >= 0` → returns the value as `ModerateMinutes`
 * - `value < 0` or `NaN` → returns `0 as ModerateMinutes`
 */
export function ModerateMinutes(value: number): ModerateMinutes {
  if (Number.isNaN(value) || value < 0) return 0 as ModerateMinutes;
  return value as ModerateMinutes;
}
