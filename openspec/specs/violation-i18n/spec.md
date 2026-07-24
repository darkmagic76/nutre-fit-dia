# Violation I18n Specification

## Purpose

Structured violation data consumed by UI layer with i18n-based display formatting. Validator services return data only; the UI layer formats messages using the existing `category.*` and `validation.unit*` i18n keys.

## Requirements

### Requirement: REQ-I18N-VIOLATION-MESSAGE

Daily ration violation messages MUST render in the active locale. The `formatViolation(t, violation)` utility SHALL produce the correct message using i18n keys.

#### Scenario: English locale renders English violation

- GIVEN the active locale is English
- WHEN a violation exists with category=CEREALS, current=2, limit=1, direction="over", unit="day"
- THEN the rendered message SHALL be in English

#### Scenario: Spanish locale renders Spanish violation

- GIVEN the active locale is Spanish
- WHEN the same violation exists
- THEN the rendered message SHALL be in Spanish

### Requirement: REQ-I18N-CATEGORY-NAME

Food category display names MUST use `t['category.xxx']` from the i18n system.

#### Scenario: Category names match active locale

- GIVEN the active locale is English
- WHEN a component renders `FoodCategory.VEGETABLES`
- THEN the displayed name SHALL be "Vegetables"
- AND in Spanish locale SHALL be "Verduras"

### Requirement: REQ-I18N-VIOLATION-LABELS

`ViolationList` section labels ("Errors"/"Warnings") MUST accept translated strings via props.

#### Scenario: English labels passed from parent

- GIVEN `DailyViolations` renders with English locale
- WHEN it passes `errorLabel="Errors"` and `warningLabel="Warnings"` to `ViolationList`
- THEN section headers SHALL render in English

### Requirement: REQ-I18N-SAFETY-ALERT

Safety alert messages from `safetyCheck.ts` MUST render in the active locale via `useT()`.

#### Scenario: Safety alert renders in active locale

- GIVEN the active locale is Spanish
- WHEN `safetyCheck()` triggers a safety alert
- THEN the `SafetyAlertDisplay` SHALL render the alert message in Spanish

### Requirement: REQ-STRUCTURED-DATA

Validator functions MUST return structured data without pre-formatted display strings.

#### Scenario: Validator returns structured fields only

- GIVEN `checkCategoryLimits()` detects a violation
- THEN the returned object SHALL include `category`, `current`, `limit`, `direction`, `unit`
- AND SHALL NOT include a pre-formatted `message` string
- AND SHALL NOT import locale-specific translations

### Requirement: REQ-NONREGRESSION

All existing tests MUST pass. Both English and Spanish locales MUST produce correct output.

#### Scenario: Full test suite passes

- GIVEN the changes are applied
- WHEN `pnpm verify` is executed
- THEN all existing tests SHALL pass

#### Scenario: Both locales produce correct output

- GIVEN English locale is active
- THEN `DailyViolations`, `PlanView`, and `SafetyAlertDisplay` SHALL render English messages
- GIVEN Spanish locale is active
- THEN the same components SHALL render Spanish messages
