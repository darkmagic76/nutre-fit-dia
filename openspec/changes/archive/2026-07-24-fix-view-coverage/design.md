# Design: Fix View/Coverage Gaps in 3 Difficult Files

## Technical Approach

Pure test additions across three files — zero production code changes. Each gap is a branch or handler path not exercised by existing tests. TDD per `config.yaml`: write the failing test first, verify with coverage, commit. Implementation order follows complexity: ErrorBoundary → ScannerView → NutritionalTrafficLightContainer.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|-------------------------|-----------|
| Nudge mock strategy | `vi.mock('@shared/nudge', ...)` for `evaluateAndEnqueue` only | Mock entire `@shared/stores` or wrap in test-only DI | `evaluateAndEnqueue` reads 3 Zustand stores and fires side effects — isolating it is the minimal mock. Real stores (`useLogStore`) keep tests honest and verify integration. |
| ScannerView test scope | Presentational: render with props, assert DOM | Test through container (indirect) | ScannerView is a pure presentational component per Container/Presentational pattern. Direct render with props gives faster, more precise coverage. |
| Store reset in container tests | `useLogStore.setState({ todayLog: [] })` in `beforeEach` | Mock `useLogStore` entirely | Real stores validate the actual `addFoodToLog` flow. `setState` resets to known state without mocking Zustand internals. |

## Data Flow

```
NutritionalTrafficLightContainer
  │
  ├── reads: foodsById (static Map, no mock needed)
  ├── reads: useLogStore (real Zustand store, reset via setState)
  ├── calls: evaluateAndEnqueue(food)  ← vi.fn() mock
  │
  └── passes data down to ScannerView (presentational, tested via props)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/ui/ErrorBoundary.test.tsx` | Modify | Add 1 test: function-as-fallback renders retry button and clicking it resets error state |
| `src/features/nutritional-traffic-light/ScannerView.test.tsx` | Create | 2 tests: ORANGE classification label + selected food details |
| `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.test.tsx` | Create | 2 tests: handleClassify and handleAddToLog via mocked `evaluateAndEnqueue` |

## Test Strategy — Per File

### ErrorBoundary.test.tsx (+1 test, ~20 lines)

**Gap**: Line 42 — `typeof this.props.fallback === 'function'` branch never exercised.

**Test: "renders a function fallback and wires retry handler"**
- **Arrange**: Render `<ErrorBoundary fallback={(retry) => <button data-testid="fn-retry" onClick={retry}>Retry</button>}><Thrower /></ErrorBoundary>`
- **Act**: Query `fn-retry` button; click it with `userEvent`
- **Assert**: Button renders when error caught; after click, `Thrower` re-throws (stays in error state), but `handleRetry` was invoked — verify `fn-retry` still present (proves function fallback was used, not default `ErrorFallback`)

### ScannerView.test.tsx (new file, ~55 lines)

**Gap**: ORANGE branch at `trafficLabel` (line 46) and `selected` details block (line 60-82) not covered.

Uses `renderWithI18n` from `@/test/i18n-test-utils`. Wraps in `<I18nProvider>`.

- **Test 1: "renders ORANGE traffic light label when result color is orange"**
  - Arrange: Render with `result={{ color: 'orange', reasons: ['Alto en grasas'] }}`
  - Assert: Text matching `scanner.trafficOrange` i18n key renders; role="status" present

- **Test 2: "renders food details when selected food is provided"**
  - Arrange: Render with `selected={makeFood({ name: 'Aceite de oliva', category: 'fats', kcalPer100g: 884 })}` and `options={[{ value: 'aceite', label: 'Aceite de oliva' }]}`
  - Assert: Food name visible; category label from i18n; macros string contains kcal/protein/carbs/fat

**Note**: GREEN and RED branches are already covered by existing integration tests (`classificationService.test.ts`, `SafetyAlertDisplay.test.tsx`). No need to duplicate.

### NutritionalTrafficLightContainer.test.tsx (new file, ~75 lines)

**Gap**: `handleClassify` (line 25) and `handleAddToLog` (line 32) never called in tests.

Mock strategy:
```typescript
vi.mock('@shared/nudge', () => ({
  evaluateAndEnqueue: vi.fn(),
}));
```

Uses real `foodsById` (static Map from `@shared/data/foods`, no side effects) and real `useLogStore` (resets via `useLogStore.setState({ todayLog: [] })` in `beforeEach`).

- **Test 1: "handleClassify selects a food, classifies it, and triggers nudge"**
  - Arrange: Render container, grab first food entry from `foodsById`, set `selectedId` via select interaction
  - Act: Click classify button
  - Assert: `evaluateAndEnqueue` called with the selected food; result renders (status role visible)

- **Test 2: "handleAddToLog adds food to log store and triggers nudge"**
  - Arrange: Select food as above
  - Act: Click add-to-log button
  - Assert: `useLogStore.getState().todayLog` contains the food; `evaluateAndEnqueue` called (no-arg variant)

## Migration / Rollout

No migration required. Rollback: `git revert` the commit. All changes are additive — only test files touched.

## Open Questions

None.
