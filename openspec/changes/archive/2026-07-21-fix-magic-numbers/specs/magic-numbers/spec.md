# Delta for magic-numbers

## ADDED Requirements

### Requirement: Named Constants for Business Logic

All hardcoded domain thresholds and limit values MUST be declared as named module-level constants.

#### Scenario: planGenerator meal-plan literals

- GIVEN `planGenerator.ts` contains hardcoded `3`, `7`, and `3` for meal distribution
- WHEN the module is loaded
- THEN each literal is replaced by a named `const` with the same value

#### Scenario: nudge rule condition thresholds

- GIVEN `rules.ts` contains hardcoded thresholds (glucose, activity, time, rations)
- WHEN the module is loaded
- THEN each threshold literal is replaced by a named `const` with the same value

#### Scenario: rationValidator restricted cereal max

- GIVEN `rationValidator.ts` has `effectiveMax = 4`
- WHEN the module is loaded
- THEN the `4` is replaced by a named `const` with the same value

## MODIFIED Requirements

None — no spec-level behavior changes.

## REMOVED Requirements

None.
