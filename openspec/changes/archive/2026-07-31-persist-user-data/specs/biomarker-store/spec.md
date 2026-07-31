# Biomarker Store Specification

## Purpose

Persisted Zustand store holding `glucoseHistory: GlucoseReading[]` and `weightHistory: WeightReading[]`. Replaces module-level arrays in `biomarkerTrackingService.ts`. Survives page refresh.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Store MUST persist `glucoseHistory` and `weightHistory` via `zustand/persist` | MUST |
| R2 | Store SHALL expose `recordGlucose`, `recordWeight`, `getTrend`, `detectIMCThresholdCrossing`, and `resetBiomarkerHistory` | SHALL |
| R3 | `getTrend()` MUST match existing behavior: 7-day glucose avg, 7-day weight avg, 30-day weight slope | MUST |
| R4 | Offline-first: no network access. All data stays in localStorage. | MUST |

### R1: Persisted Biomarker State

`glucoseHistory` and `weightHistory` SHALL use `zustand/persist` middleware with `localStorage`. State MUST rehydrate on page load.

#### Scenario: Biomarker data survives refresh

- GIVEN `recordGlucose({ value: 110, timestamp: t, context: 'fasting' })` and `recordWeight(80, 170)` have been called
- WHEN the page is refreshed
- THEN `glucoseHistory` SHALL contain the recorded glucose entry
- AND `weightHistory` SHALL contain the recorded weight entry

#### Scenario: Empty store on first load

- GIVEN no prior localStorage data
- WHEN the store initializes
- THEN `glucoseHistory` SHALL be `[]` and `weightHistory` SHALL be `[]`

### R2: Service Function Parity

The store SHALL expose the same function signatures currently in `biomarkerTrackingService.ts`. Actions SHALL delegate to store state, not module arrays.

#### Scenario: recordGlucose pushes to store

- GIVEN `glucoseHistory` has 1 entry
- WHEN `recordGlucose({ value: 95, timestamp: t, context: 'fasting' })` is called
- THEN `glucoseHistory` SHALL have 2 entries, latest value = 95

#### Scenario: resetBiomarkerHistory clears both arrays

- GIVEN `glucoseHistory` has 3 entries and `weightHistory` has 2 entries
- WHEN `resetBiomarkerHistory()` is called
- THEN both arrays SHALL be empty

### R3: Trend Computation

`getTrend()` MUST compute from store arrays, identical to current module-array logic.

#### Scenario: Trend with sufficient data

- GIVEN 7 glucose readings in 7 days and 3 weight readings in 30 days
- WHEN `getTrend()` is called
- THEN `glucoseAvg7d` SHALL be non-null, `weightTrend` SHALL be computed

### R4: Offline-First

No network requests in any store action. localStorage only.

#### Scenario: Works without internet

- GIVEN browser is offline
- WHEN store actions are called
- THEN all reads and writes SHALL succeed via localStorage
