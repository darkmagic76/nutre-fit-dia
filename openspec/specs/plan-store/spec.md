# Plan Store Specification

## Purpose

Manages weekly meal plan state — restriction flag, plan generation, and results display for the Recipe Engine feature.

## Requirements

### Requirement: Restriction Toggle

The store MUST expose `restrictionActive` boolean and `setRestrictionActive()` setter.

#### Scenario: Toggle restriction

- GIVEN `restrictionActive` is `false`
- WHEN `setRestrictionActive(true)` is called
- THEN `restrictionActive` SHALL be `true`

### Requirement: Plan Generation

`generatePlan()` MUST read `restrictionActive` and call `generateWeeklyPlan()` from the domain service.

#### Scenario: Generate plan happy path

- GIVEN `restrictionActive` is `true`
- WHEN `generatePlan()` is called
- THEN `weeklyPlan` SHALL be set to the result of `generateWeeklyPlan(true)`
- AND `weeklyPlan` SHALL contain `days`, `dailyResults`, `valid`, and optionally `weeklyResult`

#### Scenario: Regenerate overwrites previous

- GIVEN `weeklyPlan` is already populated
- WHEN `generatePlan()` is called again
- THEN `weeklyPlan` SHALL be a new plan object

### Requirement: Persist Middleware

The planStore MUST use `zustand/persist` middleware. Weekly meal plan data is non-sensitive — stored as plaintext JSON. The `generatePlan` and `setRestrictionActive` actions MUST be excluded from persist via `partialize`.

#### Scenario: Weekly plan survives refresh

- GIVEN `generatePlan()` has been called and `weeklyPlan` is populated with a 7-day plan
- WHEN the page is refreshed
- THEN `weeklyPlan` SHALL be fully restored
- AND the plan SHALL be identical to the pre-refresh state

#### Scenario: Restriction toggle persists

- GIVEN `setRestrictionActive(true)` has been called
- WHEN the page is refreshed
- THEN `restrictionActive` SHALL be `true`

#### Scenario: No plan state on first visit

- GIVEN no prior localStorage data
- WHEN the store initializes
- THEN `weeklyPlan` SHALL be `null` and `restrictionActive` SHALL be `false`

#### Scenario: Regenerate overwrites persisted plan

- GIVEN a persisted `weeklyPlan` from prior session
- WHEN `generatePlan()` is called with new restriction setting
- THEN `weeklyPlan` SHALL be the newly generated plan
- AND page refresh SHALL restore the new plan

#### Scenario: Actions excluded from persist

- GIVEN the store is persisted
- WHEN serialized state is inspected
- THEN `generatePlan` and `setRestrictionActive` SHALL NOT be present
