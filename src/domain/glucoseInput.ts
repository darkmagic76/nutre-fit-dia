/**
 * Lightweight branded type for glucose biomarker input values (mg/dL).
 *
 * ## "validation" note
 *
 * The {@link GlucoseInput} constructor enforces `value > 0` at the boundary
 * where raw glucose strings are parsed into typed numeric values. Invalid inputs
 * (non-positive, NaN) are clamped to 0 — the existing validation logic in
 * {@link trackerStore.calculateTarget} already rejects `≤ 0` values with a
 * `profileError`. This wrapper adds compile-time type safety via the branded type.
 */
export type GlucoseInput = number & { readonly __brand: 'GlucoseInput' };

/**
 * Constructs a {@link GlucoseInput} value with runtime validation.
 *
 * Rules:
 * - `value > 0` → returns the value as `GlucoseInput`
 * - `value <= 0` or `NaN` → returns `0 as GlucoseInput`
 */
export function GlucoseInput(value: number): GlucoseInput {
  if (Number.isNaN(value) || value <= 0) return 0 as GlucoseInput;
  return value as GlucoseInput;
}
