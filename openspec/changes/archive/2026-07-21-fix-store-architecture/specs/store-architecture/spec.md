# Store Architecture Specification

## Purpose

Defines Zustand store placement rules per the Scope Rule (ADR-001) and per-feature store architecture (ADR-009 §92-104). This spec governs WHERE stores live, not WHAT they do — behavioral specs live in their respective domain specs.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Stores used by a single feature MUST live in that feature's directory | MUST |
| R2 | Stores used by 2+ features MUST live in `src/shared/stores/` | MUST |
| R3 | `shared/` MUST NOT import from any `@features/` path | MUST NOT |
| R4 | Relocated stores MUST preserve all existing APIs unchanged | MUST |
| R5 | The full test suite MUST pass after relocation | MUST |
| R6 | `pnpm typecheck` and `pnpm build` MUST succeed | MUST |

### R1: Feature-Scoped Store Placement

Stores with exactly one consumer feature MUST live in that feature's directory.

#### Scenario: activityStore moved to activity-tracker

- GIVEN `activityStore.ts` imports from `@features/activity-tracker/types`
- AND only `activity-tracker` feature and `nudge-engine` (valid downstream dependency) reference it
- WHEN the refactor is complete
- THEN `activityStore.ts` MUST exist at `src/features/activity-tracker/activityStore.ts`
- AND `src/shared/stores/activityStore.ts` MUST NOT exist

#### Scenario: planStore moved to recipe-engine

- GIVEN `planStore.ts` imports from `@features/recipe-engine/services/planGenerator`
- AND only `recipe-engine` feature references it
- WHEN the refactor is complete
- THEN `planStore.ts` MUST exist at `src/features/recipe-engine/planStore.ts`
- AND `planStore.test.ts` MUST exist at `src/features/recipe-engine/planStore.test.ts`
- AND `src/shared/stores/planStore.ts` MUST NOT exist

### R2: Shared Store Retention

Stores with 2+ feature consumers MUST remain in `shared/stores/`.

#### Scenario: trackerStore and logStore stay in shared

- GIVEN `trackerStore.ts` is used by `metabolic-tracker`, `recipe-engine`, `med-diet-validator`, and `nudge-engine`
- AND `logStore.ts` is used by `nutritional-traffic-light`, `med-diet-validator`, and `nudge-engine`
- WHEN the refactor is complete
- THEN both files MUST remain at `src/shared/stores/trackerStore.ts` and `src/shared/stores/logStore.ts`

### R3: Import Direction Integrity

No file in `src/shared/` MUST import from `@features/`.

#### Scenario: Zero reverse dependencies after refactor

- GIVEN a grep for `from.*@features` in `src/shared/`
- WHEN the refactor is complete
- THEN the result MUST be empty

### R4: API Preservation

Relocated stores MUST expose the same hooks, functions, constants, and types.

#### Scenario: activityStore API unchanged

- GIVEN `activityStore` currently exports `useActivityStore` and `DEFAULT_WEEKLY_GOAL`
- WHEN the store is relocated to `features/activity-tracker/`
- THEN those exports MUST remain identical in name, signature, and behavior

#### Scenario: planStore API unchanged

- GIVEN `planStore` currently exports `usePlanStore`
- WHEN the store is relocated to `features/recipe-engine/`
- THEN the export MUST remain identical in name, signature, and behavior

#### Scenario: feature barrels preserve public API

- GIVEN `features/activity-tracker/index.ts` currently re-exports `useActivityStore` and `DEFAULT_WEEKLY_GOAL`
- WHEN the store moves inside the feature
- THEN the barrel MUST re-export from the local store file (not from `@shared/stores`)

### R5: Regression Guarantee

The full test suite MUST pass with zero failures.

#### Scenario: All tests pass

- GIVEN the test suite contains 42 test files (~395 unit tests)
- WHEN `pnpm test:run` executes
- THEN every test MUST pass
- AND no test files besides `planStore.test.ts` SHALL change location

### R6: Build Integrity

Typecheck and production build MUST succeed.

#### Scenario: Typecheck clean

- GIVEN the refactor is applied
- WHEN `pnpm typecheck` executes
- THEN zero type errors SHALL be reported

#### Scenario: Build succeeds

- GIVEN the refactor is applied
- WHEN `pnpm build` executes
- THEN the build MUST complete without errors
