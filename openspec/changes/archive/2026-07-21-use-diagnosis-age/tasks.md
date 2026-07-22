# Tasks: Use Diagnosis Age to Adjust Caloric Restriction Aggressiveness

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 100–140 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Core Algorithm (TDD)

- [x] 1.1 RED: Write unit tests for `getDiagnosisModifier()` in `src/shared/services/caloricTargetService.test.ts` — 6 scenarios: diagnosisAge 0→0.85, 25→1.0, 39→1.0, 40→0.85, 60→0.85, 61→0.7, NaN→0.85 (spec R1–R4 boundaries)
- [x] 1.2 GREEN: Implement `getDiagnosisModifier()` as exported pure function in `src/shared/services/caloricTargetService.ts` with bracket constants (`DIAGNOSIS_AGE_EARLY_THRESHOLD=40`, `DIAGNOSIS_AGE_LATE_THRESHOLD=60`, modifiers `1.0`/`0.85`/`0.7`)
- [x] 1.3 RED: Write integration tests for `computeCaloricTarget()` with diagnosisAge in `src/shared/services/caloricTargetService.test.ts` — coverage: full headroom per bracket, 30% cap override, floor enforcement, BMR/TDEE isolation (spec R5–R6)
- [x] 1.4 GREEN: Integrate modifier into `computeCaloricTarget()` — insert `modifier = getDiagnosisModifier(diagnosisAge)` → `adjustedDeficit = Math.round(PREDIMED_PLUS_DEFICIT_KCAL * modifier)` between `restrictionActive` check and `rawDeficit` capping; update existing test expectations for `diagnosisAge: 50` (deficit changes from 574 → 488)

## Phase 2: Documentation

- [x] 2.1 Amend `adr/ADR-004-caloric-target-algorithm.md` — add `diagnosisAge` as algorithm input, document modifier brackets and constants, note clinical validation deferred to RNF-01
- [x] 2.2 Update `adr/FR-MATRIX-trazabilidad.md` — change FR-4.1 from `🔶 data-only` to `✅ full implementation` with brief note on phenotypic filtering

## Phase 3: Verification

- [x] 3.1 Run `pnpm test:run` — all unit + integration tests pass (existing + new)
- [x] 3.2 Run `pnpm tsc -b` — zero type errors
- [ ] 3.3 Smoke-check metabolic tracker UI (`pnpm dev`) — verify target values reflect modifier without visual regressions
