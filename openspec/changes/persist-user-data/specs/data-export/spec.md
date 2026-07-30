# Data Export Specification

## Purpose

`useExportData()` hook — aggregates all store states into a JSON blob and triggers a browser download. Zero dependencies. All data stays on-device.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | `useExportData()` MUST return `exportAllData()` function | MUST |
| R2 | `exportAllData()` MUST aggregate all persisted stores into one JSON object | MUST |
| R3 | Exported JSON MUST trigger a browser download via `Blob` + `<a download>` | MUST |
| R4 | Offline-first: export MUST work without internet | MUST |

### R1: Hook API

`useExportData()` SHALL return `{ exportAllData, isExporting }` where `isExporting` is `true` during serialization.

#### Scenario: Hook returns export function

- GIVEN `useExportData()` is called in a component
- WHEN the component renders
- THEN `exportAllData` SHALL be a callable function

### R2: Data Aggregation

`exportAllData()` MUST call `getState()` on trackerStore, logStore, nudgeStore, activityStore, planStore, and biomarkerStore. Output SHALL include `tracker`, `log`, `nudge`, `activity`, `plan`, `biomarkerHistory`, and `exportedAt` (ISO timestamp).

#### Scenario: All stores included

- GIVEN trackerStore has weight=80, logStore has 3 food items
- WHEN `exportAllData()` is called
- THEN JSON SHALL contain `tracker.weight: "80"`, `log.todayLog` with 3 items, and `exportedAt`

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
