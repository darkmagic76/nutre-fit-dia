# Application Use Cases Specification

## Purpose

Pure orchestrating functions in `src/application/use-cases/` that receive ports as parameters, coordinate domain services, and return results. Zero Zustand, zero React, zero store imports.

## Requirements

### Requirement: calculateTarget Use Case

`calculateTarget` MUST accept `ProfileInput`, `BiomarkerRepository`, and `translate` as parameters. It SHALL parse inputs, validate profile, compute caloric target, record biomarkers, and return `CaloricTargetOutput`. Zero Zustand imports.

#### Scenario: Use case receives ports as params

- GIVEN `calculateTarget(input, biomarkerRepo, t)` is called with valid profile data
- WHEN the use case executes
- THEN it SHALL call `biomarkerRepo.recordWeight()` and `biomarkerRepo.recordGlucose()`
- AND it SHALL NOT call `useBiomarkerStore.getState()` or import Zustand

#### Scenario: Returns CaloricTargetOutput on valid input

- GIVEN weight=80, height=170, age=55, gender="male", paf="1.2"
- WHEN `calculateTarget()` runs
- THEN the result SHALL include `bmr`, `tdee`, `deficit`, `target`, `restrictionActive`
- AND `restrictionActive` SHALL be `true` (IMC ~27.7 > 25)

#### Scenario: Insufficient fields returns null target

- GIVEN weight is empty string
- WHEN `calculateTarget()` is called
- THEN it SHALL return `null` for caloric target

#### Scenario: Use case testable with in-memory fake

- GIVEN an in-memory `BiomarkerRepository` fake
- WHEN `calculateTarget` is called with the fake
- THEN all side effects go through the fake's methods
- AND the test requires no jsdom or Zustand mocks

### Requirement: evaluateNudges Use Case

`evaluateNudges` MUST accept `ContextInput`, rules array, `NotificationRepository`, `ActivityRepository`, `BiomarkerRepository`, and `LogRepository` as parameters. It SHALL build context, evaluate rules, auto-resolve conflicts, and enqueue notifications via the port. Zero Zustand imports.

#### Scenario: Evaluate and enqueue through ports

- GIVEN context with 1 matching rule, `notificationRepo`, and `logRepo`
- WHEN `evaluateNudges(ctx, rules, notificationRepo, activityRepo, biomarkerRepo, logRepo)` executes
- THEN it SHALL call `notificationRepo.enqueue()` for the matched notification
- AND SHALL NOT call `useNudgeStore.getState()` directly

#### Scenario: Ports receive all integration calls

- GIVEN the use case needs today's log and pending notifications
- WHEN evaluating rules
- THEN it SHALL read via `logRepo.getTodayLog()` and `notificationRepo.getPending()`
- AND SHALL NOT import any Zustand store

### Requirement: exportData Use Case

`exportData` MUST accept 6 repository ports as parameters. It SHALL aggregate data, create JSON blob, and trigger browser download. Zero `@features/*` imports.

#### Scenario: Aggregates via port interfaces

- GIVEN `exportData(trackerRepo, logRepo, nudgeRepo, activityRepo, planRepo, biomarkerRepo)` is called
- WHEN data is aggregated
- THEN each repository's getter SHALL be called via the port interface
- AND the resulting JSON SHALL contain all six domain keys plus `exportedAt`

#### Scenario: No @features imports

- GIVEN `exportData` use case source
- WHEN inspecting imports
- THEN zero `@features/` imports SHALL exist
