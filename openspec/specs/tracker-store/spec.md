# Tracker Store Specification

## Purpose

Manages metabolic profile state — weight, height, age, gender, physical activity factor, and computed caloric target — for the Metabolic Tracker feature.

## Requirements

### Requirement: Profile State

The store MUST expose reactive state for `weight`, `height`, `age`, `gender`, `paf`, and `caloricTarget`.

#### Scenario: Default values populated on init

- GIVEN the trackerStore is created
- THEN `weight` SHALL default to `"80"`, `height` to `"170"`, `age` to `"55"`, `gender` to `"male"`, `paf` to `"1.2"`
- AND `caloricTarget` SHALL be `null`

### Requirement: Field Setters

Each numeric field MUST sanitize input via `sanitizeNumeric()` before storing.

#### Scenario: Gender setter validates via Zod

- GIVEN `setGender("female")` is called
- THEN `gender` SHALL be `"female"`
- WHEN `setGender("invalid")` is called
- THEN the store SHALL NOT update `gender`

### Requirement: Caloric Target Computation

`calculateTarget()` MUST read all profile fields, sanitize them, compute IMC via `computeIMC()`, and call `computeCaloricTarget()` from the domain service.

#### Scenario: Happy path calculation

- GIVEN weight=80, height=170, age=55, gender="male", paf="1.2"
- WHEN `calculateTarget()` is called
- THEN `caloricTarget` SHALL contain `bmr`, `tdee`, `deficit`, `target`, and `restrictionActive`
- AND `restrictionActive` SHALL be `false` (IMC ~27.7 > 25, actually true)

#### Scenario: Insufficient fields returns early

- GIVEN weight is empty string
- WHEN `calculateTarget()` is called
- THEN `caloricTarget` SHALL remain `null`
