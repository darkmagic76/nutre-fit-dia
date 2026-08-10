# Delta: composition-root

## MODIFIED Requirements

### Requirement: createContainer Factory

`createContainer()` MUST create all Zustand-backed adapters, wire them into use cases, and return a typed container object. It SHALL NOT pass `Translations` to `calculateTarget`.

(Previously: `createContainer()` MUST create all Zustand-backed adapters, wire them into use cases, and return a typed container object.)

#### Scenario: calculateTarget wired without Translations

- GIVEN `createContainer()` is called
- WHEN `container.calculateTarget(input)` is invoked
- THEN it SHALL call `calculateTargetUseCase(input, biomarkerRepo)` (NO `t` parameter)
- AND the returned object SHALL be strongly typed

#### Scenario: exportData wired with typed ports

- GIVEN `createContainer()` is called
- WHEN `container.exportData()` is invoked
- THEN it SHALL call `exportDataUseCase(trackerRepo, logRepo, nudgeRepo, activityRepo, planRepo, biomarkerRepo)`
- AND all 6 parameters SHALL be typed repository ports (NOT `StoreSnapshot`)
- AND the returned JSON SHALL contain all six domain keys plus `exportedAt`

#### Scenario: No circular dependencies

- GIVEN the composition root wiring
- WHEN adapters and use cases are instantiated
- THEN no circular dependency SHALL exist
- AND `domain/` SHALL NOT depend on `application/` or `infrastructure/`
