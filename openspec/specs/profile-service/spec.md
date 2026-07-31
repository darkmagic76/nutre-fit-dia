# Profile Service Specification

## Purpose

Pure domain functions for metabolic profile computation, extracted from `trackerStore.ts` to satisfy SRP. Zero framework dependencies — no React, Zustand, or side effects.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | `computeIMC` MUST return BMI = weight / (height/100)², rounded to 1 decimal | MUST |
| R2 | `validateProfile` MUST return structured validation errors for invalid inputs | MUST |
| R3 | `buildProfile` MUST merge partial input with defaults and derived fields | MUST |
| R4 | All functions MUST be pure — no side effects, no Zustand, no React imports | MUST |
| R5 | `trackerStore` MUST delegate domain calculations to `profileService` | MUST |
| R6 | Existing trackerStore behavior MUST NOT change — all 680 tests pass | MUST |

### R1: computeIMC

`computeIMC(weightKg: number, heightCm: number): number` MUST return BMI = weight / (height/100)², rounded to 1 decimal.

#### Scenario: Standard calculation

- GIVEN weight 70kg and height 170cm
- WHEN `computeIMC(70, 170)` is called
- THEN return value SHALL be `24.2`

#### Scenario: Zero or negative input

- GIVEN weight ≤ 0 or height ≤ 0
- WHEN `computeIMC` is called
- THEN it SHALL return `NaN` (caller must validate inputs first)

### R2: validateProfile

`validateProfile(profile: UserProfile): ValidationResult` MUST validate: age > 0, height > 0, weight > 0, glucose ≥ 0, diagnosisAge ≤ currentAge.

#### Scenario: Valid profile returns no errors

- GIVEN a profile with age=55, height=170, weight=80, glucose=100, diagnosisAge=45
- WHEN `validateProfile(profile)` is called
- THEN `result.valid` SHALL be `true`
- AND `result.errors` SHALL be empty

#### Scenario: Diagnosis age exceeds current age

- GIVEN a profile with diagnosisAge=50 and currentAge=45
- WHEN `validateProfile(profile)` is called
- THEN `result.errors` SHALL contain an error for `diagnosisAge`
- AND the error message SHALL indicate "diagnosis age cannot exceed current age"

#### Scenario: Negative glucose

- GIVEN a profile with glucose=-5
- WHEN `validateProfile(profile)` is called
- THEN `result.errors` SHALL contain an error for `glucose`
- AND the error message SHALL indicate glucose must be ≥ 0

### R3: buildProfile

`buildProfile(input: Partial<UserProfile>): UserProfile` MUST merge partial input with defaults, computing derived fields (IMC) from provided weight and height.

#### Scenario: Partial input filled with defaults

- GIVEN partial input with `{ weightKg: 70, heightCm: 170 }`
- WHEN `buildProfile(input)` is called
- THEN returned profile SHALL have `weightKg=70`, `heightCm=170`, and `imc=24.2`
- AND unset fields (age, gender, etc.) SHALL use defaults

#### Scenario: Full input preserved

- GIVEN full input with all fields set
- WHEN `buildProfile(input)` is called
- THEN all provided values SHALL be preserved
- AND `imc` SHALL be computed from provided weight and height

### R4: Purity

All functions MUST be pure — no side effects, no Zustand imports, no React imports, no DOM access.

#### Scenario: No framework dependencies

- GIVEN the `profileService.ts` source file
- WHEN inspecting its imports
- THEN there SHALL be zero imports from `zustand`, `react`, or `@shared/stores`

#### Scenario: Same input, same output

- GIVEN `computeIMC(70, 170)` is called twice
- THEN both calls SHALL return `24.2`

### R5: trackerStore Delegation

`trackerStore` MUST delegate domain calculations to `profileService` instead of implementing them inline.

#### Scenario: IMC delegated

- GIVEN the trackerStore computes a metabolic profile
- WHEN IMC is needed
- THEN the store SHALL call `computeIMC` from `profileService`, not compute it inline

#### Scenario: Validation delegated

- GIVEN the trackerStore validates profile fields
- WHEN `validateProfile` from `profileService` exists
- THEN the store SHALL call it rather than duplicating validation logic

### R6: Backward Compatibility

Existing trackerStore behavior MUST NOT change — all existing tests MUST pass.

#### Scenario: Full test suite green

- GIVEN the trackerStore delegates to profileService
- WHEN `pnpm test:run` executes
- THEN all 680 tests SHALL pass with zero failures
