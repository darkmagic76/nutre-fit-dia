# Tasks: M5 FR-MATRIX Sync

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~20-30 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

Not needed — single-file documentation change under 30 lines.

## Phase 1: Audit & Verify (all rows against source code)

- [x] 1.1 Audit all 17 FR/RF/RNF rows in `adr/FR-MATRIX-trazabilidad.md` — confirm each ✅/🔶/📄 status matches `src/` implementation
- [x] 1.2 Audit all 7 SPEC_TECH rows — verify each ✅/🔜 status against codebase reality
- [x] 1.3 Verify M1 (Substitution Service), M2 (Nudge Inteligente), M3 (Convivialidad), M4 (ZeroWaste) are reflected in the matrix with correct status and coverage references
- [x] 1.4 Confirm test count (353) and date (2026-07-19) in matrix header — update if stale
- [x] 1.5 Run `pnpm quality` to confirm 353 tests still green — attach output to verify-report

## Phase 2: Apply Fixes

- [x] 2.1 Update any status/coverage mismatches found in audit — `adr/FR-MATRIX-trazabilidad.md`
- [x] 2.2 Update `TASKS.md` M5 status from "Actualizar matriz de trazabilidad..." to ✅ Completed
- [x] 2.3 Remove the "FR-MATRIX desactualizada" warning note in TASKS.md (lines 99-100) once matrix is synced
