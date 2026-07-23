# Design: Add Missing Tests for med-diet-validator and metabolic-tracker

## Technical Approach

Add 10 co-located test files (`*.test.tsx`) to two feature directories. Zero production code changes. Follow existing project patterns: AAA (vitest), render + `getByRole`/`getByText` (Testing Library), and zustand `setState()` for store mocking. Use existing fixtures (`src/test/fixtures.ts`) and `renderWithI18n()` for i18n-wrapped components. ~50 test scenarios from the delta specs.

## Architecture Decisions

| Decision | Option | Tradeoff | Verdict |
|----------|--------|----------|---------|
| File placement | co-located at feature root (e.g. `DailyLogView.test.tsx`) | Matches nudge-engine, recipe-engine, sustainability | **co-located** — project convention wins |
| | `__tests__/` subdirectory | Isolates test files; not used anywhere in project | Rejected — breaks convention |
| Store mocking | `vi.mock()` module-level mock | Brittle; must mock entire module | Rejected |
| | `setState()` direct state | Simple, already proven in `engine.test.ts` | **`setState()`** |
| I18n wrapper | `renderWithI18n()` from `src/test/i18n-test-utils.tsx` | Already exists, wraps `I18nProvider` | **Use existing utility** |
| Test data | Inline for simple props | Keeps test self-contained | Simple props (strings, numbers) |
| | Fixtures for complex types | Reduces boilerplate, consistent | `makeCaloricTargetOutput`, `makeValidationResult`, `makeViolation`, `makeFood` |

## Data Flow

```
Container tests: setState() → render(I18nProvider) → assert rendered output
Presentational tests: build props → render(I18nProvider) → assert DOM + interactions
```

```
useLogStore.setState({ todayLog: [...], todayValidation: {...} })
useTrackerStore.setState({ caloricTarget: {...} })
        │
        ▼
MedDietValidatorContainer ──→ DailyLogView ──→ CaloricSummary
                                   │              │
                                   ├──→ FoodList
                                   └──→ DailyViolations
```

```
useTrackerStore.setState({ caloricTarget, profileError, ... })
        │
        ▼
MetabolicTrackerContainer ──→ MetabolicTrackerView ──→ ProfileForm
                                   │                     │  ProfileError
                                   └──→ ProfileResults
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/med-diet-validator/MedDietValidatorContainer.test.tsx` | **Create** | 4 scenarios: default state, with entries, with validation, with caloric target |
| `src/features/med-diet-validator/DailyLogView.test.tsx` | **Create** | 7 scenarios: full render, empty, caloric info, add entry, safe/risky badges, toggle |
| `src/features/med-diet-validator/components/CaloricSummary.test.tsx` | **Create** | 4 scenarios: restriction on/off, danger/default variant |
| `src/features/med-diet-validator/components/DailyViolations.test.tsx` | **Create** | 5 scenarios: no violations, invalid, animal protein, mixed, no foods |
| `src/features/med-diet-validator/components/FoodList.test.tsx` | **Create** | 6 scenarios: empty, items, toggle, remove, a11y label, sustainability badge |
| `src/features/metabolic-tracker/MetabolicTrackerContainer.test.tsx` | **Create** | 5 scenarios: pending, success, error, IMC threshold, loading |
| `src/features/metabolic-tracker/MetabolicTrackerView.test.tsx` | **Create** | 3 scenarios: all sections, error only, no results |
| `src/features/metabolic-tracker/components/ProfileForm.test.tsx` | **Create** | 8 scenarios: fields, optional, submit, validation, disabled, errors, glucose, diagnosisAge |
| `src/features/metabolic-tracker/components/ProfileResults.test.tsx` | **Create** | 8 scenarios: metrics, restriction off/on, IMC threshold, obesity, no glucose, floor/cap |
| `src/features/metabolic-tracker/components/ProfileError.test.tsx` | **Create** | 2 scenarios: null renders nothing, error renders alert |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Container (2) | Store-to-props mapping, conditional rendering | `setState()` in `beforeEach`, `render()` with DOM assertions |
| Presentational (8) | Render output, edge cases, interactions, a11y | Direct props + `renderWithI18n()`; `getByRole`/`getByLabelText` for a11y; `userEvent` for interactions |
| Migration | N/A | No migration — additive test files only |

## Rollout

No migration required. All 10 files are additive. `pnpm test:run` validates at commit time.

## Open Questions

None — all design decisions resolved against existing codebase patterns.
