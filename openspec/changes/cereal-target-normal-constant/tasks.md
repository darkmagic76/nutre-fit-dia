# Tasks: cereal-target-normal-constant

## Work Unit 1: Centralize cereal target constant

- [ ] T1: Add `CEREAL_TARGET_NORMAL = 5` export to `src/domain/clinical.ts` with JSDoc: "Internal design decision — midpoint of AESAN 3-6 range for normal (non-restricted) daily cereal target"
- [ ] T2: Add `CEREAL_TARGET_NORMAL` to the `@domain/clinical` import in `src/application/services/planGenerator.ts` (extend existing line 4)
- [ ] T3: Remove `const CEREAL_DAILY_NORMAL = 5` from `src/application/services/planGenerator.ts` (line 26)
- [ ] T4: Replace `CEREAL_DAILY_NORMAL` → `CEREAL_TARGET_NORMAL` in `planGenerator.ts` line 38

## Work Unit 2: Update clinical-thresholds spec

- [ ] T5: Update `REQ-CLINICAL-CENTRALIZATION` scenario in `openspec/specs/clinical-thresholds/spec.md`: "all 14 thresholds" → "all 17 thresholds"
- [ ] T6: Delete `REQ-VEGETABLE-NUDGE-REEXPORT` section from `openspec/specs/clinical-thresholds/spec.md`

## Verification

- [ ] T7: Run `pnpm quality` (format + lint + typecheck + test) — all green
- [ ] T8: Confirm `pnpm test:run` passes with 933 tests
