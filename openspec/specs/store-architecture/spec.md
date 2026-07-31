# Store Architecture Specification

## Purpose

Defines Zustand store placement rules per the Scope Rule (ADR-001) and per-feature store architecture (ADR-009 §92-104). This spec governs WHERE stores live, not WHAT they do — behavioral specs live in their respective domain specs.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Stores used by a single feature MUST live in that feature's directory; stores with 2+ consumers are NOT feature-scoped | MUST |
| R2 | Stores used by 2+ features MUST live in `src/shared/stores/` | MUST |
| R3 | `shared/` MUST NOT import from any `@features/` path | MUST NOT |
| R4 | Relocated stores MUST preserve all existing APIs unchanged | MUST |
| R5 | The full test suite MUST pass after relocation | MUST |
| R6 | `pnpm typecheck` and `pnpm build` MUST succeed | MUST |
| R7 | Stores moved to shared MUST have a feature barrel re-exporting from `@shared/stores/` for backward compatibility | MUST |
| R8 | Lint and typecheck MUST block any `@features/` import within `src/shared/` | MUST |

### R1: Feature-Scoped Store Placement

Stores with exactly one consumer feature MUST live in that feature's directory. PlanStore has 2+ consumers and is therefore NOT feature-scoped.

#### Scenario: planStore is now a shared store

- GIVEN `planStore.ts` is consumed by `recipe-engine` (feature) and `useExportData` (shared hook)
- WHEN the refactor is complete
- THEN `planStore.ts` MUST exist at `src/shared/stores/planStore.ts`
- AND the barrel at `src/features/recipe-engine/planStore.ts` SHALL re-export from shared
- AND `src/shared/stores/planStore.ts` MUST NOT import from `@features/`

#### Scenario: activityStore stays in feature

- GIVEN `activityStore.ts` has exactly one consumer feature (`activity-tracker`)
- WHEN the refactor is complete
- THEN `activityStore.ts` MUST exist at `src/features/activity-tracker/activityStore.ts`

### R2: Shared Store Retention

Stores with 2+ feature consumers MUST remain in `shared/stores/`.

#### Scenario: planStore added to shared

- GIVEN `planStore.ts` is consumed by `recipe-engine` (generates weekly plan) AND `useExportData` (exports all store state)
- AND data-export is in `shared/hooks/` — a second consumer
- WHEN the refactor is complete
- THEN `planStore.ts` MUST exist at `src/shared/stores/planStore.ts`
- AND `recipe-engine` SHALL import planStore from `@shared/stores`

#### Scenario: trackerStore and logStore stay in shared

- GIVEN `trackerStore.ts` is used by 4+ features
- AND `logStore.ts` is used by 3+ features
- WHEN the refactor is complete
- THEN both files SHALL remain at `src/shared/stores/`

### R3: Import Direction Integrity

No file in `src/shared/` MUST import from `@features/`. This includes stores, hooks, services, and utilities.

#### Scenario: Zero reverse dependencies after refactor

- GIVEN a grep for `from.*@features` in `src/shared/`
- WHEN the refactor is complete
- THEN the result MUST be empty

#### Scenario: useExportData imports planStore from shared

- GIVEN `useExportData.ts` is in `src/shared/hooks/`
- WHEN it needs planStore state
- THEN it SHALL import `usePlanStore` from `@shared/stores/planStore`
- AND the import SHALL NOT reference `@features/recipe-engine`

### R4: API Preservation

Relocated stores MUST expose the same hooks, functions, constants, and types.

#### Scenario: planStore API unchanged

- GIVEN `planStore` exports `usePlanStore`, `generatePlan`, and `setRestrictionActive`
- WHEN the store is relocated to `src/shared/stores/planStore.ts`
- THEN those exports SHALL remain identical in name, signature, and behavior
- AND the barrel at `features/recipe-engine/planStore.ts` SHALL re-export the same API

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

### R7: Feature Barrel Re-Export for Backward Compatibility

When a store moves from feature-local to shared (2+ consumers), the original feature barrel file MUST re-export from `@shared/stores/` for backward compatibility.

#### Scenario: planStore barrel at recipe-engine

- GIVEN `planStore.ts` now lives at `src/shared/stores/planStore.ts`
- WHEN `features/recipe-engine/planStore.ts` exists
- THEN it MUST re-export `usePlanStore` and all public API from `@shared/stores/planStore`
- AND existing consumers importing from `@features/recipe-engine/planStore` SHALL resolve correctly

#### Scenario: New consumers import from shared

- GIVEN a new hook in `src/shared/hooks/` needs planStore
- WHEN the import is written
- THEN it MUST use `@shared/stores/planStore` (NOT `@features/recipe-engine`)

### R8: Lint Enforcement for Import Direction

The `no-restricted-imports` lint rule MUST block any import from `@features/` within `src/shared/`.

#### Scenario: Shared → Feature import fails lint

- GIVEN a developer adds `import { ... } from '@features/recipe-engine'` in a file under `src/shared/`
- WHEN `pnpm lint` executes
- THEN lint SHALL fail with a clear error message

#### Scenario: Shared → Feature import fails typecheck

- GIVEN a file under `src/shared/` imports from `@features/`
- WHEN `pnpm typecheck` executes
- THEN it SHALL fail (import path resolution blocked)
