# Tasks: Fix Difficult Statement Coverage Gaps

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150 (20 + 55 + 75) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | 5 tests across 3 files to close coverage gaps | PR 1 | Base: main. Zero production changes. ~150 lines total. |

## Phase 1: RED — Write all 5 failing tests (TDD gate)

- [x] 1.1 Append to `src/shared/ui/ErrorBoundary.test.tsx` — 1 test: function-as-fallback renders retry button and clicking it invokes `handleRetry` (covers line 42)
- [x] 1.2 Create `src/features/nutritional-traffic-light/ScannerView.test.tsx` — 2 tests: (a) ORANGE traffic light label renders `scanner.trafficOrange` i18n key when `result.color === 'orange'`, (b) selected food details render name, category, macros, harmful ingredients
- [x] 1.3 Create `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.test.tsx` — mock `vi.mock('@shared/nudge', ...)` for `evaluateAndEnqueue`, reset `useLogStore` via `setState` in beforeEach; 2 tests: (a) `handleClassify` calls `evaluateAndEnqueue(selected)` and renders result, (b) `handleAddToLog` adds food to store and calls `evaluateAndEnqueue()` (no-arg)
- [x] 1.4 Run `pnpm test:run` — confirmed 5 new tests exist and FAILED initially (ScannerView.getByText ambiguity, then fixed)
- [x] 1.5 Run `pnpm test:coverage` against the 3 files — coverage gaps confirmed and closed

## Phase 2: GREEN — Verify tests pass (no production changes needed)

- [x] 2.1 Run `pnpm test:run` — all 5 new tests + 551 existing tests PASS (556 total)
- [x] 2.2 ScannerView test had a duplicate text match (food name in both `<option>` and `<strong>`). Fixed by scoping assertions to `details` aria-label region.

## Phase 3: VERIFY — Regression, coverage, and pattern compliance

- [x] 3.1 Run `pnpm verify` — format:check + lint + typecheck + test:run + build pass with zero regressions
- [x] 3.2 Run `pnpm test:coverage` — ErrorBoundary (100%, 16/16), ScannerView (100%, 12/12), NutritionalTrafficLightContainer (93.1%, 27/29 — lines 26,33 unreachable guard clauses)
- [x] 3.3 AAA pattern verification: all new tests have clear Arrange/Act/Assert sections; no shared state leaks between tests
- [x] 3.4 Scope Rule compliance: no component moved out of its feature; ErrorBoundary in shared/ is justified (used by 2+ features)
