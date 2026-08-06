# Delta for Data Export

## ADDED Requirements

### Requirement: Use Case Extraction

`application/use-cases/exportData.ts` MUST contain the data aggregation and download logic as a pure function receiving repository ports. `useExportData()` hook SHALL become a thin React wrapper that calls the use case.

#### Scenario: Use case independent of React and stores

- GIVEN `exportData` use case source
- WHEN inspecting imports
- THEN zero imports from `react`, `zustand`, `@features/*`, or `@infrastructure/stores/*` SHALL exist
- AND it SHALL accept 6 repository ports as parameters

#### Scenario: Scope Rule violation fixed

- GIVEN `exportData` use case source
- WHEN inspecting imports
- THEN zero imports from `@features/recipe-engine` SHALL exist
- AND plan data SHALL be accessed via a `planRepository` port parameter

## MODIFIED Requirements

### R1: Hook API

`useExportData()` SHALL return `{ exportAllData, isExporting }` where `isExporting` is `true` during serialization. The hook SHALL delegate to the `exportData` use case, passing repository ports obtained via the composition root. The hook API (`{ exportAllData, isExporting }`) SHALL remain unchanged.

(Previously: `useExportData()` SHALL return `{ exportAllData, isExporting }` where `isExporting` is `true` during serialization. `useExportData()` SHALL import `usePlanStore` from `@shared/stores/planStore`. The hook API (`{ exportAllData, isExporting }`) SHALL remain unchanged.)

#### Scenario: Hook returns export function (unchanged)

- GIVEN `useExportData()` is called in a component
- WHEN the component renders
- THEN `exportAllData` SHALL be a callable function
- AND `isExporting` SHALL be `false`

### R2: Data Aggregation

`exportAllData()` SHALL call `getState()` on trackerStore, logStore, nudgeStore, activityStore, planStore, and biomarkerStore via repository ports. Output SHALL include `tracker`, `log`, `nudge`, `activity`, `plan`, `biomarkerHistory`, and `exportedAt` (ISO timestamp).

(Previously: `exportAllData()` MUST call `getState()` on trackerStore, logStore, nudgeStore, activityStore, planStore, and biomarkerStore. `usePlanStore` MUST be imported from `@shared/stores/planStore` (not `@features/recipe-engine/planStore`). Output SHALL include `tracker`, `log`, `nudge`, `activity`, `plan`, `biomarkerHistory`, and `exportedAt` (ISO timestamp).)

#### Scenario: All stores included (unchanged)

- GIVEN trackerStore has weight=80, planStore has a 7-day plan
- WHEN `exportAllData()` is called
- THEN JSON SHALL contain `tracker.weight: "80"`, `plan.weeklyPlan` with plan data, and `exportedAt`

#### Scenario: Export format unchanged after refactor (unchanged)

- GIVEN all stores have data
- WHEN `exportData` is called
- THEN the JSON output structure SHALL match the pre-refactor format exactly
- AND all six top-level keys SHALL be present

#### Scenario: Empty stores produce valid JSON (unchanged)

- GIVEN all stores are at defaults
- WHEN `exportAllData()` is called
- THEN JSON SHALL be valid with all six top-level keys present
