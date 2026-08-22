# Design: cereal-target-normal-constant

## Approach

Three surgical edits, zero behavior change:

1. **Add constant to `clinical.ts`**: Insert `CEREAL_TARGET_NORMAL = 5` in the nutritional thresholds section, right after `CEREAL_MIN_RATIONS`. Honest source: "Internal design decision — midpoint of AESAN 3-6 range".

2. **Update `planGenerator.ts`**: Add `CEREAL_TARGET_NORMAL` to the existing `@domain/clinical` import (line 4). Remove the module-scoped `const CEREAL_DAILY_NORMAL = 5` (line 26). Replace the usage on line 38 (`CEREAL_DAILY_NORMAL` → `CEREAL_TARGET_NORMAL`).

3. **Update `clinical-thresholds/spec.md`**: Fix "14 thresholds" → "17 thresholds". Delete `REQ-VEGETABLE-NUDGE-REEXPORT` section entirely.

## Risk Assessment

- **Risk**: None. Value is unchanged (5 → 5). No test changes needed.
- **Rollback**: Trivial — revert 3 file edits.
- **Dependencies**: None. Self-contained change.

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| `src/domain/clinical.ts` | Add `CEREAL_TARGET_NORMAL = 5` export | +3 |
| `src/application/services/planGenerator.ts` | Import constant, remove local const, update usage | ~3 |
| `openspec/specs/clinical-thresholds/spec.md` | Fix count, remove stale requirement | ~10 |
