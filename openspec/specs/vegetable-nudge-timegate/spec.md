# Vegetable Nudge Time Gate Info — Specification

## Purpose

Communicates the existing `REQ-VEGETABLES-DEFICIT` time gate (`currentHour >= 14`) to the user via a contextual info line in `DailyViolations`. Pure UI clarification — does not modify nudge rules, violation logic, or clinical thresholds.

## Requirements

### REQ-VEGETABLE-NUDGE-TIMEGATE-INFO

The system MUST render an info paragraph when ALL three conditions are true:
- `validation.violations` contains a vegetable deficit (category VEGETABLES, direction under)
- `currentHour < VEGETABLE_NUDGE_HOUR_THRESHOLD` (14)
- `hasFoods` is true

The message MUST use i18n key `log.vegetableNudgeAfternoon`.

#### Scenario: Deficit before 2PM — info shown

- GIVEN vegetable deficit violation AND currentHour=10 AND hasFoods=true
- WHEN DailyViolations renders
- THEN info paragraph with i18n text is visible
- AND the success message (`validation.allClear`) does NOT render

#### Scenario: Deficit at 2PM — info hidden

- GIVEN vegetable deficit violation AND currentHour=14 AND hasFoods=true
- WHEN DailyViolations renders
- THEN the vegetable nudge info paragraph is NOT in the DOM

#### Scenario: No deficit — info hidden

- GIVEN no vegetable deficit violation AND currentHour=10 AND hasFoods=true
- WHEN DailyViolations renders
- THEN the vegetable nudge info paragraph is NOT in the DOM

#### Scenario: No foods — info hidden

- GIVEN vegetable deficit violation AND currentHour=10 AND hasFoods=false
- WHEN DailyViolations renders
- THEN the vegetable nudge info paragraph is NOT in the DOM

### REQ-VEGETABLE-NUDGE-TIMEGATE-I18N

The system MUST provide `log.vegetableNudgeAfternoon` in both locales:

| Locale | Text |
|--------|------|
| ES | Los recordatorios de hortalizas se activan a partir de las 14:00. Todavía tenés tiempo de incluir verduras en el almuerzo. |
| EN | Vegetable reminders activate from 2PM onward. You still have time to include vegetables at lunch. |

The `Translations` interface MUST include the key to enforce compile-time parity.

### REQ-VEGETABLE-NUDGE-TIMEGATE-ARIA

The info paragraph MUST use `role="status"` for screen reader live region announcement, consistent with the existing `validation.allClear` pattern in DailyViolations.

#### Scenario: Screen reader compatibility

- GIVEN vegetable deficit before 2PM
- WHEN DailyViolations renders
- THEN the info element has `role="status"`

### REQ-VEGETABLE-NUDGE-TIMEGATE-CONSTANT

`VEGETABLE_NUDGE_HOUR_THRESHOLD` MUST be exported from `@shared/nudge` (currently module-scoped in `rules.ts`). DailyViolations MUST import it — the value SHALL NOT be duplicated.

### REQ-VEGETABLE-NUDGE-TIMEGATE-NONREGRESSION

Nudge rules, violation logic, and clinical thresholds MUST remain unchanged. All existing tests MUST pass.

#### Scenario: Nudge rule unchanged

- GIVEN counts.VEGETABLES=2 AND currentHour=13
- WHEN evaluateRules() runs
- THEN VEGETABLES_DEFICIT condition returns false (time gate intact)

#### Scenario: Violation detection unchanged

- GIVEN vegetable consumption=0 rations
- WHEN the ration validator runs
- THEN a vegetable deficit violation is still reported
