# Exploration: Add Missing Tests for med-diet-validator and metabolic-tracker

## Current State

Two clinically critical features have **zero unit tests** for their UI components:

### Feature 1: med-diet-validator (5 files untested)
```
src/features/med-diet-validator/
├── MedDietValidatorContainer.tsx    # Container — reads from zustand stores
├── DailyLogView.tsx                  # Presentation — orchestrates sub-components
└── components/
    ├── CaloricSummary.tsx            # Presentation — renders StatCard grid
    ├── DailyViolations.tsx           # Presentation — conditional violation/success display
    └── FoodList.tsx                  # Presentation — food list with remove buttons
```

### Feature 2: metabolic-tracker (5 files untested)
```
src/features/metabolic-tracker/
├── MetabolicTrackerContainer.tsx    # Container — reads from zustand trackerStore
├── MetabolicTrackerView.tsx          # Presentation — orchestrates form + results
└── components/
    ├── ProfileForm.tsx               # Presentation — form with NumberField/SelectField
    ├── ProfileResults.tsx            # Presentation — renders StatCard grid
    └── ProfileError.tsx              # Presentation — conditional error display
```

### Existing coverage (partial — integration tests only)

The `App.integration.test.tsx` covers these scenarios at a coarse level:
- "Hoy" tab shows empty state when no profile calculated
- "Hoy" tab shows caloric summary after profile calculation
- "Perfil" tab calculates and shows BMR/TDEE
- "Perfil" tab shows error when weight is empty
- "Perfil" tab shows "Sin restricción" when IMC <= 25

E2E tests (`e2e/smoke.spec.ts`) cover: metabolic profile calculation (BMR/TDEE visible), but NOT the med-diet-validator screens.

**Unit-level coverage is missing** for: empty/edge states, interaction handlers, conditional rendering branches, accessibility attributes, and i18n label rendering.

## Test Infrastructure

- **Runner**: Vitest 4.1.10 (`pnpm test:run`)
- **Library**: @testing-library/react 16.3.2 + jest-dom matchers
- **Setup**: `src/test/setup.ts` imports `@testing-library/jest-dom` (globally available without import)
- **Config**: `vitest` in vite.config.ts — `globals: true`, `environment: jsdom`, `css: true`
- **Fixture**: `src/test/fixtures.ts` — `makeFood()` and `makeEntries()` helpers
- **Coverage threshold**: 80% (configured in openspec/config.yaml)

## Existing Test Patterns (canonical reference)

| Pattern | Source | Details |
|---------|--------|---------|
| Pure props + render | `StatCard.test.tsx` | `render(<StatCard label="BMR" value="1500 kcal" />)` |
| I18n wrapper | `SustainabilityContainer.test.tsx` | `<I18nProvider>{ui}</I18nProvider>` wrapper function |
| Props with mock callbacks | `NudgePanelView.test.tsx` | `onDismiss: vi.fn()` pattern |
| Zustand store reset | `logStore.test.ts` | `useLogStore.setState({ todayLog: [], todayValidation: null })` |
| Accessibility queries | `Card.test.tsx` | `screen.getByRole('region', { name: /my card/i })` |
| Conditional rendering | `ViolationList.test.tsx` | `expect(container.firstChild).toBeNull()` for empty state |
| Event testing | `NudgePanelView.test.tsx` | `fireEvent.click(screen.getByRole('button', ...))` |

## Affected Files (test files to create)

- `src/features/med-diet-validator/MedDietValidatorContainer.test.tsx` — new
- `src/features/med-diet-validator/DailyLogView.test.tsx` — new
- `src/features/med-diet-validator/components/CaloricSummary.test.tsx` — new
- `src/features/med-diet-validator/components/DailyViolations.test.tsx` — new
- `src/features/med-diet-validator/components/FoodList.test.tsx` — new
- `src/features/metabolic-tracker/MetabolicTrackerContainer.test.tsx` — new
- `src/features/metabolic-tracker/MetabolicTrackerView.test.tsx` — new
- `src/features/metabolic-tracker/components/ProfileForm.test.tsx` — new
- `src/features/metabolic-tracker/components/ProfileResults.test.tsx` — new
- `src/features/metabolic-tracker/components/ProfileError.test.tsx` — new

