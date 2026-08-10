# Composition Root Specification

## Purpose

`src/infrastructure/compositionRoot.ts` — the single factory where all adapters and use cases are wired together. Called once at app startup. The only singleton allowed in the system.

## Requirements

### Requirement: createContainer Factory

`createContainer()` MUST create all Zustand-backed adapters, wire them into use cases, and return a typed container object.

#### Scenario: Explicit wiring of use cases

- GIVEN `createContainer()` is called
- THEN all 4 port adapters SHALL be instantiated
- AND `evaluateNudges`, `calculateTarget`, and `exportData` use cases SHALL receive their concrete dependencies
- AND the returned object SHALL be strongly typed

#### Scenario: No circular dependencies

- GIVEN the composition root wiring
- WHEN adapters and use cases are instantiated
- THEN no circular dependency SHALL exist
- AND `domain/` SHALL NOT depend on `application/` or `infrastructure/`

### Requirement: Single Instantiation Point

`createContainer()` MUST be called exactly once, in `main.tsx`. React components SHALL receive dependencies via context or props, not by calling `createContainer()`.

#### Scenario: Called once in main.tsx

- GIVEN the application entry point
- WHEN `main.tsx` executes
- THEN `createContainer()` SHALL be called ONCE
- AND the container SHALL be passed to the React tree (context or prop)
