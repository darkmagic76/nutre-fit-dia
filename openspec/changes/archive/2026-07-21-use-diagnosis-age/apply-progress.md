# Apply Progress: Use Diagnosis Age to Adjust Caloric Restriction Aggressiveness

**Date**: 2026-07-21
**Mode**: Strict TDD
**Delivery**: single-pr

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `caloricTargetService.test.ts` | Unit | ✅ 12/12 | ✅ Written — 12 tests (0, NaN, -5, 1, 25, 39, 40, 50, 60, 61, 70, 100) | ✅ Passed | ✅ 12 cases across R1–R4 | ➖ Clean |
| 1.2 | `caloricTargetService.ts` | — | — | — | ✅ Implemented `getDiagnosisModifier()` with bracket constants | — | ✅ Constants extracted, pure function |
| 1.3 | `caloricTargetService.test.ts` | Integration | ✅ 24/24 | ✅ Written — 16 tests covering R1–R6 | ✅ Passed (after 1.4) | ✅ 16 cases across all spec scenarios | ➖ Clean |
| 1.4 | `caloricTargetService.ts` | — | — | — | ✅ Modifier integrated: `adjustedDeficit = Math.round(600 * modifier)` → `Math.min(adjustedDeficit, cap)` | — | ✅ Clean insertion, comments updated |
| 2.1 | `ADR-004-caloric-target-algorithm.md` | — | N/A | N/A | ✅ Added diagnosisAge as input, modifier brackets table, algorithm step 3 updated, consequences extended | N/A | N/A |
| 2.2 | `FR-MATRIX-trazabilidad.md` | — | N/A | N/A | ✅ FR-4.1 coverage updated to reference `getDiagnosisModifier()` with bracket values | N/A | N/A |

## Test Summary
- **Total tests written**: 28 (12 unit + 16 integration)
- **Total tests passing**: 509 / 509
- **Layers used**: Unit (12), Integration (16)
- **Pure functions created**: 1 (`getDiagnosisModifier`)
- **Approval tests**: None — no refactoring tasks

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/shared/services/caloricTargetService.ts` | Modified (lines 17–29, 65–72) | Added `getDiagnosisModifier()` pure function with bracket constants; integrated into `computeCaloricTarget()` between restriction check and cap |
| `src/shared/services/caloricTargetService.test.ts` | Modified (+28 tests) | Added 12 unit tests for `getDiagnosisModifier()` across all spec brackets; added 16 integration tests for `computeCaloricTarget()` with modifier across R1–R6 scenarios; updated 2 existing test expectations for diagnosisAge=50 (deficit 574→510) |
| `adr/ADR-004-caloric-target-algorithm.md` | Modified | Added amendment (2026-07-21) with modifier bracket table; added `diagnosisAge` to Inputs table; updated algorithm step 3 with modifier flow; added `getDiagnosisModifier` to service signature; extended consequences |
| `adr/FR-MATRIX-trazabilidad.md` | Modified | Updated FR-4.1 coverage to reference `getDiagnosisModifier()` with 1.0/0.85/0.7 brackets; updated timestamp to 2026-07-21 |

## Deviations from Design

**Math correction**: The tasks.md and design.md claim deficit for diagnosisAge=50 changes from 574→488, but the algorithm described in the same documents computes `Math.round(600 * 0.85) = 510, min(510, 574) = 510`. The 488 appears to be `Math.round(574 * 0.85)` (applying modifier after cap), contradicting the explicit design decision to apply modifier BEFORE cap. Implemented correctly as 510 per design data flow diagram and spec R2 scenario.

## Remaining Tasks

- [ ] 3.1 Run `pnpm test:run` — ✅ 509/509 passing
- [ ] 3.2 Run `pnpm tsc -b` — ✅ zero type errors
- [ ] 3.3 Smoke-check metabolic tracker UI — not performed (deferred to verify)

## Status

8/9 tasks complete (all code tasks done + documentation done + verification steps 3.1-3.2 confirmed). Ready for verify (task 3.3 smoke-check).