## Approaches

### Approach 1: Test presentation components directly with props (recommended)

Test each presentational component by rendering it with explicit props. For containers that read from zustand stores, either mock store state via `setState()` or test through the presentation layer.

**Pros:**
- Pure isolation — no store mocking needed for most components
- Follows established patterns (NudgePanelView, StatCard tests)
- Catches rendering bugs at the component boundary
- Simple to write and maintain
- High signal-to-noise ratio

**Cons:**
- Container store wiring is not tested at unit level (but covered by integration tests)
- More test files (10) vs fewer integration-style tests

**Effort:** Medium (10 test files, approx 50-80 assertions total)

### Approach 2: Test through containers with store mocking

Mock zustand stores before each test, render containers, and verify output.

**Pros:**
- Tests the full container → view chain
- Fewer test files
- Catches integration bugs between store and view

**Cons:**
- Requires store state setup/teardown per test (more boilerplate)
- Fragile — store implementation changes break tests
- The stores are already tested independently (logStore.test.ts, trackerStore.test.ts)
- Testing the same logic twice

**Effort:** Medium-High

### Approach 3: Add only integration-level tests (current gap filling)

Add scenarios to `App.integration.test.tsx` for missing edge cases.

**Pros:**
- Fewest files to create
- Covers real user flows
- Catches cross-feature regressions

**Cons:**
- Slow to run (full app render)
- Hard to test specific edge cases (empty states, conditional branches)
- Doesn't provide component-level coverage for the 80% threshold
- Violations like animalProteinCount > 2 can't be easily triggered through the app

**Effort:** Low-Medium

## Recommendation

**Approach 1** — test presentation components directly with props. Supplement with a minimal container test (like `SustainabilityContainer.test.tsx` does) for `MedDietValidatorContainer` and `MetabolicTrackerContainer`.

Rationale:
1. The stores are already tested independently (`logStore.test.ts`, `trackerStore.test.ts`)
2. The integration test (`App.integration.test.tsx`) already covers the happy-path wiring
3. What's missing: edge cases, conditional branches, accessibility, i18n rendering — all of which are best tested at the component level
4. Meeting the 80% coverage threshold requires component-level tests

## Detailed Test Plans

### Feature 1: med-diet-validator

#### 1. `MedDietValidatorContainer.test.tsx`

```json
{
  "component": "MedDietValidatorContainer",
  "renders": "Delegates to DailyLogView with props from useLogStore and useTrackerStore. Computes totalKcal from todayLog food entries.",
  "dependencies": ["useLogStore (zustand)", "useTrackerStore (zustand)"],
  "scenarios": [
    {"name": "renders DailyLogView with empty store defaults", "type": "render"},
    {"name": "renders with food entries and computed totalKcal", "type": "render"},
    {"name": "renders with validation data from logStore", "type": "render"},
    {"name": "renders with caloricTarget from trackerStore", "type": "render"}
  ],
  "mocking_needed": ["Mock zustand stores via useLogStore.setState() and useTrackerStore.setState() before each test"]
}
```

#### 2. `DailyLogView.test.tsx`

```json
{
  "component": "DailyLogView",
  "renders": "Card with i18n title, optional description with caloric info, conditional CaloricSummary, conditional empty state tip, FoodList, conditional DailyViolations",
  "dependencies": ["useT (I18nProvider)", "CaloricSummary", "FoodList", "DailyViolations", "Card", "Food[]", "CaloricTargetOutput", "ValidationResult"],
  "scenarios": [
    {"name": "renders full view with all props", "type": "render"},
    {"name": "shows empty state tip when no caloricTarget", "type": "edge"},
    {"name": "renders FoodList with foods", "type": "render"},
    {"name": "renders DailyViolations when validation provided", "type": "render"},
    {"name": "includes caloric target info in description when caloricTarget exists", "type": "render"},
    {"name": "shows deficit info in description when restrictionActive", "type": "edge"}
  ],
  "mocking_needed": ["Wrap in I18nProvider for useT()"]
}
```

