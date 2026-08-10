# Infrastructure Adapters Specification

## Purpose

Zustand-backed implementations of port interfaces in `src/infrastructure/adapters/`. Each adapter wraps one store and satisfies its corresponding port contract. Uses `store.getState()` for static access — no React hooks.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Each adapter MUST implement its port interface exactly | MUST |
| R2 | Adapters MUST use `store.getState()` (static access), not hooks | MUST |
| R3 | Adapters MUST NOT add new store logic | MUST NOT |

### R1: Adapters Satisfy Port Contracts

Each adapter file SHALL export a factory function returning an object that satisfies the corresponding port interface.

#### Scenario: zustandNotificationRepository satisfies NotificationRepository

- GIVEN `createZustandNotificationRepository()` returns an object
- WHEN assigned to a `NotificationRepository` typed variable
- THEN TypeScript SHALL accept without error
- AND all 8 port methods SHALL be implemented

#### Scenario: zustandActivityRepository satisfies ActivityRepository

- GIVEN `createZustandActivityRepository()` returns an object
- WHEN assigned to an `ActivityRepository` typed variable
- THEN TypeScript SHALL accept without error
- AND all 5 port methods SHALL be implemented

#### Scenario: zustandLogRepository satisfies LogRepository

- GIVEN `createZustandLogRepository()` returns an object
- WHEN assigned to a `LogRepository` typed variable
- THEN TypeScript SHALL accept without error
- AND all 4 port methods SHALL be implemented

#### Scenario: zustandBiomarkerRepository satisfies BiomarkerRepository

- GIVEN `createZustandBiomarkerRepository()` returns an object
- WHEN assigned to a `BiomarkerRepository` typed variable
- THEN TypeScript SHALL accept without error
- AND all 6 port methods SHALL be implemented

### R2: Static Store Access

Every adapter method SHALL access the underlying store via `store.getState()`, never via React hooks.

#### Scenario: Adapter reads state statically

- GIVEN `biomarkerRepo.getGlucoseHistory()` is called
- WHEN inspecting the adapter implementation
- THEN it SHALL use `useBiomarkerStore.getState().glucoseHistory`
- AND SHALL NOT call `useBiomarkerStore()` as a hook

### R3: No Duplicate Store Logic

Adapters SHALL be thin wrappers that delegate to store methods. No business logic SHALL live in adapters.

#### Scenario: Adapter delegates to store method

- GIVEN `notificationRepo.acknowledge('id-1')` is called
- WHEN inspecting the adapter
- THEN it SHALL call `useNudgeStore.getState().acknowledge('id-1')`
- AND SHALL NOT reimplement acknowledge logic locally
