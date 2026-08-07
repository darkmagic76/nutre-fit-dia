# Delta: application-ports

## ADDED Requirements

### Requirement: TrackerRepository Interface

`TrackerRepository` MUST define a pure TypeScript interface with methods: `getState`.

#### Scenario: Interface is TypeScript-only

- GIVEN `application/ports/trackerRepository.ts`
- WHEN inspecting the file
- THEN it SHALL contain only `interface` and type declarations
- AND zero `from 'react'`, `from 'zustand'`, or `from '@infrastructure/*'` imports SHALL exist

#### Scenario: getState method declared

- GIVEN the `TrackerRepository` interface
- THEN it SHALL declare `getState(): TrackerState`
- AND `TrackerState` SHALL be a domain type or plain object type

### Requirement: NudgeRepository Interface

`NudgeRepository` MUST define a pure TypeScript interface with methods: `getState`.

#### Scenario: Interface is TypeScript-only

- GIVEN `application/ports/nudgeRepository.ts`
- WHEN inspecting the file
- THEN it SHALL contain only `interface` and type declarations
- AND zero `from 'react'`, `from 'zustand'`, or `from '@infrastructure/*'` imports SHALL exist

#### Scenario: getState method declared

- GIVEN the `NudgeRepository` interface
- THEN it SHALL declare `getState(): NudgeState`
- AND `NudgeState` SHALL be a domain type or plain object type

### Requirement: PlanRepository Interface

`PlanRepository` MUST define a pure TypeScript interface with methods: `getState`.

#### Scenario: Interface is TypeScript-only

- GIVEN `application/ports/planRepository.ts`
- WHEN inspecting the file
- THEN it SHALL contain only `interface` and type declarations
- AND zero `from 'react'`, `from 'zustand'`, or `from '@infrastructure/*'` imports SHALL exist

#### Scenario: getState method declared

- GIVEN the `PlanRepository` interface
- THEN it SHALL declare `getState(): PlanState`
- AND `PlanState` SHALL be a domain type or plain object type
