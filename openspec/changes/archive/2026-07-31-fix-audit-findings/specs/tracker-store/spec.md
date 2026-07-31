# Delta for Tracker Store

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Caloric Target Computation

`calculateTarget()` MUST read all profile fields, sanitize them, compute IMC via `profileService.computeIMC()`, validate via `profileService.validateProfile()`, and call `computeCaloricTarget()` from the domain service. Error messages MUST use i18n keys.

(Previously: computed IMC inline and used hardcoded Spanish error strings)

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
