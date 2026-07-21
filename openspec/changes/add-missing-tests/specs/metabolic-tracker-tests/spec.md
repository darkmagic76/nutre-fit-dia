# metabolic-tracker-tests Specification

## Purpose

Define unit test requirements for the five UI components in the `metabolic-tracker` feature. Each requirement maps to one component and its MUST-test scenarios.

## Requirements

### Requirement: MetabolicTrackerContainer Unit Coverage

The test suite MUST validate that `MetabolicTrackerContainer` renders `MetabolicTrackerView` with correct props derived from `useTrackerStore` state.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Pending state | `caloricTarget=null`, `profileError=null` | Container renders | `ProfileForm` rendered (no results or error) |
| 2 | Success state | `caloricTarget` present, `profileError=null` | Container renders | `ProfileResults` rendered with target data |
| 3 | Error state | `caloricTarget=null`, `profileError='Error message'` | Container renders | `ProfileError` rendered with error message |
| 4 | IMC threshold | `caloricTarget` with `restrictionActive=true` | Container renders | Deficit card shows "IMC > 25" subtext |
| 5 | Combined results+error | `caloricTarget` present AND `profileError` present | Container renders | Both `ProfileResults` and `ProfileError` rendered |

### Requirement: MetabolicTrackerView Unit Coverage

The test suite MUST validate that `MetabolicTrackerView` renders `ProfileForm`, `ProfileError`, and `ProfileResults` conditionally.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | All sections | `caloricTarget` present, `profileError=null` | Rendered | `ProfileForm` + `ProfileResults` visible; no error |
| 2 | Error only | `caloricTarget=null`, `profileError` present | Rendered | `ProfileForm` + `ProfileError` visible; no results |
| 3 | No results | `caloricTarget=null`, `profileError=null` | Rendered | Only `ProfileForm` visible; `ProfileResults` absent |

### Requirement: ProfileForm Unit Coverage

The test suite MUST validate that `ProfileForm` renders all fields with i18n labels and calls `onSubmit` on form submission.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | All required fields | Rendered in `I18nProvider` | Inspect form | Weight, height, age, gender, PAF with i18n labels |
| 2 | Optional fields | Rendered | Inspect form | Diagnosis age and glucose rendered |
| 3 | Submit | `onSubmit` mock provided | User submits form | `onSubmit` called with form event |
| 4 | Glucose context select | Rendered | Inspect select | Fasting and postprandial options available |
| 5 | Diagnosis age optional | Rendered | Inspect field | Field present with label; form submits without value |
| 6 | noValidate attribute | Rendered | Inspect form | Form has `noValidate` attribute |
| 7 | aria-label accessibility | Rendered | Inspect form | Form has `aria-label` |
| 8 | Gender select options | Rendered | Inspect select | Male and female options available |

### Requirement: ProfileResults Unit Coverage

The test suite MUST validate that `ProfileResults` renders 4 `StatCard`s with correct kcal values and restriction-aware variant logic.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | All cards | Full `CaloricTargetOutput` | Rendered | BMR, TDEE, deficit, target cards visible with kcal suffix |
| 2 | Restriction inactive | `restrictionActive=false` | Rendered | Deficit card shows default variant + "Sin restricción" sub |
| 3 | Restriction active | `restrictionActive=true` | Rendered | Deficit card shows danger variant + "IMC > 25" sub |
| 4 | Target card success | Any caloricTarget | Rendered | Target card uses success variant |
| 5 | All values in kcal | Rendered | Inspect all cards | Every card value ends with " kcal" |
| 6 | BMR card label | Rendered | Inspect BMR card | Label uses i18n key |
| 7 | TDEE card label | Rendered | Inspect TDEE card | Label uses i18n key |
| 8 | aria-live region | Rendered | Inspect container | Container has `aria-live="polite"` |

### Requirement: ProfileError Unit Coverage

The test suite MUST validate that `ProfileError` renders nothing when error is null/undefined, and renders an error message with `role="alert"` when a `ValidationError` is provided.

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Null error | `error=null` | Rendered | Component returns null; nothing in DOM |
| 2 | Error present | `error` is a `ValidationError` with message | Rendered | Error message visible with `role="alert"` and red styling |
