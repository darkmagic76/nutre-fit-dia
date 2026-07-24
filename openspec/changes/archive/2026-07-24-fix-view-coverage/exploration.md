## Exploration: Fix View/Coverage Gaps (3 Difficult Files)

### Current State

Three files have statement coverage gaps that require targeted integration tests:

1. **`src/shared/ui/ErrorBoundary.tsx`** — 93.75% stmts, line 42 uncovered (function-as-fallback path)
2. **`src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.tsx`** — 93.1% stmts, lines 26-34 uncovered (interaction handlers)
3. **`src/features/nutritional-traffic-light/ScannerView.tsx`** — 91.66% stmts, lines 45,67 uncovered (ORANGE branch + category fallback)

The existing test suite uses `vitest` + `@testing-library/react` + `@testing-library/user-event`. Views/containers use `renderWithI18n` from `@/test/i18n-test-utils` which wraps in `I18nProvider`. Zustand stores are reset via `useXxxStore.setState(...)` in `beforeEach`. Fixtures from `@/test/fixtures` provide `makeFood()`.

### Affected Areas

- `src/shared/ui/ErrorBoundary.test.tsx` — add 1 test case for function-as-fallback
- `src/features/nutritional-traffic-light/NutritionalTrafficLightContainer.tsx` — no test file exists, needs new `NutritionalTrafficLightContainer.test.tsx`
- `src/features/nutritional-traffic-light/ScannerView.tsx` — no test file exists, needs new `ScannerView.test.tsx`

### Per-File Analysis

---

#### File 1: ErrorBoundary.tsx (line 42)

**Uncovered code**:
```tsx
if (typeof this.props.fallback === 'function') {
  return this.props.fallback(this.handleRetry);  // line 42
}
```

**Current test coverage**: 523-line test file covers:
- Happy path (children render)
- Default fallback (ErrorFallback component)
- Custom static fallback element
- Retry button resets error state
- Multiple error → retry → error sequences
- Non-catchable errors (event handlers, setTimeout, promises, cleanup)
- Dev console logging
- `onError` and `onRetry` callbacks
- Sibling isolation (per-tab safety)

**Missing test case**: A test that passes `fallback` as a function `(handleRetry) => <div>` and verifies:
1. The function is called with `handleRetry`
2. The rendered output appears
3. Clicking the retry element (inside the function-rendered fallback) resets the error

**Test strategy**: Straightforward — no i18n needed. Use existing test helpers (`Thrower`, `suppressConsole`). The function-as-fallback receives `handleRetry` and can render a button with a known test ID.

**Effort**: ~20 lines of test code (1 test case)
- `it('renders a function fallback and wires retry handler')`

---

#### File 2: NutritionalTrafficLightContainer.tsx (lines 26-34)

**Uncovered code**:
```tsx
const handleClassify = () => {
  if (!selected) return;     // line 26 (already covered by guard, but branch)
  setResult(classifyFoodWithReasons(selected));    // line 27
  setSafetyAlerts(checkSafetyAlerts(selected));    // line 28
  evaluateAndEnqueue(selected);                    // line 29-30
};

const handleAddToLog = () => {
  if (!selected) return;     // line 32 (guard)
  addFoodToLog(selected);    // line 33
  evaluateAndEnqueue();      // line 34
};
```

**Current test coverage**: No test file exists for this container.

**Test strategy**: Integration test pattern similar to `MedDietValidatorContainer.test.tsx`:
1. Wrap in `renderWithI18n` (container uses `useFoodName` → `useLocale`)
2. Use `makeFood()` fixtures for selecting a food
3. Interact via the rendered ScannerView UI (select a food from `SelectField`, click "Clasificar" / "Añadir al registro")
4. Verify state changes: result appears, safety alerts appear, log store updates

**Key challenges**:
- `evaluateAndEnqueue` reads multiple Zustand stores via `getState()` — this is an impure integration function. In tests it will run and try to read store state. This may cause false side effects or throw if stores aren't initialized.
  - **Approach A**: Mock the `@shared/nudge` module with `vi.mock` to make `evaluateAndEnqueue` a no-op.
  - **Approach B**: Initialize the required stores with empty/initial state and let it run. This is more realistic but couples tests to nudge engine internals.
  - **Recommendation**: Approach A — mock `evaluateAndEnqueue` as a no-op in the container test. The nudge engine has its own tests.
- `foodsById` is a real Map of all food data — used to build `options` and get `selected`. We can select by ID using foods that exist in the data, OR use `makeFood` and ensure the selected ID matches. Since `foodsById` imports from `foods-data.ts`, we'd need to either:
  - Use a real food ID from the dataset
  - Or mock `@shared/data/foods`

