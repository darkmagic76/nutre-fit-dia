# Delta for Store Architecture

## MODIFIED Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Stores used by a single feature MUST live in that feature's directory; stores with 2+ consumers are NOT feature-scoped | MUST |
| R2 | Stores used by 2+ features MUST live in `src/infrastructure/stores/` (was `src/shared/stores/`) | MUST |
| R3 | `application/` MUST import from ports, not from stores directly | MUST |

### R1: Feature-Scoped Store Placement (unchanged)

Stores with exactly one consumer feature MUST live in that feature's directory. PlanStore has 2+ consumers and is therefore NOT feature-scoped.

#### Scenario: planStore is now an infrastructure store

- GIVEN `planStore.ts` is consumed by `recipe-engine` (feature) and `useExportData` (shared hook)
- WHEN the refactor is complete
- THEN `planStore.ts` MUST exist at `src/infrastructure/stores/planStore.ts`
- AND the barrel at `src/features/recipe-engine/planStore.ts` SHALL re-export from infrastructure

#### Scenario: activityStore stays in feature (unchanged)

- GIVEN `activityStore.ts` has exactly one consumer feature (`activity-tracker`)
- WHEN the refactor is complete
- THEN `activityStore.ts` MUST exist at `src/features/activity-tracker/activityStore.ts`

### R2: Shared Store Retention → Infrastructure Stores

Stores with 2+ feature consumers MUST live in `src/infrastructure/stores/`.

(Previously: Stores with 2+ feature consumers MUST remain in `shared/stores/`.)

#### Scenario: trackerStore and logStore in infrastructure

- GIVEN `trackerStore.ts` is used by 4+ features
- AND `logStore.ts` is used by 3+ features
- WHEN the refactor is complete
- THEN both files SHALL exist at `src/infrastructure/stores/`

#### Scenario: planStore in infrastructure

- GIVEN `planStore.ts` is consumed by `recipe-engine` AND `useExportData`
- WHEN the refactor is complete
- THEN `planStore.ts` MUST exist at `src/infrastructure/stores/planStore.ts`

### R3: Application Consumes Ports, Not Stores

`application/use-cases/` MUST import from `application/ports/`, not from store modules. Use cases SHALL receive ports as parameters. This extends the original R3 (shared/ MUST NOT import from @features/) to the new application layer.

(Previously: `shared/` MUST NOT import from any `@features/` path.)

#### Scenario: Use cases import ports, not stores

- GIVEN any file under `src/application/use-cases/`
- WHEN inspecting imports
- THEN zero imports from `@infrastructure/stores` or `@shared/stores` SHALL exist
- AND all data access SHALL go through port interfaces

#### Scenario: Application → Infrastructure import blocked

- GIVEN `application/use-cases/exportData.ts`
- WHEN inspecting imports
- THEN zero imports from `@infrastructure/stores/*` SHALL exist
- AND a lint rule SHALL block such imports
