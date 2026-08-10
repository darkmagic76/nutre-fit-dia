# Delta for Tracker Store

## ADDED Requirements

### Requirement: Use Case Delegation for calculateTarget

The trackerStore SHALL delegate `calculateTarget()` to the `application/use-cases/calculateTarget.ts` use case. The store SHALL hold state only — orchestration logic lives in the use case.

#### Scenario: Store calls use case

- GIVEN `trackerStore.calculateTarget()` is invoked
- WHEN the store executes
- THEN it SHALL call the `calculateTarget` use case with profile inputs, `BiomarkerRepository`, and `translate`
- AND the store SHALL NOT contain BMR/TDEE/deficit formula logic

#### Scenario: Use case receives ports as params

- GIVEN the `calculateTarget` use case
- WHEN inspecting its signature
- THEN it SHALL accept `ProfileInput`, `BiomarkerRepository`, and `translate`
- AND SHALL NOT import Zustand, `useTrackerStore`, or any `@shared/stores/*`

## MODIFIED Requirements

### Requirement: Caloric Target Computation

`calculateTarget()` SHALL delegate to the `calculateTarget` use case in `application/use-cases/`. The use case MUST read all profile fields, sanitize them, compute IMC via `computeIMC()`, validate via `validateProfile()`, and call `computeCaloricTarget()` from the domain service. Error messages MUST use i18n keys.

(Previously: `calculateTarget()` MUST read all profile fields, sanitize them, compute IMC via `profileService.computeIMC()`, validate via `profileService.validateProfile()`, and call `computeCaloricTarget()` from the domain service. Error messages MUST use i18n keys.)

#### Scenario: Happy path calculation (unchanged)

- GIVEN weight=80, height=170, age=55, gender="male", paf="1.2"
- WHEN `calculateTarget()` is called
- THEN `caloricTarget` SHALL contain `bmr`, `tdee`, `deficit`, `target`, and `restrictionActive`
- AND `restrictionActive` SHALL be `true` (IMC ~27.7 > 25)

#### Scenario: Insufficient fields returns early (unchanged)

- GIVEN weight is empty string
- WHEN `calculateTarget()` is called
- THEN `caloricTarget` SHALL remain `null`

#### Scenario: Invalid gender triggers i18n error (unchanged)

- GIVEN an invalid gender value
- WHEN the trackerStore validates
- THEN the error message SHALL come from i18n key `errors.invalidGender`

### Requirement: Domain Delegation to profileService

The trackerStore SHALL delegate IMC computation, profile validation, and caloric target calculation to the use case, which in turn delegates to external pure services.

(Previously: The trackerStore MUST delegate IMC computation, profile validation, and caloric target calculation to external pure services instead of implementing them inline.)

#### Scenario: IMC computed by profileService (unchanged)

- GIVEN weight=80, height=170
- WHEN the use case needs IMC
- THEN it SHALL call `computeIMC(80, 170)` from domain
- AND the result SHALL be 27.7

#### Scenario: Caloric target delegated to caloricTargetService (unchanged)

- GIVEN the use case calculates the caloric target
- WHEN all required fields are populated
- THEN the calculation SHALL delegate to `caloricTargetService` (in `domain/`)
