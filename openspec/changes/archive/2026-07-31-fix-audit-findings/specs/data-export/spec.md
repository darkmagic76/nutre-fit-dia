# Delta for Data Export

## MODIFIED Requirements

### Requirement: R2 — Data Aggregation (Updated Import Path)

`exportAllData()` MUST call `getState()` on trackerStore, logStore, nudgeStore, activityStore, planStore, and biomarkerStore. `usePlanStore` MUST be imported from `@shared/stores/planStore` (not `@features/recipe-engine/planStore`).

(Previously: planStore imported from `@features/recipe-engine` — this violated the Scope Rule since useExportData is in shared/)

#### Scenario: All stores included

- GIVEN trackerStore has weight=80, planStore has a 7-day plan
- WHEN `exportAllData()` is called
- THEN JSON SHALL contain `tracker.weight: "80"`, `plan.weeklyPlan` with plan data, and `exportedAt`

#### Scenario: Export format unchanged after refactor

- GIVEN all stores have data
- WHEN `exportData` is called
- THEN the JSON output structure SHALL match the pre-refactor format exactly
- AND all six top-level keys (`tracker`, `log`, `nudge`, `activity`, `plan`, `biomarkerHistory`) SHALL be present

#### Scenario: Empty stores produce valid JSON

- GIVEN all stores are at defaults
- WHEN `exportAllData()` is called
- THEN JSON SHALL be valid with all six top-level keys present

### Requirement: R1 — Hook API (Updated Import)

`useExportData()` SHALL import `usePlanStore` from `@shared/stores/planStore`. The hook API (`{ exportAllData, isExporting }`) SHALL remain unchanged.

(Previously: imported planStore from `@features/recipe-engine`)

#### Scenario: Hook returns export function

- GIVEN `useExportData()` is called in a component
- WHEN the component renders
- THEN `exportAllData` SHALL be a callable function
- AND `isExporting` SHALL be `false`
