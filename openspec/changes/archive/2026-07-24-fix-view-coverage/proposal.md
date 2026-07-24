# Proposal: Fix View/Coverage Gaps in 3 Difficult Files

## Intent

Three files have statement coverage below 100% due to missing tests: ErrorBoundary (93.75%), ScannerView (91.66%), and NutritionalTrafficLightContainer (93.1%). Architecture audit confirmed zero code smells and zero Clean Architecture violations — these are legitimate test gaps, not design problems. This change brings all three to 100% statement coverage with TDD-driven test additions.

## Scope

### In Scope
- Add 1 test case for ErrorBoundary function-as-fallback path (line 42)
- New `ScannerView.test.tsx` covering ORANGE traffic light branch and category fallback
- New `NutritionalTrafficLightContainer.test.tsx` covering `handleClassify` and `handleAddToLog` handlers

### Out of Scope
- Refactoring production code (no code smells to fix)
- Modifying existing spec requirements (no behavioral changes)
- Adding E2E/Playwright tests

## Capabilities

### New Capabilities
None

### Modified Capabilities
None

## Approach

**Test-Driven Development (TDD) per `config.yaml`** — write failing test first, then implement minimum code to pass. No production code changes needed; all gaps are missing tests only.

Implement in complexity order:
1. **ErrorBoundary** (~20 min): Add `it('renders a function fallback and wires retry handler')` — render with `fallback={(retry) => <button data-testid="fn-retry" onClick={retry}>Retry</button>}`, throw, verify handler receives `handleRetry` and click resets error state.
2. **ScannerView** (~45 min): New test file — render with `result={{ color: 'orange' }}`, verify `scanner.trafficOrange` i18n key; test category fallback via type cast.
3. **NutritionalTrafficLightContainer** (~60 min): New test file — mock `@shared/nudge` (evaluateAndEnqueue → no-op) and `@shared/data/foods` (foodsById → controlled Map), use `renderWithI18n`, select food, click buttons, verify store state.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/ui/ErrorBoundary.test.tsx` | Modified | +1 test (function-as-fallback) |
| `src/features/nutritional-traffic-light/ScannerView.test.tsx` | New | 3-4 presentational tests |
| `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.test.tsx` | New | 3-4 integration tests with mocking |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| None | — | Architecture audit confirmed zero code smells; test additions cannot regress production |

## Rollback Plan

`git revert` the commit. All changes are additive test files and test additions — no production code touched. Reversion is instant with zero side effects.

## Dependencies

None — pure test additions. No external services, no API changes, no library upgrades.

## Success Criteria

- [ ] ErrorBoundary: 100% statement coverage (from 93.75%)
- [ ] ScannerView: 100% statement coverage (from 91.66%)
- [ ] NutritionalTrafficLightContainer: 100% statement coverage (from 93.1%)
- [ ] Zero regressions: all 510+ existing tests pass (`pnpm test:run`)
- [ ] Project coverage threshold maintained at 80%+
