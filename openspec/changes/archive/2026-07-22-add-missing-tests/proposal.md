# Proposal: Add Missing Tests for med-diet-validator and metabolic-tracker

## Intent

Two clinically critical features — **med-diet-validator** (ration validation UI) and **metabolic-tracker** (metabolic profiling UI) — have **zero unit test files** for their 10 UI components. Integration tests cover happy-path wiring but miss edge cases, conditional branches, accessibility, and i18n rendering. This change fills the coverage gap to meet the 80% threshold.

## Scope

### In Scope
- 10 new test files (`.test.tsx`) across `med-diet-validator` and `metabolic-tracker`
- ~50 test scenarios covering render, edge, interaction, a11y, and combo cases
- Container tests (2) with zustand store mocking via `setState()`
- Presentational component tests (8) with direct props and I18nProvider wrapper

### Out of Scope
- Production code changes (zero)
- Store logic tests (already covered by `logStore.test.ts`, `trackerStore.test.ts`)
- Integration test modifications (`App.integration.test.tsx`)
- New test fixtures or shared utilities beyond what exists in `src/test/fixtures.ts`

## Capabilities

### New Capabilities
None — test-only change; no new features or requirements.

### Modified Capabilities
None — test-only change; no spec-level requirement changes.

## Approach

**Approach 1 from exploration (recommended):** Test presentational components with explicit props, container components with minimal zustand store mocking via `setState()`.

- **Fast path (~80% of scenarios):** Pure props + `render()` — no mocking needed
- **I18n path (6 components):** Wrap in `I18nProvider` using `renderWithI18n()` from `src/test/i18n-test-utils.tsx`
- **Container path (2 components):** Reset zustand stores with `setState()` before each test, following the `SustainabilityContainer.test.tsx` pattern
- **Fixtures:** Use existing `makeFood`, `makeEntries`, `makeCaloricTargetOutput`, `makeMetricsFormState`, `makeValidationResult`, `makeViolation` from `src/test/fixtures.ts`

Detailed test plans per component are in `exploration.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `features/med-diet-validator/` (5 files) | New | Unit tests for Container, DailyLogView, CaloricSummary, DailyViolations, FoodList |
| `features/metabolic-tracker/` (5 files) | New | Unit tests for Container, MetabolicTrackerView, ProfileForm, ProfileResults, ProfileError |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Zustand store state leaks between container tests | Low | `beforeEach` reset via `setState()` to defaults; Vitest `restoreMocks: true` |
| I18nProvider wrapper needed for 6 of 10 components | Low | `renderWithI18n()` already exists — first production use validates it |
| Test scenarios duplicate integration test coverage | None | Acceptable — different test layer, different purpose |

## Rollback Plan

All test files are additive. Revert: `git revert` the commit. Zero production code affected. Tests failing post-revert can be temporarily skipped with `.skip` or `test.each` guard, but this is unlikely since tests target stable component APIs.

## Dependencies

- Existing: `src/test/fixtures.ts`, `src/test/i18n-test-utils.tsx`, `Vitest 4.1.10`, `@testing-library/react 16.3.2`
- Store mocks: `useLogStore.setState()`, `useTrackerStore.setState()` (both zustand 5.0.8)

## Success Criteria

- [ ] `pnpm test:run` passes with all 10 new test files
- [ ] All ~50 planned scenarios implemented (render, edge, interaction, a11y)
- [ ] No production code modified
- [ ] Coverage meets or exceeds 80% threshold
- [ ] `renderWithI18n()` validated as production-ready utility
