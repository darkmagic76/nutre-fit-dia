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

`calculateTarget()` MUST read all profile fields, sanitize them, compute IMC via `profileService.computeIMC()`, validate via `profileService.validateProfile()`, and call `computeCaloricTarget()` from the domain service. Error messages MUST use i18n keys.

#### Scenario: Happy path calculation

- GIVEN weight=80, height=170, age=55, gender="male", paf="1.2"
- WHEN `calculateTarget()` is called
- THEN `caloricTarget` SHALL contain `bmr`, `tdee`, `deficit`, `target`, and `restrictionActive`
- AND `restrictionActive` SHALL be `true` (IMC ~27.7 > 25)
- AND IMC SHALL be computed by `profileService.computeIMC`

#### Scenario: Insufficient fields returns early

- GIVEN weight is empty string
- WHEN `calculateTarget()` is called
- THEN `caloricTarget` SHALL remain `null`

#### Scenario: Invalid gender triggers i18n error

- GIVEN an invalid gender value
- WHEN the trackerStore validates
- THEN the error message SHALL come from i18n key `errors.invalidGender`
- AND the message SHALL be displayable in both Spanish and English

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

### Requirement: Domain Delegation to profileService

The trackerStore MUST delegate IMC computation, profile validation, and caloric target calculation to external pure services instead of implementing them inline.

#### Scenario: IMC computed by profileService

- GIVEN weight=80, height=170
- WHEN the trackerStore needs IMC
- THEN it SHALL call `computeIMC(80, 170)` from `profileService`
- AND the result SHALL be 27.7

#### Scenario: Validation delegated to profileService

- GIVEN the trackerStore validates profile inputs
- WHEN `validateProfile` from `profileService` is available
- THEN the store SHALL call it rather than duplicating validation logic inline

#### Scenario: Caloric target delegated to caloricTargetService

- GIVEN the trackerStore calculates the caloric target
- WHEN all required fields are populated
- THEN the calculation SHALL delegate to `caloricTargetService` (already in `shared/services/`)

### Requirement: I18n Error Messages

All error messages in the trackerStore MUST use i18n keys (via the `t` function) instead of hardcoded Spanish strings.

#### Scenario: Error messages use i18n keys

- GIVEN an invalid input triggers an error in trackerStore
- WHEN the error is generated
- THEN the message SHALL use an i18n key (e.g., `errors.invalidGender`, `errors.diagnosisAgeExceeds`)
- AND the key SHALL resolve to Spanish (`es.ts`) and English (`en.ts`) translations

#### Scenario: Spanish error strings removed from store

- GIVEN the trackerStore source file
- WHEN inspecting the code
- THEN no hardcoded Spanish error strings SHALL be present (e.g., `"Error al procesar"`, `"La edad de diagnóstico"`, `"La glucosa debe ser"`)

### Requirement: Caloric Target Delegation

The `computeCaloricTarget` call in trackerStore MUST delegate to an existing shared service rather than implementing the formula inline.

#### Scenario: Caloric target uses shared service

- GIVEN `caloricTargetService` exists in `src/shared/services/`
- WHEN `calculateTarget()` is called in trackerStore
- THEN the BMR/TDEE/deficit computation SHALL come from `caloricTargetService`
- AND the trackerStore SHALL NOT contain a duplicate of the Harris-Benedict formula
