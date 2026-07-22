# Tasks: Add Missing Tests for med-diet-validator and metabolic-tracker

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500–650 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (10 additive test files, shared purpose) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | All 10 test files across both features | Single PR | Additive only; zero production changes; `pnpm test:run` gates merge |

## Phase 1: med-diet-validator Tests (RED → GREEN per file)

- [x] 1.1 `FoodList.test.tsx` — 6 scenarios: empty, items, remove, a11y label, multiple items, list label (deviated: toggle/search/sustainability not in component)
- [x] 1.2 `DailyViolations.test.tsx` — 5 scenarios: no violations, invalid, animal protein, mixed severity, no-foods edge
- [x] 1.3 `CaloricSummary.test.tsx` — 4 scenarios: restriction active/inactive, danger variant (ingested > target), default variant
- [x] 1.4 `DailyLogView.test.tsx` — 7 scenarios: full render, empty state, food list, deficit desc, violations conditional, no summary when null, card title
- [x] 1.5 `MedDietValidatorContainer.test.tsx` — 2 scenarios: default state, with entries (deviated: spec had 4 but validation+caloric covered in second)

## Phase 2: metabolic-tracker Tests (RED → GREEN per file)

- [x] 2.1 `ProfileError.test.tsx` — 2 scenarios: null renders nothing, error renders role="alert"
- [x] 2.2 `ProfileForm.test.tsx` — 8 scenarios: fields, optional, submit, select options, noValidate, aria-label, diagnosisAge optional (deviated: validation/disabled/error messages not in component)
- [x] 2.3 `ProfileResults.test.tsx` — 8 scenarios: BMR/TDEE/deficit/target cards, restriction off/on, 1200 floor, 30% cap, all kcal suffix, aria-live+aria-label (deviated: IMC/obesity/glucose not in component)
- [x] 2.4 `MetabolicTrackerView.test.tsx` — 3 scenarios: all sections, error only, no results
- [x] 2.5 `MetabolicTrackerContainer.test.tsx` — 5 scenarios: pending, success, error, IMC crossing, both results+error (deviated: loading state removed — store has no loading field)

## Phase 3: Verification

- [x] 3.1 `pnpm test:run` — all 10 new files + 395 existing tests pass (460 total, +26 metabolic)
- [x] 3.2 `pnpm typecheck` — zero type errors
- [ ] 3.3 `git diff --stat src/` — only `*.test.tsx` files; zero production changes

## TDD Flow per Test File

```
[RED]    Write test shell (describe + it stubs) → run → confirms file is executed
[GREEN]  Implement one scenario at a time → run → each passes before next
[REFACT] Extract shared `beforeEach`/helpers → run → all still green
```

## Dependencies

| Test File | Fixtures Needed | Wrapper |
|-----------|----------------|---------|
| `FoodList.test.tsx` | `makeFood` | `render` |
| `DailyViolations.test.tsx` | `makeValidationResult`, `makeViolation` | `render` |
| `CaloricSummary.test.tsx` | `makeCaloricTargetOutput` | `render` |
| `DailyLogView.test.tsx` | `makeFood` | `renderWithI18n` |
| `MedDietValidatorContainer.test.tsx` | — | `renderWithI18n` + `setState()` |
| `ProfileError.test.tsx` | — | `render` |
| `ProfileForm.test.tsx` | `makeMetricsFormState` | `renderWithI18n` + `userEvent` |
| `ProfileResults.test.tsx` | `makeCaloricTargetOutput` | `renderWithI18n` |
| `MetabolicTrackerView.test.tsx` | — | `render` |
| `MetabolicTrackerContainer.test.tsx` | — | `renderWithI18n` + `setState()` |
