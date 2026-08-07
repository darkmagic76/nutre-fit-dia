# Delta: data-export

## MODIFIED Requirements

### Requirement: Use Case Extraction

`application/use-cases/exportData.ts` MUST contain the data aggregation and download logic as a pure function receiving **typed repository ports** (NOT `StoreSnapshot`). `useExportData()` hook SHALL become a thin React wrapper that calls the use case.

(Previously: `application/use-cases/exportData.ts` MUST contain the data aggregation and download logic as a pure function receiving repository ports. `useExportData()` hook SHALL become a thin React wrapper that calls the use case.)

#### Scenario: Use case independent of React and stores

- GIVEN `exportData` use case source
- WHEN inspecting imports
- THEN zero imports from `react`, `zustand`, `@features/*`, or `@infrastructure/stores/*` SHALL exist
- AND it SHALL accept 6 typed repository ports as parameters
- AND NO `interface StoreSnapshot` declaration SHALL exist in the file

#### Scenario: Scope Rule violation fixed

- GIVEN `exportData` use case source
- WHEN inspecting imports
- THEN zero imports from `@features/recipe-engine` SHALL exist
- AND plan data SHALL be accessed via a `planRepository` port parameter

#### Scenario: All 6 ports are typed interfaces

- GIVEN `exportData.ts` function signature
- WHEN inspecting the parameters
- THEN all 6 parameters SHALL be typed with interfaces from `@application/ports/`
- AND NO parameter SHALL be typed as `StoreSnapshot` or `{ getState(): any }`
