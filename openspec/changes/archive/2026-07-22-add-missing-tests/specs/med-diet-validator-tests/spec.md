# med-diet-validator-tests Specification

## Purpose

Define unit test requirements for the five UI components in the `med-diet-validator` feature. Each requirement maps to one component and its MUST-test scenarios.

## Requirements

### Requirement: MedDietValidatorContainer Unit Coverage

The test suite MUST validate that `MedDietValidatorContainer` renders `DailyLogView` with correct props derived from `useLogStore` and `useTrackerStore` state.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Empty store | `useLogStore` has empty `todayLog` and null `todayValidation` | Container renders | `DailyLogView` receives empty arrays and null target |
| 2 | With entries | `todayLog` has 2+ `Food` entries with `kcalPer100g` values | Container renders | `DailyLogView` receives entries and computed `totalKcal` |

### Requirement: DailyLogView Unit Coverage

The test suite MUST validate that `DailyLogView` renders its sub-components (`CaloricSummary`, `FoodList`, `DailyViolations`) conditionally based on props, within i18n context.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Full render | All props: `todayLog` with entries, `caloricTarget`, `todayValidation` | Rendered in `I18nProvider` | CaloricSummary, FoodList, DailyViolations visible |
| 2 | Empty entries | `todayLog=[]`, `caloricTarget=null`, `todayValidation=null` | Rendered | Empty-state tip displayed; no summary or violations |
| 3 | Deficit description | `caloricTarget` with `restrictionActive=true` | Rendered | Card description includes deficit kcal |
| 4 | No target | `caloricTarget=null` | Rendered | Card uses default description text |
| 5 | With violations | `todayValidation` non-null | Rendered | DailyViolations component rendered |
| 6 | No violations | `todayValidation=null` | Rendered | DailyViolations not rendered |
| 7 | Card title i18n | Component rendered | Inspect card | Title uses `t['log.title']` |

### Requirement: CaloricSummary Unit Coverage

The test suite MUST validate that `CaloricSummary` renders two `StatCard`s with correct values and variant logic (danger when ingested > target, default otherwise).

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Restriction active | `caloricTarget.restrictionActive=true` | Rendered | Both target and ingested cards visible |
| 2 | Restriction inactive | `caloricTarget.restrictionActive=false` | Rendered | Both cards visible |
| 3 | Danger variant | `totalKcal > caloricTarget.target` | Rendered | Ingested card uses danger variant |
| 4 | Default variant | `totalKcal ≤ caloricTarget.target` | Rendered | Ingested card uses default variant |

### Requirement: DailyViolations Unit Coverage

The test suite MUST validate that `DailyViolations` conditionally renders `ViolationList` and success messages based on `ValidationResult` validity, food presence, and `animalProteinCount`.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Valid + has foods | `valid=true`, `hasFoods=true`, `animalProteinCount=1` | Rendered | Green success message visible |
| 2 | Invalid | `valid=false`, `violations=[...]` | Rendered | ViolationList rendered (error severity) |
| 3 | Animal protein > 2 | `animalProteinCount=3`, `valid=true` | Rendered | Warning ViolationList for calcium nudge |
| 4 | Both invalid + protein | `valid=false`, `animalProteinCount=4` | Rendered | Both error and warning ViolationLists |
| 5 | No foods edge | `valid=true`, `hasFoods=false` | Rendered | No success message, nothing rendered |

### Requirement: FoodList Unit Coverage

The test suite MUST validate that `FoodList` renders food items with name, category display name, and an accessible remove button; and shows an empty state when the list is empty.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Empty state | `foods=[]` | Rendered | Empty state message displayed |
| 2 | Food items | 2+ foods via `makeFood()` fixture | Rendered | Each food shows name and category name |
| 3 | Remove interaction | Foods rendered with `onRemove` mock | User clicks remove ✕ | `onRemove` called with correct index |
| 4 | A11y: remove label | Food item rendered | Inspect remove button | Button has `aria-label` with food name |
| 5 | Multiple items | 3 foods rendered | Rendered | All items shown in correct order |
| 6 | List a11y label | Food items rendered | Inspect `<ul>` | List has `aria-label="Alimentos registrados hoy"` |
