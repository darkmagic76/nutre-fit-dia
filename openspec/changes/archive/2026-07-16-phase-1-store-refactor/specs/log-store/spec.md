# Log Store Specification

## Purpose

Manages the today's food log — entries, ration validation, and cross-feature read of caloric target from trackerStore.

## Requirements

### Requirement: Food Log Entries

The store MUST maintain a `todayLog` array of `Food` items and expose `addFoodToLog()` and `removeFoodFromLog()` actions.

#### Scenario: Add food triggers revalidation

- GIVEN `todayLog` is empty
- WHEN `addFoodToLog(food)` is called
- THEN `todayLog` SHALL contain the food item
- AND `todayValidation` SHALL be recomputed via `validateRations()`

#### Scenario: Remove food by index

- GIVEN `todayLog` has 2 items
- WHEN `removeFoodFromLog(0)` is called
- THEN `todayLog` SHALL have 1 item
- AND `todayValidation` SHALL be recomputed

### Requirement: Cross-Feature Caloric Target Read

`validateToday()` MUST read `caloricTarget.restrictionActive` from trackerStore via Zustand `getState()`.

#### Scenario: Restriction-aware validation

- GIVEN trackerStore has `restrictionActive: true`
- WHEN `validateToday()` is called
- THEN the ration validation SHALL use restricted limits

### Requirement: Weekly Summary Read

The store SHOULD expose a computed view combining daily log totals with the weekly plan target.

#### Scenario: Log summary with target

- GIVEN trackerStore has `caloricTarget.target = 2000`
- WHEN the component reads total Kcal from `todayLog`
- THEN the store SHALL expose the target for display
