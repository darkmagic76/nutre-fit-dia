# Delta for Store Architecture

## ADDED Requirements

### Requirement: Feature Barrel Re-Export for Backward Compatibility

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

### Requirement: Lint Enforcement for Import Direction

The `no-restricted-imports` lint rule MUST block any import from `@features/` within `src/shared/`.

#### Scenario: Shared → Feature import fails lint

- GIVEN a developer adds `import { ... } from '@features/recipe-engine'` in a file under `src/shared/`
- WHEN `pnpm lint` executes
- THEN lint SHALL fail with a clear error message

#### Scenario: Shared → Feature import fails typecheck

- GIVEN a file under `src/shared/` imports from `@features/`
- WHEN `pnpm typecheck` executes
- THEN it SHALL fail (import path resolution blocked)

## MODIFIED Requirements

### Requirement: R1 — Feature-Scoped Store Placement

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

### Requirement: R2 — Shared Store Retention

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

### Requirement: R3 — Import Direction Integrity

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

### Requirement: R4 — API Preservation (Updated)

Relocated stores MUST expose the same hooks, functions, constants, and types.

#### Scenario: planStore API unchanged

- GIVEN `planStore` exports `usePlanStore`, `generatePlan`, and `setRestrictionActive`
- WHEN the store is relocated to `src/shared/stores/planStore.ts`
- THEN those exports SHALL remain identical in name, signature, and behavior
- AND the barrel at `features/recipe-engine/planStore.ts` SHALL re-export the same API