#### 3. `CaloricSummary.test.tsx`

```json
{
  "component": "CaloricSummary",
  "renders": "Two StatCards in grid: 'Objetivo diario' (always success variant) and 'Ingerido' (danger variant if ingested > target, default otherwise)",
  "dependencies": ["StatCard", "CaloricTargetOutput"],
  "scenarios": [
    {"name": "renders target and ingested as positive integers", "type": "render"},
    {"name": "uses danger variant when ingested exceeds target", "type": "edge"},
    {"name": "uses default variant when ingested is within target", "type": "render"},
    {"name": "rounds ingested value to integer", "type": "edge"}
  ],
  "mocking_needed": ["None — pure component"]
}
```

#### 4. `DailyViolations.test.tsx`

```json
{
  "component": "DailyViolations",
  "renders": "Error ViolationList when !valid, success message when valid+hasFoods, warning ViolationList when animalProteinCount > 2",
  "dependencies": ["ViolationList (shared/ui)", "ValidationResult"],
  "scenarios": [
    {"name": "renders violation list when validation is invalid", "type": "render"},
    {"name": "renders success message when valid and has foods", "type": "render"},
    {"name": "renders nothing when valid and no foods", "type": "edge"},
    {"name": "renders warning when animalProteinCount > 2 regardless of validity", "type": "edge"},
    {"name": "renders both error and warning when both conditions met", "type": "combo"},
    {"name": "does not render success message when valid but no foods", "type": "edge"}
  ],
  "mocking_needed": ["None — pure component"]
}
```

#### 5. `FoodList.test.tsx`

```json
{
  "component": "FoodList",
  "renders": "Empty state text or unordered list of food items with name, category display name, and remove button per item",
  "dependencies": ["Food[]", "onRemove callback", "CATEGORY_DISPLAY_NAMES"],
  "scenarios": [
    {"name": "shows empty state when foods array is empty", "type": "render"},
    {"name": "renders food items with name and category", "type": "render"},
    {"name": "calls onRemove with correct index when remove button clicked", "type": "interaction"},
    {"name": "remove button has accessible aria-label", "type": "a11y"},
    {"name": "renders multiple food items in order", "type": "render"}
  ],
  "mocking_needed": ["Use makeFood() fixture from @/test/fixtures"]
}
```

### Feature 2: metabolic-tracker

#### 6. `MetabolicTrackerContainer.test.tsx`

```json
{
  "component": "MetabolicTrackerContainer",
  "renders": "Delegates to MetabolicTrackerView with store state and calculate handler",
  "dependencies": ["useTrackerStore (zustand)"],
  "scenarios": [
    {"name": "renders MetabolicTrackerView with default store values", "type": "render"},
    {"name": "renders with previously calculated caloricTarget", "type": "render"},
    {"name": "renders with profileError from store", "type": "render"},
    {"name": "handleCalculate calls store.calculateTarget on form submit", "type": "interaction"}
  ],
  "mocking_needed": ["Mock zustand store via useTrackerStore.setState()"]
}
```

#### 7. `MetabolicTrackerView.test.tsx`

```json
{
  "component": "MetabolicTrackerView",
  "renders": "Card with hardcoded title/description, ProfileForm, ProfileError (conditional), ProfileResults (conditional on caloricTarget)",
  "dependencies": ["Card", "ProfileForm", "ProfileError", "ProfileResults", "UserMetricsFormState", "CaloricTargetOutput"],
  "scenarios": [
    {"name": "renders all sections when caloricTarget and no error", "type": "render"},
    {"name": "renders with error and no results", "type": "edge"},
    {"name": "renders without results when caloricTarget is null", "type": "edge"},
    {"name": "ignores ProfileError when error is null", "type": "edge"}
  ],
  "mocking_needed": ["None — pure component"]
}
```

