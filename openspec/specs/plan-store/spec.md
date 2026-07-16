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
