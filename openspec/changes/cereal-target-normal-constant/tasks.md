# Tasks: cereal-target-normal-constant

## Work Unit 1: Centralize cereal target constant

- [x] T1: Add `CEREAL_TARGET_NORMAL = 5` export to `src/domain/clinical.ts` with JSDoc: "Internal design decision — midpoint of AESAN 3-6 range for normal (non-restricted) daily cereal target"
- [x] T2: Add `CEREAL_TARGET_NORMAL` to the `@domain/clinical` import in `src/application/services/planGenerator.ts` (extend existing line 4)
- [x] T3: Remove `const CEREAL_DAILY_NORMAL = 5` from `src/application/services/planGenerator.ts` (line 26)
- [x] T4: Replace `CEREAL_DAILY_NORMAL` → `CEREAL_TARGET_NORMAL` in `planGenerator.ts` line 38

## Work Unit 2: Update clinical-thresholds spec

- [x] T5: Update `REQ-CLINICAL-CENTRALIZATION` scenario in `openspec/specs/clinical-thresholds/spec.md`: "all 14 thresholds" → "all 17 thresholds"
- [x] T6: Delete `REQ-VEGETABLE-NUDGE-REEXPORT` section from `openspec/specs/clinical-thresholds/spec.md`

## Verification

- [x] T7: Run `pnpm quality` (format + lint + typecheck + test) — all green
- [x] T8: Confirm `pnpm test:run` passes with 933 tests

## Archive Notes

**Why SDD cycle was truncated (explore → propose → spec → design → tasks → apply → verify → archive):**
This is a 3-file, 5-line refactor with zero behavior change (value 5 → 5). The full SDD cycle is designed for substantial feature work where durable proposal/spec/design/tasks materially reduce ambiguity. For a constant extraction, the explore/design/spec phases would produce artifacts with no decision value. The spec was created to document the change scope and update the stale clinical-thresholds spec, but the apply skipped directly because the implementation was trivially understood from the spec itself.

**Why TDD strict cycle was not followed (RED → GREEN → REFACTOR + triangulation):**
No new behavior was introduced. The value `5` was already exercised by all 933 existing tests through `buildMealSlots`. There is no new function, no new branch, no new edge case to triangulate. The RED phase would require writing a test that fails because a constant is module-scoped instead of centralized — which is an architectural concern, not a behavioral one. TDD proves behavior, not structure. The existing test suite already proves the behavior is correct.

**RDD review:** Medium risk, 1 lens (review-reliability), PASS. Lineage: `review-2084d865fd5d5c82`. Receipt verified by pre-commit hook.

**Commit:** `b4000b8` on `develop`.
