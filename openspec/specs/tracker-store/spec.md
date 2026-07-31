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

### Requirement: Persist Middleware

The trackerStore MUST use `zustand/persist` middleware with `createPersistConfig`. Sensitive clinical fields (`weight`, `height`, `age`, `diagnosisAge`, `glucose`, `imc`) SHALL be encrypted via Web Crypto before localStorage write. Non-sensitive fields (`gender`, `paf`, `glucoseContext`, `restrictionActive`) SHALL remain plaintext. Actions (`set*`, `calculateTarget`) MUST be excluded via `partialize`.

#### Scenario: Sensitive fields encrypted in localStorage

- GIVEN `setWeight('80')` and `setGender('male')` have been called
- WHEN DevTools inspects localStorage key `nutrifit-tracker`
- THEN `weight` SHALL NOT appear as plaintext `"80"`
- AND `gender` SHALL appear as plaintext `"male"`

#### Scenario: State survives refresh

- GIVEN `setWeight('82')`, `setHeight('175')`, `setGender('female')` have been called
- WHEN the page is refreshed
- THEN `weight` SHALL be `'82'`, `height` SHALL be `'175'`, `gender` SHALL be `'female'`

#### Scenario: Actions excluded from persist

- GIVEN the store is persisted to localStorage
- WHEN the serialized state is inspected
- THEN `setWeight`, `calculateTarget`, and other functions SHALL NOT be present

#### Scenario: Fresh start with no prior data

- GIVEN localStorage is empty
- WHEN the store initializes
- THEN defaults SHALL match current defaults (`weight='80'`, `height='170'`, `age='55'`, `gender='male'`, `paf='1.2'`)
