# Delta: application-use-cases

## MODIFIED Requirements

### Requirement: calculateTarget Use Case

`calculateTarget` MUST accept `ProfileInput` and `BiomarkerRepository` as parameters (NO `Translations`). It SHALL parse inputs, validate profile, compute caloric target, record biomarkers, and return `CaloricTargetOutput` or `ValidationError` with error codes. Zero `@shared/` imports.

(Previously: `calculateTarget` MUST accept `ProfileInput`, `BiomarkerRepository`, and `translate` as parameters.)

#### Scenario: Use case receives ports as params (no Translations)

- GIVEN `calculateTarget(input, biomarkerRepo)` is called with valid profile data
- WHEN the use case executes
- THEN it SHALL call `biomarkerRepo.recordWeight()` and `biomarkerRepo.recordGlucose()`
- AND it SHALL NOT import from `@shared/` (no `Translations`, no `ValidationError` from shared, no `parseNumeric` from shared)

#### Scenario: Returns ValidationError with error code on invalid input

- GIVEN weight is "abc" (non-numeric)
- WHEN `calculateTarget()` is called
- THEN it SHALL return `profileError` with `code: 'INVALID_NUMERIC_INPUT'`
- AND `profileError.context` SHALL contain `{ field: 'weight', value: 'abc', min: 30, max: 300 }`
- AND `profileError` SHALL be an instance of `ValidationError` from `@domain/errors`

#### Scenario: Returns ValidationError with context on diagnosisAge exceeds currentAge

- GIVEN age=40, diagnosisAge=45
- WHEN `calculateTarget()` is called
- THEN it SHALL return `profileError` with `code: 'DIAGNOSIS_AGE_EXCEEDS_CURRENT_AGE'`
- AND `profileError.context` SHALL contain `{ diagnosisAge: 45, currentAge: 40 }`

#### Scenario: Returns ValidationError when glucose is empty

- GIVEN glucose is empty string
- WHEN `calculateTarget()` is called
- THEN it SHALL return `profileError` with `code: 'GLUCOSE_REQUIRED'`

#### Scenario: Returns ValidationError when glucose is non-positive

- GIVEN glucose is "abc" or "-5"
- WHEN `calculateTarget()` is called
- THEN it SHALL return `profileError` with `code: 'GLUCOSE_MUST_BE_POSITIVE'`

#### Scenario: Returns ValidationError with context on IMC threshold crossing

- GIVEN biomarkerRepo detects IMC threshold crossing
- WHEN `calculateTarget()` is called
- THEN it SHALL return `profileError` with `code: 'IMC_THRESHOLD_CROSSED'`
- AND `profileError.context` SHALL contain `{ direction: 'above' | 'below', prevIMC, currentIMC }`

#### Scenario: Returns CaloricTargetOutput on valid input

- GIVEN weight=80, height=170, age=55, gender="male", paf="1.2"
- WHEN `calculateTarget()` runs
- THEN the result SHALL include `bmr`, `tdee`, `deficit`, `target`, `restrictionActive`
- AND `restrictionActive` SHALL be `true` (IMC ~27.7 > 25)
- AND `profileError` SHALL be `null`

#### Scenario: Insufficient fields returns null target

- GIVEN weight is empty string
- WHEN `calculateTarget()` is called
- THEN it SHALL return `null` for caloric target
- AND it SHALL return `profileError` with appropriate error code

#### Scenario: Use case testable with in-memory fake

- GIVEN an in-memory `BiomarkerRepository` fake
- WHEN `calculateTarget` is called with the fake
- THEN all side effects go through the fake's methods
- AND the test requires no jsdom or Zustand mocks
- AND the test does NOT pass `Translations` parameter

### Requirement: exportData Use Case

`exportData` MUST accept 6 **typed repository ports** as parameters (NOT `StoreSnapshot`). It SHALL aggregate data via port interfaces, create JSON blob, and trigger browser download. Zero `@features/*` imports.

(Previously: `exportData` MUST accept 6 repository ports as parameters. It SHALL aggregate data, create JSON blob, and trigger browser download. Zero `@features/*` imports.)

#### Scenario: Aggregates via typed port interfaces

- GIVEN `exportData(trackerRepo, logRepo, nudgeRepo, activityRepo, planRepo, biomarkerRepo)` is called with typed ports
- WHEN data is aggregated
- THEN each repository's getter SHALL be called via the port interface
- AND the resulting JSON SHALL contain all six domain keys plus `exportedAt`
- AND NO `StoreSnapshot` inline interface SHALL exist in the file

#### Scenario: No @features imports

- GIVEN `exportData` use case source
- WHEN inspecting imports
- THEN zero `@features/` imports SHALL exist

#### Scenario: No inline StoreSnapshot interface

- GIVEN `exportData.ts` source code
- WHEN inspecting the file
- THEN NO `interface StoreSnapshot` declaration SHALL exist
- AND all 6 parameters SHALL be typed with proper repository port interfaces
