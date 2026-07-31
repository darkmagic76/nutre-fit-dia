# Data Export Specification

## Purpose

`useExportData()` hook — aggregates all store states into a JSON blob and triggers a browser download. Zero dependencies. All data stays on-device.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | `useExportData()` MUST return `exportAllData()` function; `usePlanStore` MUST be imported from `@shared/stores/planStore` | MUST |
| R2 | `exportAllData()` MUST aggregate all persisted stores into one JSON object | MUST |
| R3 | Exported JSON MUST trigger a browser download via `Blob` + `<a download>` | MUST |
| R4 | Offline-first: export MUST work without internet | MUST |

### R1: Hook API

`useExportData()` SHALL return `{ exportAllData, isExporting }` where `isExporting` is `true` during serialization. `useExportData()` SHALL import `usePlanStore` from `@shared/stores/planStore`. The hook API (`{ exportAllData, isExporting }`) SHALL remain unchanged.

#### Scenario: Hook returns export function

- GIVEN `useExportData()` is called in a component
- WHEN the component renders
- THEN `exportAllData` SHALL be a callable function
- AND `isExporting` SHALL be `false`

### R2: Data Aggregation

`exportAllData()` MUST call `getState()` on trackerStore, logStore, nudgeStore, activityStore, planStore, and biomarkerStore. `usePlanStore` MUST be imported from `@shared/stores/planStore` (not `@features/recipe-engine/planStore`). Output SHALL include `tracker`, `log`, `nudge`, `activity`, `plan`, `biomarkerHistory`, and `exportedAt` (ISO timestamp).

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

### R3: Browser Download

`exportAllData()` MUST create a `Blob` with MIME type `application/json`, generate an object URL, create an `<a>` element with `download="nutrifit-export-{date}.json"`, trigger click, and revoke the URL.

#### Scenario: Download triggered

- GIVEN `exportAllData()` is called
- WHEN the Blob is created and linked
- THEN browser SHALL initiate a file download
- AND the filename SHALL match pattern `nutrifit-export-YYYY-MM-DD.json`

### R4: Offline-First

Export uses `Blob`, `URL.createObjectURL`, and DOM APIs — no server interaction.