**Recommendation for food selection**: Use a real food ID from the dataset. Read `foods-data.ts` to find a simple one. Or mock `@shared/data/foods` to return a controlled Map. The simplest approach: mock the module.

**Effort**: ~70-80 lines of test code + mocking setup

---

#### File 3: ScannerView.tsx (lines 45, 67)

**Uncovered code**:
```tsx
// Line 45 — ORANGE branch
if (color === TrafficLightColor.ORANGE) return t['scanner.trafficOrange'];

// Line 67 — Category display with fallback
{t[`category.${selected.category}` as keyof typeof t] ?? selected.category}
```

**Current test coverage**: No test file exists for this component.

**Test strategy**: Pure presentational component tests:
1. **For ORANGE**: Render with `result={{ color: 'orange', reasons: ['test'] }}` and verify `scanner.trafficOrange` text appears.
2. **For category fallback**: The fallback `?? selected.category` only triggers if the translation key returns `undefined`. Since `FoodCategory` has all matching keys in `Translations` type, at runtime with es/en the key will always resolve. To test this branch, we'd need either:
   - A food with a category not in the translations (impossible at type level)
   - Or mock `useT` to return `undefined` for the category key
   - **Recommendation**: Mock `useT` to return a partial object where `category.${key}` is undefined, OR accept that this is a defensive branch that's practically unreachable and skip it. Actually — we CAN test it by providing a category that doesn't exist in the translations map as a runtime value. Let me think...

Actually, `selected.category` is typed as `FoodCategory` which is a string literal union. If we use `mock` or `type-cast` a fake category like `'nonexistent'`, then `t['category.nonexistent']` would be `undefined` at runtime, and `?? selected.category` would return `'nonexistent'`. TypeScript would complain about the cast, but `as any` works in tests.

**Better approach**: Render with a `selected` food that has its category cast to a non-existent value. Test the nullish fallback.

**Effort**: ~50-60 lines of test code

### Approaches

Only one reasonable approach exists for each file — write focused tests for the uncovered paths. No architectural alternatives to evaluate; the coverage gaps are purely test-scenario gaps.

#### Approach Summary

| File | Complexity | Test Lines | Key Technique |
|------|-----------|------------|--------------|
| ErrorBoundary (line 42) | Low | ~20 | Function-as-fallback prop |
| NutritionalTrafficLightContainer (lines 26-34) | Medium | ~70-80 | renderWithI18n + mock evaluateAndEnqueue + mock foods |
| ScannerView (lines 45, 67) | Low-Medium | ~50-60 | renderWithI18n + result/selected prop combos |
| **Total** | | **~140-160** | |

### Scope Rule Check

No Scope Rule violations introduced:
- ErrorBoundary test → lives alongside existing `ErrorBoundary.test.tsx` in `src/shared/ui/` (correct location)
- NutritionalTrafficLightContainer test → new file in same directory as container (feature-local, correct)
- ScannerView test → new file in same directory as view (feature-local, correct)

All tests are unit/integration tests, scoped to their component. No cross-feature dependencies introduced.

### Recommendation

Implement in order of complexity (easiest first):

1. **ErrorBoundary.test.tsx** — add 1 test (~20 min)
2. **ScannerView.test.tsx** — new file, add 3-4 tests (~45 min)
3. **NutritionalTrafficLightContainer.test.tsx** — new file, add 3-4 tests with mocking (~60 min)

This order minimizes risk: the ErrorBoundary fix is trivial and gives confidence, ScannerView is self-contained presentational, and NutritionalTrafficLightContainer is the most complex with the most mocking.

### Risks

1. **`evaluateAndEnqueue` side effects**: If not properly mocked, calls to `evaluateAndEnqueue` in the container test will read/write Zustand stores and could produce flaky tests. Must mock `@shared/nudge` at module level.

2. **`foodsById` real data dependency**: The container builds `options` from the real food dataset. Mocking `@shared/data/foods` may be simpler than trying to select a known ID, but must ensure `foodsById` is accessible in the test environment (it's a static `Map` — should be fine).

3. **Category fallback branch reachability**: Line 67's `?? selected.category` is a defensive fallback that's unreachable with properly typed data. The test will need a type cast to exercise it. This is acceptable for coverage but adds test complexity with minimal practical benefit. **Accept the gap or apply a coverage exclusion comment.**

### Ready for Proposal

Yes. The exploration is complete with clear per-file strategies, effort estimates, and risk mitigations. Proceed to `sdd-propose`.