#### 8. `ProfileForm.test.tsx`

```json
{
  "component": "ProfileForm",
  "renders": "Form with 6 NumberFields (weight, height, age, diagnosisAge, glucose), 3 SelectFields (gender, paf, glucoseContext), and PrimaryButton submit. All fields use i18n labels.",
  "dependencies": ["useT (I18nProvider)", "NumberField", "SelectField", "PrimaryButton", "UserMetricsFormState"],
  "scenarios": [
    {"name": "renders all form fields with correct i18n labels", "type": "render"},
    {"name": "submit button calls onSubmit when clicked", "type": "interaction"},
    {"name": "form has aria-label for accessibility", "type": "a11y"},
    {"name": "form has noValidate attribute", "type": "render"},
    {"name": "gender select has male and female options", "type": "render"},
    {"name": "PAF select has all 5 activity levels", "type": "render"},
    {"name": "glucoseContext select has fasting and postprandial options", "type": "render"},
    {"name": "NumberFields render with correct min values", "type": "render"}
  ],
  "mocking_needed": ["Wrap in I18nProvider for useT()", "Use UserMetricsFormState factory"]
}
```

#### 9. `ProfileResults.test.tsx`

```json
{
  "component": "ProfileResults",
  "renders": "2x2 grid of StatCards: BMR, TDEE, Deficit (with optional sub text), Target. Uses i18n labels.",
  "dependencies": ["useT (I18nProvider)", "StatCard", "CaloricTargetOutput"],
  "scenarios": [
    {"name": "renders all four metric cards", "type": "render"},
    {"name": "shows restriction subtext when restrictionActive", "type": "edge"},
    {"name": "shows no restriction text when !restrictionActive", "type": "edge"},
    {"name": "defence card uses danger variant when restrictionActive", "type": "edge"},
    {"name": "target card uses success variant", "type": "render"},
    {"name": "all values display in kcal format", "type": "render"},
    {"name": "has aria-live=polite for dynamic updates", "type": "a11y"}
  ],
  "mocking_needed": ["Wrap in I18nProvider for useT()"]
}
```

#### 10. `ProfileError.test.tsx`

```json
{
  "component": "ProfileError",
  "renders": "null when no error, red error message with role='alert' when error provided",
  "dependencies": ["ValidationError type"],
  "scenarios": [
    {"name": "returns null when error is null", "type": "edge"},
    {"name": "returns null when error is undefined", "type": "edge"},
    {"name": "renders error message with role alert", "type": "render"},
    {"name": "error text has red styling classes", "type": "render"}
  ],
  "mocking_needed": ["Create ValidationError instances for test"]
}
```

## Risks

- **Integration test overlap**: ~5 scenarios from the integration test duplicate what these unit tests will cover. This is acceptable — integration tests serve a different purpose (cross-feature wiring), and unit tests need to exist for the coverage threshold.
- **i18n dependency**: 6 of 10 components depend on `useT()`. Every test must be wrapped in `<I18nProvider>`. This is already a well-established pattern in the codebase.
- **Zustand store coupling**: The two container components (`MedDietValidatorContainer`, `MetabolicTrackerContainer`) depend on zustand stores. Mocking strategy required.
- **No makeMetrics fixture**: Unlike `makeFood()`, there's no factory for `CaloricTargetOutput` or `UserMetricsFormState`. We'll need to create inline mock data or add fixtures, but creating new shared test utilities crosses into implementation scope — best handled in the spec/design phase.

## Ready for Proposal

**Yes.** The component analysis is complete and thorough. All 10 components have been read and analyzed. The orchestrator should proceed with `sdd-propose` to define scope and approach, using Approach 1 (presentation components tested directly with props + minimal container integration).
