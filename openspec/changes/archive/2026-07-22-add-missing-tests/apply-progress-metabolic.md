# Apply Progress: add-tests-metabolic-tracker

## Change
`add-missing-tests` — Phase 2: metabolic-tracker tests (5 new test files)

## Status
**All tasks complete** (2.1 – 2.5). 5 test files created, 26 new tests, 460 total (was 434).

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.1 | `components/ProfileError.test.tsx` | Unit | N/A (new) | ✅ Written | ✅ 2/2 | ✅ 2 cases | ➖ None needed |
| 2.2 | `components/ProfileForm.test.tsx` | Unit | N/A (new) | ✅ Written | ✅ 8/8 | ✅ 8 cases | ➖ None needed |
| 2.3 | `components/ProfileResults.test.tsx` | Unit | N/A (new) | ✅ Written | ✅ 8/8 | ✅ 8 cases | ➖ None needed |
| 2.4 | `MetabolicTrackerView.test.tsx` | Unit | N/A (new) | ✅ Written | ✅ 3/3 | ✅ 3 cases | ➖ None needed |
| 2.5 | `MetabolicTrackerContainer.test.tsx` | Integration | N/A (new) | ✅ Written | ✅ 5/5 | ✅ 5 cases | ➖ None needed |

## Test Summary
- **Total new tests**: 26
- **Total tests passing**: 460 (52 files)
- **Layers used**: Unit (4), Integration (1)
- **Type errors**: 0
- **`pnpm typecheck`**: clean

## Deviations from Spec

### ProfileForm
- Scenarios #4 (validates required), #5 (disabled submit), #6 (error messages) — not implemented in component. ProfileForm has `noValidate`, no client-side validation logic, and the button is always enabled.
- Tested instead: all fields with labels, select options, onSubmit, noValidate + aria-label, optional field behavior.

### ProfileResults
- Scenarios #4 (IMC threshold), #5 (obesity class), #6 (no glucose) — not implemented in component. CaloricTargetOutput has no imc, obesity, or glucose fields. These live in the service, not the presentation layer.
- Remaining scenarios (floor/cap) tested: verified component displays extreme values correctly via fixture data.

### MetabolicTrackerContainer
- Scenario #5 (loading state) — the trackerStore has no loading/status field. Store is synchronous.
- Replaced with a combined scenario (both results + error rendered simultaneously).

## Files Changed
| File | Action | Tests |
|------|--------|-------|
| `src/features/metabolic-tracker/components/ProfileError.test.tsx` | Created | 2 |
| `src/features/metabolic-tracker/components/ProfileForm.test.tsx` | Created | 8 |
| `src/features/metabolic-tracker/components/ProfileResults.test.tsx` | Created | 8 |
| `src/features/metabolic-tracker/MetabolicTrackerView.test.tsx` | Created | 3 |
| `src/features/metabolic-tracker/MetabolicTrackerContainer.test.tsx` | Created | 5 |

## Remaining Tasks (Phase 3)
- [x] 3.1 `pnpm test:run` — all 52 files, 460 tests pass
- [x] 3.2 `pnpm typecheck` — zero type errors
- [ ] 3.3 `git diff --stat src/` — only `*.test.tsx` files; zero production changes
